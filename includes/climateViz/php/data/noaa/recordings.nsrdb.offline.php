<?php
require_once('../../config.php');
// FIXME: use PharData (http://www.php.net/manual/en/book.phar.php)?
require("../../Tar.php");

$log = array();
$log[] = '[' . date('Y-m-d h:m:s') . ']' . ' nsrdb recording offline update starting';
while ( file_exists( 'data_file_cache/offline/nsrdb/nsrdb.offline.lock' ) && filesize( 'data_file_cache/offline/nsrdb/nsrdb.offline.lock' ) > 0 && filemtime( 'data_file_cache/offline/nsrdb/nsrdb.offline.lock' ) > strtotime( '-' . ini_get('max_execution_time') . ' seconds' ) ) {
	$log[] = 'Pausing, offline update in progress';
	usleep( 1000000 );
}
file_put_contents( 'data_file_cache/offline/nsrdb/nsrdb.offline.lock' , 'WAT' );

$log = array();

$log[] = 'Grabbing list of data file archives (.tar.gz)';
$data_files_archives = glob("data_file_cache/offline/nsrdb/*.tar.gz");

foreach ( $data_files_archives as $data_files_archive ) {
	$usafid = basename( $data_files_archive , '.tar.gz' );
	$log[] = 'Working with station ' . $usafid;
	$query = sprintf(
		'SELECT DISTINCT YEAR(date_recorded) AS year_recorded, nsrdb_years FROM recordings_nsrdb RIGHT JOIN stations ON recordings_nsrdb.usafid = stations.usafid WHERE stations.usafid = %d;',
		mysql_real_escape_string($usafid)
	);
	$records = mysql_query($query);
	$years_cached[] = array();
	$nsrdb_years = array();
	while ($records && $record = mysql_fetch_assoc($records)) {
		$years_cached[] = $record['year_recorded'];
		$nsrdb_years = (strlen($record['nsrdb_years']) > 0 ? unserialize($record['nsrdb_years']) : array());
	}
	$log[] = 'Queried years for existing recordings';
	
	$extracted = false;
	foreach ( range( 1991 , 2010 ) as $year ) {
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
		
		if ( !$extracted ) {
			if ( ( $tar = new Archive_Tar( $data_files_archive ) ) === FALSE ) {
				$log[] = 'Unable to open data archive';
				continue;
			} else {
				$log[] = 'Extracting station archive into individual data files';
				if ( !$tar->extract( 'data_file_cache' ) ) {
					$log[] = 'Unable to extract data archive';
					unset( $tar );
					continue;
				}
				unset( $tar );
				$extracted = TRUE;
			}
		}

		if ( ($readings = @file( 'data_file_cache/offline/nsrdb/' . $usafid . '/' . $usafid . '_' . $year . '_solar.csv' , FILE_IGNORE_NEW_LINES|FILE_SKIP_EMPTY_LINES )) === FALSE ) {
			$nsrdb_years[(int) $year]['has_data'] = FALSE;
			$log[] = 'No data file exists for this year.';
			continue;
		}
		// remove header row
		array_shift($readings);
		
		$log[] = 'parsing file ' . $usafid . '_' . $year . '_solar.csv';
		$data = array();
		foreach ($readings as $reading) {
			$reading = explode(',',$reading);
			// skip rows that have no recorded data (i.e. the sun was not yet up)
			if ($reading[2] == '99.0' && $reading[3] == '-99.0') { continue; }
			$data[] = array(
				'usafid' => $usafid,
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
	
	if ($extracted) {
		$log[] = 'Removing unarchived data files';
		foreach ( glob( 'data_file_cache/offline/nsrdb/' . $usafid . '/*' ) as $file ) {
			if (!(unlink($file))) {
				$log[] = 'Unable to remove cached file: ' . $file;
			}
		}
		if ( !( rmdir( 'data_file_cache/offline/nsrdb/' . $usafid ) ) ) {
			$log[] = 'Unable to remove the cached file directory: ' . 'data_file_cache/offline/nsrdb/' . $usafid;
		}
	}

	$query = sprintf(
		'UPDATE stations SET nsrdb_years = \'' . serialize($nsrdb_years) . '\' WHERE usafid = \'%s\';',
		mysql_real_escape_string($usafid)
	);
	$log[] = 'Updating nsrdb_years for station ' . $usafid;
	if (!mysql_query($query) || !mysql_affected_rows() > 0 && mysql_error()) {
		$log[] = 'There was an error updating the station information (' . mysql_error() . ')';
	}
}

unlink( 'data_file_cache/offline/nsrdb/nsrdb.offline.lock' );

$log[] = '[' . date('Y-m-d h:m:s') . ']' . ' nsrdb recordings offline update complete';
	
// array_map('htmlentities', $log);
// echo '<ul> <li>' , nl2br(implode('</li> <li>', $log)) , '</li> </ul>';
//file_put_contents( 'recordings.log' , "\r\n\r\n".implode("\r\n", $log)."\r\n\r\n" , FILE_APPEND );
?>