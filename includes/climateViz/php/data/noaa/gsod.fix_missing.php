<?php
//require_once('../../config.php');
define('DB_USER', 'root');
define('DB_PASSWD', 'pass');
define('DB_HOST', 'weatherschool.local' );
define('DB_SCHEMA', 'climate');

define('ADMIN_EMAIL', 'bsweeney@aaas.org');
define('ADMIN_NAME', 'Brian Sweeney');

define( 'APP_SECURITY_SALT' , 'FVQ#W%^U6yjnAWE$Ye5&KIuYHAW#G%U^i6KJ6rw45' );
define( 'APP_SECURITY_HASH' , PASSWORD_BCRYPT );
define( 'APP_SECURITY_HASH_COST' , 10 );

ini_set('display_errors',true);

$dbc = mysql_connect(DB_HOST, DB_USER, DB_PASSWD) OR trigger_error('Could not connect to mysql: ' . mysql_error() );

mysql_select_db(DB_SCHEMA) OR trigger_error('Could not select database: ' . mysql_error());

mysql_query("SET NAMES 'utf8'");

//ini_set('error_log','/Applications/XAMPP/xamppfiles/logs/php_error_log');


$year_begin = 1928;
$year_end = (int) date('Y') - 1;

$log = array();
$log[] = '[' . date( 'Y-m-d h:m:s' ) . ']' . ' station recording offline update starting';
while ( file_exists( 'data_file_cache/offline/gsod/gsod.offline.lock' ) && filesize( 'data_file_cache/offline/gsod/gsod.offline.lock' ) > 0 && filemtime( 'data_file_cache/offline/gsod/gsod.offline.lock' ) > strtotime( '-' . ini_get('max_execution_time') . ' seconds' ) ) {
	$log[] = 'Pausing, offline update in progress';
	usleep( 1000000 );
}
file_put_contents( 'data_file_cache/offline/gsod/gsod.offline.lock' , 'WAT' );

$log = array();

