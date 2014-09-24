<?php
require_once('../../config.php');
require("../../Tar.php");

exit;

$dbid = isset($_GET['dbid']) ? $_GET['dbid'] : '72405013743';

$log = array();
$log[] = '[' . date('Y-m-d h:m:s') . ']' . ' station nsrdb recording update starting for station ' . $dbid;
while ( file_exists( 'data_file_cache/online/nsrdb/' . $dbid . '.nsrdb.lock' ) && filesize( 'data_file_cache/online/nsrdb/' . $dbid . '.nsrdb.lock' ) > 0 && filemtime( 'data_file_cache/online/nsrdb/' . $dbid . '.nsrdb.lock' ) > strtotime( '-' . ini_get('max_execution_time') . ' seconds' ) ) {
	$log[] = 'Pausing, update in progress for this station';
	usleep( 1000000 );
}
file_put_contents( 'data_file_cache/online/nsrdb/' . $dbid . '.nsrdb.lock' , 'WAT' );

// $base_dir = 'http://rredc.nrel.gov/solar/old_data/nsrdb/1991-2010/data/hourly';
$base_dir = 'http://rredc.nrel.gov/solar/old_data/nsrdb/1991-2010/targzs';
$station_data_download = substr($dbid, 0, 6) . '.tar.gz';

