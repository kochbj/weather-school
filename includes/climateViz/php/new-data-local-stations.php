<?php
require_once('config.php');

# Update the station list (though this should be part of some kind of cron script, rather than run every time 
# this script is accessed).
# Redirect stdout and stderr to /dev/null so that PHP won't wait for execution of the external script to end.
# See http://www.welldonesoft.com/technology/articles/php/forking/
# Note: this command does not work on Windows
exec('php ' . dirname(__FILE__) . '/data/noaa/stations.php > /dev/null 2>&1 &' , $output , $return );

$mid = (isset($_GET['mid']) ? trim($_GET['mid']) : NULL);
$lat = (isset($_GET['lat']) && is_numeric($_GET['lat']) ? trim($_GET['lat']) : NULL);
$lng = (isset($_GET['lng']) && is_numeric($_GET['lng']) ? trim($_GET['lng']) : NULL);
$num_stations = (isset($_GET['num_stations']) && is_numeric($_GET['num_stations']) ? (int) trim($_GET['num_stations']) : 5);
$date_ranges = (isset($_GET['date_ranges']) && is_array($_GET['date_ranges']) ? $_GET['date_ranges'] : array());
$has_nsrdb = (isset($_GET['has_nsrdb']) && $_GET['has_nsrdb'] == 1 ? TRUE : FALSE);

foreach ($date_ranges as $index => $date_range) {
	if (isset($date_ranges[$index]['begin']) && strtotime($date_ranges[$index]['begin']) && isset($date_ranges[$index]['end']) && strtotime($date_ranges[$index]['end'])) {
		$date_ranges[$index]['begin'] = strtotime($date_ranges[$index]['begin']);
		$date_ranges[$index]['end'] = strtotime($date_ranges[$index]['end']);
	} else {
		unset($date_ranges[$index]);
	}
}

$data = array();

// FIXME: limit to stations with data in the specified range (either in SQL or while setting up the data array) (?)

$query = 'SELECT `id` , `usafid` , `wban` , `lattitude` , `longitude` FROM `stations` WHERE `lattitude` <> -99.999 ';
$conditions = array();
if ($has_nsrdb) {
	$conditions[] = 'nsrdb = 1';
}
foreach ($date_ranges as $date_range) {
	$conditions[] = sprintf(
		'(`begin` <= \'%s\' AND `end` >= \'%s\')',
		mysql_real_escape_string(date('Y-m-d',$date_range['begin'])),
		mysql_real_escape_string(date('Y-m-d',$date_range['end']))
	);
}
if (count($conditions) > 0) {
	$query = $query . ' AND ' . implode(' AND ', $conditions);
}
$query = $query . ' ORDER BY `usafid`, `wban`';

$data_id = 'data/noaa/data_file_cache/stations/stations.'.md5($query);
while ( file_exists( $data_id.'.lock' ) && filesize( $data_id.'.lock' ) > 0 && filemtime( $data_id.'.lock' ) > strtotime( '-' . ini_get('max_execution_time') . ' seconds' ) ) {
	usleep( 1000000 );
}
if ( !file_exists( $data_id.'.data' ) || ( $stations = @unserialize( file_get_contents( $data_id.'.data' ) ) ) == FALSE ) {
	file_put_contents( $data_id.'.lock' , 'WAT' );
	$stations = array();
	if ($recordset = mysql_query($query)) {
		while ($record = mysql_fetch_assoc($recordset)) {
			$stations[$record['id']] = array(
				'dbid'=>$record['id'],
				'usafid'=>$record['usafid'],
				'wban'=>$record['wban'],
				'lat'=>$record['lattitude'],
				'lng'=>$record['longitude']
			);
		}
	}
	file_put_contents( $data_id.'.data' , serialize( $stations ) );
	unlink( $data_id.'.lock' );
}

