<?php
require_once('../../config.php');

$base_dir = 'ftp://ftp.ncdc.noaa.gov/pub/data/gsod';
$date_cutoff = time()-(28*24*60*60);
$dbid = isset($_GET['dbid']) ? $_GET['dbid'] : '72405013743';
$year_min = isset($_GET['year_min']) && is_numeric(trim($_GET['year_min'])) ? trim($_GET['year_min']) : date('Y', $date_cutoff);
$year_max = isset($_GET['year_max']) && is_numeric(trim($_GET['year_max'])) ? trim($_GET['year_max']) : date('Y', $date_cutoff);

$log = array();
$log[] = '[' . date('Y-m-d h:m:s') . ']' . ' station recording update starting for station ' . $dbid . ' (' . $year_min . '-' . $year_max . ')';
while ( file_exists( 'data_file_cache/online/gsod/' . $dbid . '.gsod.lock' ) && filesize( 'data_file_cache/online/gsod/' . $dbid . '.gsod.lock' ) > 0 && filemtime( 'data_file_cache/online/gsod/' . $dbid . '.gsod.lock' ) > strtotime( '-' . ini_get('max_execution_time') . ' seconds' ) ) {
	$log[] = 'Pausing, update in progress for this station';
	usleep( 1000000 );
}
file_put_contents( 'data_file_cache/online/gsod/' . $dbid . '.gsod.lock' , 'WAT' );

$data_files = array();
$data_files_usafid = array();
$data_files_wban = array();
for ($year = $year_min; $year <= $year_max; $year++) {
	$data_files[$year] = substr($dbid, 0, 6) . '-' . substr($dbid, -5) . '-' . $year . '.op';
	$data_files_usafid[$year] = substr($dbid, 0, 6) . '-99999-' . $year . '.op';
	$data_files_wban[$year] = '999999-' . substr($dbid, -5) . '-' . $year . '.op';
}