$data_files = array();
for ($year = 1991; $year <= 2010; $year++) {
	$data_files[$year] = substr($dbid, 0, 6) . '/' . substr($dbid, 0, 6) . '_' . $year . '_solar.csv';
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
$nsrdb_years = $station['nsrdb_years'];
$query = sprintf(
	'SELECT DISTINCT YEAR(date_recorded) AS year_recorded FROM recordings_nsrdb WHERE recordings_nsrdb.usafid = %u;',
	mysql_real_escape_string( $station['usafid'] )
);
$records = mysql_query($query);
$years_cached[] = array();
while ($records && $record = mysql_fetch_assoc($records)) {
	$years_cached[] = $record['year_recorded'];
}
$log[] = 'Queried years for existing recordings';
$downloaded = false;
$extracted = false;
foreach ($data_files as $year => $data_file) {
	if ((in_array($year, $years_cached) || (array_key_exists($year, $nsrdb_years) && isset($nsrdb_years[$year]['has_data'])))) {
		if ( !array_key_exists( $year , $nsrdb_years ) ) {
			// check if there is data for this year
			
			$nsrdb_years[(int) $year] = array(
				'has_data' => TRUE
			);
		}
		$log[] = 'Skipping year ' . $year;
		continue;
	}
	$log[] = 'Processing year ' . $year;
	
	// FIXME we should add an "age" parameter to the data so it can be occasionally re-checked since we're not 
	// doing any conditional error processing (i.e. what if it's a timeout and not a 404?)
	$nsrdb_years[(int) $year] = array(
		'has_data' => NULL
	);
	
	if (!$downloaded && (!file_exists('data_file_cache/online/nsrdb/'.$station_data_download) || @filesize('data_file_cache/online/nsrdb/'.$data_file.'.gz') == 0)) {
		$log[] = 'Retrieving file ' . $station_data_download;
		if (!file_put_contents('data_file_cache/online/nsrdb/'.$station_data_download, @file_get_contents($base_dir.'/'.$station_data_download))) {
			$headers = get_headers( $base_dir . '/' . $station_data_download );
			$status = explode( ' ' , $headers[0] );
			if ( $status != 200 ) {
				$nsrdb_years[(int) $year]['has_data'] = FALSE;
			}
			$log[] = 'Failed to retreive file';
			continue;
		}
		$downloaded = TRUE;
	}
	
	if ( $downloaded && !$extracted ) {
		if ( ( $tar = new Archive_Tar( 'data_file_cache/online/nsrdb/' . $station_data_download ) ) === FALSE ) {
			$log[] = 'Unable to open data archive';
			continue;
		} else {
			$log[] = 'Extracting station archive into individual data files';
			if ( !$tar->extract( 'data_file_cache/online/nsrdb/' ) ) {
				$log[] = 'Unable to extract data archive';
				continue;
			}
			$extracted = TRUE;
		}
	}
	
	if ( ($readings = @file( 'data_file_cache/online/nsrdb/'.$data_file , FILE_IGNORE_NEW_LINES|FILE_SKIP_EMPTY_LINES )) === FALSE ) {
		$nsrdb_years[(int) $year]['has_data'] = FALSE;
		$log[] = 'No data file exists for this year.';
		continue;
	}
	// remove header row
	array_shift($readings);
	
	$log[] = 'parsing file ' . $data_file;
	$data = array();
	foreach ($readings as $reading) {
		$reading = explode(',',$reading);
		// skip rows that have no recorded data (i.e. the sun was not yet up)
		if ($reading[2] == '99.0' && $reading[3] == '-99.0') { continue; }
		$data[] = array(
			'usafid' => substr( $dbid , 0 , 6 ),
			'date_recorded' => date('Y-m-d H:m:s', strtotime((string)$reading[0].' '.(string)$reading[1])),
			'zenith' => ($reading[2] == '99.0' ? NULL : (float)$reading[2]),
			'azimuth' => ($reading[3] == '-99.0' ? NULL : (float)$reading[3]),
			'etr' => (int)$reading[4],
			'etrn' => (int)$reading[5],
			'metstat_h' => (int)$reading[15],
			'metstat_n' => (int)$reading[17],
			'metstat_d' => (int)$reading[19],
			'metstat_clear_h' => (int)$reading[21],
			'metstat_clear_n' => (int)$reading[23],
			'metstat_clear_d' => (int)$reading[25],
			'measured_h' => (int)$reading[27],
			'measured_n' => (int)$reading[29],
			'measured_d' => (int)$reading[31]
		);
	}
	
	if ( count( $data ) == 0 ) {
		$nsrdb_years[(int) $year]['has_data'] = FALSE;
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
		$query = 'INSERT IGNORE INTO recordings_nsrdb (' . implode(',',array_keys($data[0])) . ') VALUES ' . implode(',',$query_data) . ';';
		$log[] = 'Inserting data into database';
		if (!mysql_query($query) || !mysql_affected_rows() > 0) {
			$log[] = 'There was an error adding the data to the database (' . mysql_error() . ')';
		}
		// FIXME: MySQL is reporting the insert complete before the data is ready for SELECT (possibly-related bug: http://bugs.mysql.com/bug.php?id=36618)
		// This results in null results when data should be available. Could also try LOCK recordings WRITE/UNLOCK WRITE to force MySQL to wait for insert visibility.
		usleep(250000);
		$nsrdb_years[(int) $year]['has_data'] = TRUE;
	} else {
		$log[] = 'There were no recordings to cache.';
	}
}

if ($downloaded) {
	$log[] = 'Removing cached data files';
	if (!(unlink('data_file_cache/online/nsrdb/'.$station_data_download))) {
		$log[] = 'Unable to remove cached file: ' . 'data_file_cache/online/nsrdb/'.$station_data_download;
	}
	foreach (glob('data_file_cache/online/nsrdb/'.substr($dbid, 0, 6).'/*') as $file) {
		if (!(unlink($file))) {
			$log[] = 'Unable to remove cached file: ' . $file;
		}
	}
	if (!(rmdir('data_file_cache/online/nsrdb/'.substr($dbid, 0, 6)))) {
		$log[] = 'Unable to remove the cached file directory: ' . 'data_file_cache/online/nsrdb/'.substr($dbid, 0, 6);
	}
}

$query = sprintf(
	'UPDATE stations SET nsrdb_years = \'' . serialize($nsrdb_years) . '\' WHERE id = \'%s\';',
	mysql_real_escape_string($dbid)
);
$log[] = 'Updating nsrdb_years';
if (!mysql_query($query) || !mysql_affected_rows() > 0 && mysql_error()) {
	$log[] = 'There was an error updating the station information (' . mysql_error() . ')';
}


$log[] = '[' . date('Y-m-d h:m:s') . ']' . ' station recording update complete';

unlink( 'data_file_cache/online/nsrdb/' . $dbid . '.nsrdb.lock' );

// array_map('htmlentities', $log);
// echo '<ul> <li>' , nl2br(implode('</li> <li>', $log)) , '</li> </ul>';
// file_put_contents( 'recordings.log' , "\r\n\r\n".implode("\r\n", $log)."\r\n\r\n" , FILE_APPEND );
?>