$data_id = 'data/noaa/data_file_cache/stations/stations.'.md5(serialize($_GET));
while ( file_exists( $data_id.'.lock' ) && filesize( $data_id.'.lock' ) > 0 && filemtime( $data_id.'.lock' ) > strtotime( '-' . ini_get('max_execution_time') . ' seconds' ) ) {
	usleep( 1000000 );
}
if ( !file_exists( $data_id.'.data' ) || ( $stations_local = @unserialize( file_get_contents( $data_id.'.data' ) ) ) == FALSE ) {
	file_put_contents( $data_id.'.lock' , 'WAT' );
	$closest = find_closest_stations($lat, $lng, $stations, $num_stations);
	$query = 'SELECT * FROM `stations` WHERE id IN (\'' . implode( '\',\'' , array_keys( $closest ) ) . '\')';
	if ($recordset = mysql_query($query)) {
		while ($record = mysql_fetch_assoc($recordset)) {
			$stations[$record['id']] = array(
				'name'=>$record['name'],
				'dbid'=>$record['id'],
				'usafid'=>$record['usafid'],
				'wban'=>$record['wban'],
				'lat'=>$record['lattitude'],
				'lng'=>$record['longitude'],
				'elev'=>$record['elevation'],
				'gsod_years'=>unserialize($record['gsod_years']),
				'nsrdb_years'=>unserialize($record['nsrdb_years']),
				'data'=>array()
			);
		}
	}
	$stations_local = array();
	$stations_order = array();
	foreach ($closest as $station_id => $station_distance) {
		$stations[$station_id]['distance'] = $station_distance;
		$stations_local[$station_id] = $stations[$station_id];
		$stations_order[] = $station_id;
	}
	file_put_contents( $data_id.'.data' , serialize( $stations_local ) );
	unlink( $data_id.'.lock' );
}

$data[] = array(
	'mid' => $mid,
	'stations' => $stations_local,
	'sindex' => $stations_order
);

echo (isset($_GET['callback']) ? $_GET['callback'].'('.json_encode($data).')' : json_encode($data));
exit();



//http://stackoverflow.com/q/4057665
function rad ($x) { return $x*M_PI/180; }
function find_closest_stations ($lat, $lng, $stations, $num, $recalc = FALSE) {
	//static $stations_cache = array();
	static $R = 6371;
	static $distances = array();
	$closest = -1;
	reset($distances);
	//if (count(array_diff($stations_cache,$stations)) > 0) {
	//	$stations_cache = $stations;
	// 	$recalc = TRUE;
	//}
	if (count($distances) == 0 || $recalc) {
		$station_ids = array_keys( $stations );
		for ( $i = 0 ; $i < count( $station_ids ) ; $i++ ) {
			if ( !isset( $stations[$station_ids[$i]] ) ) { continue; }
			// check for a duplicate station using an alternate ID, e.g. 999999XXXXX or XXXXXX99999
			if ( isset( $stations[$station_ids[$i]] ) && $stations[$station_ids[$i]]['usafid'] != '999999' && $stations[$station_ids[$i]]['wban'] != '99999' ) {
				$i_usafid_only = $stations[$station_ids[$i]]['usafid'] . '99999';
				if ( isset( $stations[$i_usafid_only] ) ) {
					unset( $stations[$i_usafid_only] );
					if ( isset( $distances[$i_usafid_only] ) ) {
						unset( $distances[$i_usafid_only] );
					}
				}
				$i_wban_only = '999999' . $stations[$station_ids[$i]]['wban'];
				if ( isset( $stations[$i_wban_only] ) ) {
					unset( $stations[$i_wban_only] );
					if ( isset( $distances[$i_wban_only] ) ) {
						unset( $distances[$i_wban_only] );
					}
				}
			}
			
			$mlat = $stations[$station_ids[$i]]['lat'];
			$mlng = $stations[$station_ids[$i]]['lng'];
			$dLat  = rad($mlat - $lat);
			$dLng = rad($mlng - $lng);
			$a = sin($dLat/2) * sin($dLat/2) +
				cos(rad($lat)) * cos(rad($lat)) * sin($dLng/2) * sin($dLng/2);
			$c = 2 * atan2(sqrt($a), sqrt(1-$a));
			$d = $R * $c;
			/* If the distance calculation results in is_nan($d), do not add it to the distances array. 
			These values will always be pushed to the top of the array, resulting in a poor 
			"closest station" calculation. */
			if (!is_nan($d)) {
				$distances[$station_ids[$i]] = $d;
			}
		}
		asort($distances);
	} else {
		unset($distances[key($distances)]);
	}
	return array_slice($distances,0,$num,TRUE);
}
?>