// FIXME: what's the fallback?
$query = 'SELECT * FROM `stations` WHERE stations.id = \'' . mysql_real_escape_string( $dbid ) . '\';';
if ( ( $recordset = mysql_query( $query ) ) !== false ) {
	if ( ( $record = mysql_fetch_assoc( $recordset ) ) !== false ) {
		$station = array(
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
$gsod_years = $station['gsod_years'];
$query = sprintf(
	'SELECT DISTINCT YEAR(date_recorded) AS year_recorded FROM recordings_gsod WHERE station_id = \'%s\';',
	mysql_real_escape_string($dbid)
);
$records = mysql_query($query);
$years_cached[] = array();
while ($records && $record = mysql_fetch_assoc($records)) {
	$years_cached[] = $record['year_recorded'];
}
$log[] = 'Queried years for existing recordings';

foreach ($data_files as $year => $data_file) {
	if ((in_array($year, $years_cached) || (array_key_exists($year, $gsod_years) && isset($gsod_years[$year]['has_data']))) && $year != date('Y', $date_cutoff)) {
		if ( !array_key_exists( $year , $gsod_years ) && $year != date( 'Y' , $date_cutoff ) ) {
			$gsod_years[(int) $year] = array(
				'has_data' => NULL
			);
		}
		$log[] = 'Skipping year ' . $year;
		continue;
	}
	$log[] = 'Processing year ' . $year;
	
	$last_recorded_date = NULL;
	$query = sprintf(
		'SELECT MAX(date_recorded) as last_recorded_date FROM recordings_gsod WHERE station_id = \'%s\' AND YEAR(date_recorded) = %u',
		mysql_real_escape_string($dbid),
		mysql_real_escape_string($year)
	);
	$log[] = 'Determining last recording cached for the year ' . $year;
	if (($recordings = mysql_query($query)) && mysql_num_rows($recordings) > 0) {
		$recording = mysql_fetch_assoc($recordings);
		$last_recorded_date = strtotime($recording['last_recorded_date']);
	}
	
	// FIXME we should add an "age" parameter to the data so it can be occasionally re-checked since we're not 
	// doing any conditional error processing (i.e. what if it's a timeout and not a 404?)
	$gsod_years[(int) $year] = array(
		'has_data' => NULL
	);
	
	if (!file_exists('data_file_cache/online/gsod/'.$data_file.'.gz') || filesize('data_file_cache/online/gsod/'.$data_file.'.gz') == 0) {
		$log[] = 'Retrieving file ' . $station_data_download;
		if (!file_put_contents('data_file_cache/online/gsod/'.$data_file.'.gz', @file_get_contents($base_dir.'/'.$year.'/'.$data_file.'.gz'))) {
			// let's see if station data exists with only a USAF ID
			if (!file_put_contents('data_file_cache/online/gsod/'.$data_file.'.gz', @file_get_contents($base_dir.'/'.$year.'/'.$data_files_usafid[$year].'.gz'))) {
				// let's see if station data exists with only a WBAN ID
				if (!file_put_contents('data_file_cache/online/gsod/'.$data_file.'.gz', @file_get_contents($base_dir.'/'.$year.'/'.$data_files_wban[$year].'.gz'))) {
					if ( !file_exists( $base_dir . '/' . $year . '/' . $data_file . '.gz' ) ) {
						$gsod_years[(int) $year]['has_data'] = FALSE;
					}
					$log[] = 'Failed to retreive file';
					continue;
				}
			}
		}
	}
	
	if (!file_exists('data_file_cache/online/gsod/'.$data_file) || filesize('data_file_cache/online/gsod/'.$data_file) == 0) {
		$log[] = 'Exploding archive' . $data_file . '.gz';
		if (!($data_file_contents_array = gzfile('data_file_cache/online/gsod/' . $data_file . '.gz'))) {
			$log[] = 'Unable to explode archive';
			continue;
		}
		$log[] = 'Writing data file ' . $data_file;
		if (!(file_put_contents('data_file_cache/online/gsod/'.$data_file, implode("\r\n", $data_file_contents_array)))) {
			$log[] = 'Unable to write data file';
			continue;
		}
	}
	
	$log[] = 'parsing file ' . $data_file;
	$readings = file('data_file_cache/online/gsod/'.$data_file , FILE_IGNORE_NEW_LINES|FILE_SKIP_EMPTY_LINES);
	// remove header row
	array_shift($readings);
	$data = array();
	foreach ($readings as $reading) {
		$data[] = array(
			'station_id' => (string)trim(substr($reading,0,6)).(string)trim(substr($reading,7,5)),
			'date_recorded' => strtotime((string)trim(substr($reading,14,4)).'-'.(string)trim(substr($reading,18,2)).'-'.(string)trim(substr($reading,20,2))),
			'temp' => (trim(substr($reading,24,6)) == '9999.9' ? NULL : (float)trim(substr($reading,24,6))),
			'temp_readings' => (int)trim(substr($reading,31,2)),
			'dewpoint' => (trim(substr($reading,35,6)) == '9999.9' ? NULL : (float)trim(substr($reading,35,6))),
			'dewpoint_readings' => (int)trim(substr($reading,42,2)),
			'pressuresl' => (trim(substr($reading,46,6)) == '9999.9' ? NULL : (float)trim(substr($reading,46,6))),
			'pressuresl_readings' => (int)trim(substr($reading,53,2)),
			'pressure' => (trim(substr($reading,57,6)) == '9999.9' ? NULL : (float)trim(substr($reading,57,6))),
			'pressure_readings' => (int)trim(substr($reading,64,2)),
			'visibility' => (trim(substr($reading,68,5)) == '999.9' ? NULL : (float)trim(substr($reading,68,5))),
			'visibility_readings' => (int)trim(substr($reading,74,2)),
			'wind_mean' => (trim(substr($reading,78,5)) == '999.9' ? NULL : (float)trim(substr($reading,78,5))),
			'wind_mean_readings' => (int)trim(substr($reading,84,2)),
			'wind_max' => (trim(substr($reading,88,5)) == '999.9' ? NULL : (float)trim(substr($reading,88,5))),
			'wind_gust' => (trim(substr($reading,95,5)) == '999.9' ? NULL : (float)trim(substr($reading,95,5))),
			'temp_max' => (trim(substr($reading,102,6)) == '9999.9' ? NULL : (float)trim(substr($reading,102,6))),
			'temp_max_flag' => (trim(substr($reading,108,1)) == '*' ? TRUE : FALSE),
			'temp_min' => (trim(substr($reading,110,6)) == '9999.9' ? NULL : (float)trim(substr($reading,110,6))),
			'temp_min_flag' => (trim(substr($reading,116,1)) == '*' ? TRUE : FALSE),
			'precipitation' => (trim(substr($reading,118,5)) == '99.99' ? NULL : (float)trim(substr($reading,118,5))),
			'precipitation_flag' => (string)trim(substr($reading,123,1)),
			'snow' => (trim(substr($reading,125,5)) == '999.9' ? NULL : (float)trim(substr($reading,125,5))),
			'i_fog' => (bool)trim(substr($reading,132,1)),
			'i_rain' => (bool)trim(substr($reading,133,1)),
			'i_snow' => (bool)trim(substr($reading,134,1)),
			'i_hail' => (bool)trim(substr($reading,135,1)),
			'i_thunder' => (bool)trim(substr($reading,136,1)),
			'i_tornado' => (bool)trim(substr($reading,137,1))
		);
	}
	
	if ( count( $data ) == 0 && $year != date( 'Y' , $date_cutoff ) ) {
		$gsod_years[(int) $year]['has_data'] = FALSE;
	}
	
	$log[] = 'Putting together database insert statement';
	$reading = NULL;
	$query_data = array();
	foreach ($data as $reading) {
		if (isset($last_recorded_date) && $reading['date_recorded'] <= $last_recorded_date) { continue; }
		foreach ($reading as $datapoint_name => &$datapoint) {
			if (!(is_numeric($datapoint) || is_bool($datapoint))) {
				if ($datapoint == '') {
					$datapoint = "NULL";
				} else {
					$datapoint = "'" . mysql_real_escape_string($datapoint) . "'";
				}
			} else {
				if (!isset($datapoint)) {
					$datapoint = "NULL";
				} elseif (strpos($datapoint_name, 'date') !== FALSE) {
					$datapoint = "'" . date('Y-m-d',$datapoint) . "'";
				} elseif (is_bool($datapoint)) {
					$datapoint = mysql_real_escape_string($datapoint?1:0);
				} else {
					$datapoint = mysql_real_escape_string($datapoint);
				}
			}
		}
		$query_data[] = "\r\n(" . implode(',',$reading) . ")";
	}
	if (count($query_data) > 0) {
		$query = 'INSERT IGNORE INTO recordings_gsod (' . implode(',',array_keys($data[0])) . ') VALUES ' . implode(',',$query_data) . ';';
		$log[] = 'Inserting data into database';
		if (!mysql_query($query) || !mysql_affected_rows() > 0) {
			$log[] = 'There was an error adding the data to the database (' . mysql_error() . ')';
		}
		// FIXME: MySQL is reporting the insert complete before the data is ready for SELECT (possibly-related bug: http://bugs.mysql.com/bug.php?id=36618)
		// This results in null results when data should be available. Could also try LOCK recordings WRITE/UNLOCK WRITE to force MySQL to wait for insert visibility.
		usleep(250000);
		$gsod_years[(int) $year]['has_data'] = TRUE;
	} else {
		$log[] = 'There were no recordings to cache.';
	}
	
	$log[] = 'Removing cached data files';
	foreach (glob('data_file_cache/online/gsod/'.$data_file.'*') as $file) {
		if (!(unlink($file))) {
			$log[] = 'Unable to remove cached file: ' . $file;
		}
	}
}

$query = sprintf(
	'UPDATE stations SET gsod_years = \'' . serialize($gsod_years) . '\' WHERE id = \'%s\';',
	mysql_real_escape_string($dbid)
);
$log[] = 'Updating gsod_years';
if (!mysql_query($query) || !mysql_affected_rows() > 0 && mysql_error()) {
	$log[] = 'There was an error updating the station information (' . mysql_error() . ')';
}


$log[] = '[' . date('Y-m-d h:m:s') . ']' . ' station recording update complete';

unlink( 'data_file_cache/online/gsod/' . $dbid . '.gsod.lock' );

array_map('htmlentities', $log);
echo '<ul> <li>' , nl2br(implode('</li> <li>', $log)) , '</li> </ul>';
// file_put_contents( 'recordings.log' , "\r\n\r\n".implode("\r\n", $log)."\r\n\r\n" , FILE_APPEND );
?>