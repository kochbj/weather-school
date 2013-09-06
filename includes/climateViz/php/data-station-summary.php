<?php
require_once('config.php');

$mid = (isset($_GET['mid']) ? trim($_GET['mid']) : NULL);
$lat = (isset($_GET['lat']) && is_numeric($_GET['lat']) ? trim($_GET['lat']) : NULL);
$lng = (isset($_GET['lng']) && is_numeric($_GET['lng']) ? trim($_GET['lng']) : NULL);
$num_stations = (isset($_GET['num_stations']) && is_numeric($_GET['num_stations']) ? (int) trim($_GET['num_stations']) : 5);
$doty = (isset($_GET['doty']) && strtotime($_GET['doty']) ? strtotime($_GET['doty']) : strtotime('2000-01-01'));

$data = array('query' => $_GET , 'results' => array());
$stations_gsod_ret = json_decode( file_get_contents( 'http://' . $_SERVER['HTTP_HOST'] . dirname($_SERVER['PHP_SELF']) . '/data-local-stations.php?mid=' . urlencode($mid) . '&lat=' . urlencode($lat) . '&lng=' . urlencode($lng) . '&num_stations=20&date_ranges[0][begin]=Jan+01+1995&date_ranges[0][end]=Dec+31+2005' ) , TRUE );
$stations_nsrdb_ret = json_decode( file_get_contents( 'http://' . $_SERVER['HTTP_HOST'] . dirname($_SERVER['PHP_SELF']) . '/data-local-stations.php?mid=' . urlencode($mid) . '&lat=' . urlencode($lat) . '&lng=' . urlencode($lng) . '&num_stations=20&has_nsrdb=1' ) , TRUE );
$stations_gsod = $stations_gsod_ret[0]['stations'];
$stations_nsrdb = $stations_nsrdb_ret[0]['stations'];

$station_gsod = NULL;
$avg_temp = NULL;
foreach ( $stations_gsod as $station_id => $station_meta ) {
	if ( isset( $station_gsod ) ) { break; }
	if ( array_key_exists( 'gsod_years' , $station_meta ) && is_array( $station_meta['gsod_years'] ) && count( $station_meta['gsod_years'] ) > 0 ) {
		$has_data = FALSE;
		for ( $year = 1995 ; $year <= 2006 ; $year++ ) {
			if ( $station_meta['gsod_years'][$year]['has_data'] ) {
				$has_data = TRUE;
				break;
			}
		}
		if ( !$has_data ) { continue; }
	}
	// FIXME can we check here to see if it's necessary to request a recordings update?
	//file_get_contents('http://' . $_SERVER['HTTP_HOST'] . dirname($_SERVER['PHP_SELF']) . '/data/noaa/recordings_gsod.php?dbid=' . urlencode($station_id) . '&year_min=1995&year_max=2005');
	$sql_stmt = 'SELECT AVG(temp) AS temp, AVG(temp_max) AS temp_max, AVG(temp_min) AS temp_min FROM recordings_gsod WHERE station_id = \'' . $station_id . '\' AND date_recorded >= \'1995-01-01\' AND date_recorded < \'2006-01-01\' AND date_recorded LIKE \'%-' . date('m-d', $doty) . '\' GROUP BY RIGHT(date_recorded, 5);';
	$recordset = mysql_query( $sql_stmt );
	if ( $recordset && mysql_num_rows( $recordset ) > 0 ) {
		$result = mysql_fetch_assoc( $recordset );
		$temp_avg = $result['temp'];
		$temp_max = $result['temp_max'];
		$temp_min = $result['temp_min'];
		$station_gsod = $station_id;
	}
}

$station_nsrdb = NULL;
$avg_energy = NULL;
foreach ( $stations_nsrdb as $station_id => $station_meta ) {
	// if the nearest NSRDB station is too far away, don't look for NSRDB data.
	if ( isset( $station_nsrdb ) || $station_meta['distance'] > 250 ) { break; }
	if ( array_key_exists( 'nsrdb_years' , $station_meta ) && is_array( $station_meta['nsrdb_years'] ) && count( $station_meta['nsrdb_years'] ) > 0 ) {
		$has_data = FALSE;
		for ( $year = 1995 ; $year <= 2006 ; $year++ ) {
			if ( $station_meta['nsrdb_years'][$year]['has_data'] ) {
				$has_data = TRUE;
				break;
			}
		}
		if ( !$has_data ) { continue; }
	}
	// FIXME can we check here to see if it's necessary to request a recordings update?
	//file_get_contents( 'http://' . $_SERVER['HTTP_HOST'] . dirname($_SERVER['PHP_SELF']) . '/data/noaa/recordings_nsrdb.php?dbid=' . urlencode($station_id) );
	$sql_stmt = 'SELECT SUM(metstat_h) AS energy FROM recordings_nsrdb WHERE usafid = ' . substr( $station_id , 0 , 6 ) . ' AND date_recorded >= \'1995-01-01\' AND date_recorded < \'2006-01-01\' AND date_recorded LIKE \'%-' . date('m-d', $doty) . ' %\' AND metstat_h <> -9900 GROUP BY SUBSTRING(date_recorded, 1, 10);';
	$recordset = mysql_query( $sql_stmt );
	if ( $recordset && mysql_num_rows( $recordset ) > 0 ) {
		$result = mysql_fetch_assoc( $recordset );
		$energy_vals = array();
		while ( $result = mysql_fetch_assoc( $recordset ) ) {
			$energy_vals[] = $result['energy'];
		}
		$avg_energy = count( $energy_vals ) > 0 ? ( array_sum( $energy_vals ) / count( $energy_vals ) ) : NULL;
		$station_nsrdb = $station_id;
	}
}

$data['results'][] = array(
	'mid' => $mid,
	'station' => array(
		'dbid'       => $station_gsod ,
		'elev'       => $stations_gsod[$station_gsod]['elev'] ,
		'temp_avg'   => $temp_avg ,
		'temp_max'   => $temp_max ,
		'temp_min'   => $temp_min ,
		'avg_energy' => $avg_energy
	)
);

echo (isset($_GET['callback']) ? $_GET['callback'].'('.json_encode($data).')' : json_encode($data));
exit();

?>