$log[] = 'Grabbing list of weather stations';
$query = 'SELECT * FROM `stations` WHERE `lattitude` <> -99.999 AND ID in (72348903935, 72330099999)  ORDER BY `usafid`, `wban`';
$stations = array( );
if ( ( $recordset = mysql_query( $query ) ) !== false ) {
	while ( ( $record = mysql_fetch_assoc( $recordset ) ) !== false ) {
		$stations[$record['id']] = array(
			'name'        => $record['name'],
			'dbid'        => $record['id'],
			'usafid'      => $record['usafid'],
			'wban'        => $record['wban'],
			'lat'         => $record['lattitude'],
			'lng'         => $record['longitude'],
			'elev'        => $record['elevation'],
			'begin'       => strtotime( $record['begin'] ),
			'end'         => strtotime( $record['begin'] ),
			'gsod_years'  => ( strlen($record['gsod_years'] ) > 0 ? unserialize( $record['gsod_years'] ) : array() ) ,
			'nsrdb_years' => unserialize( $record['nsrdb_years'] ),
			'data'        => array()
		);
	}
}
mysql_close($dbc);
foreach ( $stations as $station_id => $station_meta ) {
	echo array_shift($log) , "\r\n";
	$log[] = 'Working with station ' . $station_id;
	
	//$log[] = 'Grabbing list of data file archives for this station (.gz)'; NEED TO FIX
	$data_file_archives = glob( 'data_file_cache/offline/gsod/*/' . $station_meta['usafid'] . '-' . $station_meta['wban'] . '*.op.gz' );
	$dbc = mysql_connect( DB_HOST , DB_USER , DB_PASSWD ) OR trigger_error( 'Could not connect to mysql: ' . mysql_error( ) );
	mysql_select_db( DB_SCHEMA ) OR trigger_error( 'Could not select database: ' . mysql_error( ) );
	$query = sprintf(
		'SELECT MONTH(date_recorded) as month_recorded, YEAR(date_recorded) AS year_recorded FROM recordings_gsod WHERE recordings_gsod.station_id = \'%s\' GROUP BY MONTH(date_recorded), YEAR(date_recorded);',
		//'SELECT DISTINCT YEAR(date_recorded) AS year_recorded FROM recordings_gsod WHERE recordings_gsod.station_id = \'%s\';',
		mysql_real_escape_string( $station_id )
	);
	$records = mysql_query( $query );
	$years_cached[] = array( );
	$gsod_years = array( );
	while ( $records && $record = mysql_fetch_assoc( $records ) ) {
		if ( !in_array( $year, $years_cached ) )  {
			$years_cached[$record['year_recorded']] = array('has_data'=>null,'months'=>array());
		}
		$years_cached[$record['year_recorded']]['months'][] = (int) $month_recorded; 
	}
	//$log[] = 'Queried years for existing recordings';
	
	for ( $year = $year_begin ; $year <= $year_end ; $year++ ) {
		$working_data_file = 'data_file_cache/offline/gsod/' . $year . '/' . $station_meta['usafid'] . '-' . $station_meta['wban'] . '-' . $year . '.op';
		
		if ( array_key_exists( $year, $station_meta['gsod_years'] ) ) {
			if ( in_array( $year, $years_cached ) )  {
			//if ( !array_key_exists( $year , $station_meta['gsod_years'] ) ) {
				// check if there is data for this year
				$station_meta['gsod_years'][(int) $year] = array(
					'has_data' => TRUE,
					'months' => $years_cached[$year]['months']
				);
				$log[] = 'Found in both places for this station (' . $year . ') just updatind data structure';
				continue;
			}
			else {
				$station_meta['gsod_years'][(int) $year] = array(
					'has_data' => NULL,
					'months'=>array()
				);
			}
		}
		//$log[] = 'Processing year ' . $year;
		
		// FIXME we should add an "age" parameter to the data so it can be occasionally re-checked since we're not 
		// doing any conditional error processing (i.e. what if it's a timeout and not a 404?)
		if ( !in_array( $working_data_file . '.gz' , $data_file_archives ) ) {
			$station_meta['gsod_years'][(int) $year] = array(
			'has_data' => FALSE
			);
			$log[] = 'No data file for ' . $year . ' for this station';
			continue;
		}
		
		if ( !file_exists( $working_data_file ) || filesize( $working_data_file ) == 0 ) {
			//$log[] = 'Exploding archive ' . $working_data_file . '.gz';
			if ( !( $data_file_contents_array = gzfile( $working_data_file . '.gz' ) ) ) {
				$log[] = 'Unable to explode archive (' . $year . ')';
				continue;
			}
			//$log[] = 'Writing data file ' . $data_file;
			if ( !( file_put_contents( $working_data_file , implode( "\r\n" , $data_file_contents_array ) ) ) ) {
				$log[] = 'Unable to write data file (' . $year . ')';
				continue;
			}
		}
		
		//$log[] = 'parsing file ' . $working_data_file;
			$readings = file( $working_data_file , FILE_IGNORE_NEW_LINES|FILE_SKIP_EMPTY_LINES);
			// remove header row
			array_shift( $readings );
			$data = array( );
			foreach ( $readings as $reading ) {
				$data[] = array(
					'station_id'          => (string)trim(substr($reading,0,6)).(string)trim(substr($reading,7,5)),
					'date_recorded'       => strtotime((string)trim(substr($reading,14,4)).'-'.(string)trim(substr($reading,18,2)).'-'.(string)trim(substr($reading,20,2))),
					'temp'                => (trim(substr($reading,24,6)) == '9999.9' ? NULL : (float)trim(substr($reading,24,6))),
					'temp_readings'       => (int)trim(substr($reading,31,2)),
					'dewpoint'            => (trim(substr($reading,35,6)) == '9999.9' ? NULL : (float)trim(substr($reading,35,6))),
					'dewpoint_readings'   => (int)trim(substr($reading,42,2)),
					'pressuresl'          => (trim(substr($reading,46,6)) == '9999.9' ? NULL : (float)trim(substr($reading,46,6))),
					'pressuresl_readings' => (int)trim(substr($reading,53,2)),
					'pressure'            => (trim(substr($reading,57,6)) == '9999.9' ? NULL : (float)trim(substr($reading,57,6))),
					'pressure_readings'   => (int)trim(substr($reading,64,2)),
					'visibility'          => (trim(substr($reading,68,5)) == '999.9' ? NULL : (float)trim(substr($reading,68,5))),
					'visibility_readings' => (int)trim(substr($reading,74,2)),
					'wind_mean'           => (trim(substr($reading,78,5)) == '999.9' ? NULL : (float)trim(substr($reading,78,5))),
					'wind_mean_readings'  => (int)trim(substr($reading,84,2)),
					'wind_max'            => (trim(substr($reading,88,5)) == '999.9' ? NULL : (float)trim(substr($reading,88,5))),
					'wind_gust'           => (trim(substr($reading,95,5)) == '999.9' ? NULL : (float)trim(substr($reading,95,5))),
					'temp_max'            => (trim(substr($reading,102,6)) == '9999.9' ? NULL : (float)trim(substr($reading,102,6))),
					'temp_max_flag'       => (trim(substr($reading,108,1)) == '*' ? TRUE : FALSE),
					'temp_min'            => (trim(substr($reading,110,6)) == '9999.9' ? NULL : (float)trim(substr($reading,110,6))),
					'temp_min_flag'       => (trim(substr($reading,116,1)) == '*' ? TRUE : FALSE),
					'precipitation'       => (trim(substr($reading,118,5)) == '99.99' ? NULL : (float)trim(substr($reading,118,5))),
					'precipitation_flag'  => (string)trim(substr($reading,123,1)),
					'snow'                => (trim(substr($reading,125,5)) == '999.9' ? NULL : (float)trim(substr($reading,125,5))),
					'i_fog'               => (bool)trim(substr($reading,132,1)),
					'i_rain'              => (bool)trim(substr($reading,133,1)),
					'i_snow'              => (bool)trim(substr($reading,134,1)),
					'i_hail'              => (bool)trim(substr($reading,135,1)),
					'i_thunder'           => (bool)trim(substr($reading,136,1)),
					'i_tornado'           => (bool)trim(substr($reading,137,1))
				);
			}
			
			if ( count( $data ) == 0 ) {
				$station_meta['gsod_years'][(int) $year] = array(
				'has_data' => FALSE
			);
				continue;
			}
			
			//$log[] = 'Putting together database insert statement';
			$reading = NULL;
			$query_data = array();
			$months_cached=array();
			foreach ( $data as $reading ) {
				foreach ( $reading as $datapoint_name => &$datapoint ) {
					switch ( $datapoint_name ) {
						case 'date_recorded' :
							if (!in_array(intval(date('m', $datapoint)), $months_cached )) {$months_cached[] = intval(date('m', $datapoint)); }  
							echo intval(date('m', $datapoint));
							$datapoint = "'" . date( 'Y-m-d' , $datapoint ) . "'";
							break;
						default :
							if ( !isset( $datapoint ) || $datapoint == '' ) {
								$datapoint = "NULL";
							} elseif ( is_string( $datapoint ) ) {
								$datapoint = "'" . mysql_real_escape_string( $datapoint ) . "'";
							} elseif ( is_bool( $datapoint ) ) {
								$datapoint = mysql_real_escape_string( $datapoint ? 1 : 0 );
							} elseif ( is_numeric( $datapoint ) ) {
								$datapoint = mysql_real_escape_string( $datapoint );
							}
					}
				}
				$query_data[] = "\r\n(" . implode( ',' , $reading ) . ")";
			}
			if ( count( $query_data ) > 0 ) {
				$query = 'INSERT IGNORE INTO recordings_gsod (' . implode( ',' , array_keys( $data[0] ) ) . ') VALUES ' . implode( ',' , $query_data ) . ';';
				//$log[] = 'Inserting data into database';
				if ( !mysql_query( $query ) || !mysql_affected_rows( ) > 0 ) {
					$log[] = 'There was an error adding the data to the database (' . mysql_error() . ') (' . $year . ')';
				}
				// FIXME: MySQL is reporting the insert complete before the data is ready for SELECT (possibly-related bug: http://bugs.mysql.com/bug.php?id=36618)
				// This results in null results when data should be available. Could also try LOCK recordings WRITE/UNLOCK WRITE to force MySQL to wait for insert visibility.
				usleep( 250000 );
				$station_meta['gsod_years'][(int) $year]['has_data'] = TRUE;
				$station_meta['gsod_years'][(int) $year]['months'] = $months_cached;
			} else {
				$log[] = 'There were no recordings to cache (' . $year . ')';
			}
			
			//$log[] = 'Removing working data file';
			if ( !( unlink( $working_data_file ) ) ) {
				$log[] = 'Unable to remove data file: ' . $working_data_file . '(' . $year . ')';
			}
	}
	$query = sprintf(
		'UPDATE stations SET gsod_years = \'' . serialize( $station_meta['gsod_years'] ) . '\' WHERE id = \'%s\';',
		mysql_real_escape_string( $station_id )
	);
	$log[] = 'Updating gsod_years (' . $year . ')';
	if ( !mysql_query( $query ) || !mysql_affected_rows() > 0 && mysql_error() ) {
		$log[] = 'There was an error updating the station information (' . mysql_error() . ') (' . $year . ')';
	}
	mysql_close($dbc);
}

$log[] = '[' . date('Y-m-d h:m:s') . ']' . ' station recording update complete';

unlink( 'data_file_cache/offline/gsod/gsod.offline.lock' );

 array_map('htmlentities', $log);
echo '<ul> <li>' , nl2br(implode('</li> <li>', $log)) , '</li> </ul>';
file_put_contents( 'recordings.log' , "\r\n\r\n".implode("\r\n", $log)."\r\n\r\n" , FILE_APPEND );
?>
