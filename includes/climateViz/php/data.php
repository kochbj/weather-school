<?php
require_once('config.php');

# Update the station list (though this should be part of some kind of cron script, rather than run every time 
# this script is accessed).
# Redirect stdout and stderr to /dev/null so that PHP won't wait for execution of the external script to end.
# See http://www.welldonesoft.com/technology/articles/php/forking/
exec('php ' . dirname(__FILE__) . '/data/noaa/stations.php > /dev/null 2>&1 &');

$mid = (isset($_GET['mid']) ? trim($_GET['mid']) : NULL);
$lat = (isset($_GET['lat']) && is_numeric($_GET['lat']) ? trim($_GET['lat']) : NULL);
$lng = (isset($_GET['lng']) && is_numeric($_GET['lng']) ? trim($_GET['lng']) : NULL);
$date_min = (isset($_GET['date_min']) && strtotime($_GET['date_min']) ? strtotime($_GET['date_min']) : NULL);
$date_max = (isset($_GET['date_max']) && strtotime($_GET['date_max']) ? strtotime($_GET['date_max']) : NULL);
$date_ranges = (isset($_GET['date_ranges']) && is_array($_GET['date_ranges']) ? $_GET['date_ranges'] : array());

foreach ($date_ranges as $index => $date_range) {
	if (isset($date_ranges[$index]['begin']) && strtotime($date_ranges[$index]['begin']) && isset($date_ranges[$index]['end']) && strtotime($date_ranges[$index]['end'])) {
		$date_ranges[$index]['begin'] = strtotime($date_ranges[$index]['begin']);
		$date_ranges[$index]['end'] = strtotime($date_ranges[$index]['end']);
	} else {
		unset($date_ranges[$index]);
	}
}

if (isset($date_min, $date_max)) {
	$date_ranges[] = array(
		'begin' => $date_min,
		'end' => $date_max
	);
}

$data = array();

if (!isset($mid, $lat, $lng) && count($date_ranges) == 0) {
	$data[] = array(
		'mid' => $mid,
		'recordings' => array(),
		'status' => array(
			500 => 'Please provide an identifier and date range.'
		)
	);
	echo (isset($_GET['callback']) ? $_GET['callback'].'('.json_encode($data).')' : json_encode($data));
	exit();
}

$date_data = array();
foreach ($date_ranges as $date_range) {
	$datetime_min = date_create(date('Y-m-d',$date_range['begin']));
	$datetime_max = date_create(date('Y-m-d',$date_range['end']));
	$interval = date_diff($datetime_min, $datetime_max);
	// $num_days = (int) $interval->format('%a');
	// FIXME %a is broken on windows when using PHP compiled with VC6 http://bugs.php.net/bug.php?id=51184
	$num_days = (int) round(abs($date_range['end']-$date_range['begin'])/(60*60*24))+1;
	$current_date = $datetime_min;
	while ($current_date->format('U') <= $datetime_max->format('U')) {
		$date_data[$current_date->format('Y-m-d')] = array(
			'temp' => NULL,
			'temp_min' => NULL,
			'temp_max' => NULL
		);
		$current_date->modify('+1 day');
	}
}

$query = 'SELECT * FROM `stations` WHERE `lattitude` <> -99999';
$conditions = array();
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

$stations = array();
if ($recordset = mysql_query($query)) {
	while ($record = mysql_fetch_assoc($recordset)) {
		$stations[] = array(
			'name'=>$record['name'],
			'dbid'=>$record['id'],
			'lat'=>$record['lattitude'],
			'lng'=>$record['longitude'],
			'elev'=>$record['elevation'],
			'gsod_years'=>unserialize($record['gsod_years']),
			'data'=>array()
		);
	}
}

$data_found = false;
while (!$data_found && count($stations) > 0) {
	$closest = find_closest_station($lat, $lng, $stations);
	
	foreach ($date_ranges as $date_range) {
		// FIXME can we check here to see if it's necessary to request a recordings update?
		file_get_contents('http://' . $_SERVER['HTTP_HOST'] . dirname($_SERVER['PHP_SELF']) . '/data/noaa/recordings_gsod.php?dbid=' . urlencode($stations[$closest]['dbid']) . '&year_min=' . date('Y',$date_range['begin']) . '&year_max=' . date('Y',$date_range['end']));
		
		$query = sprintf(
			'SELECT `date_recorded`, `temp`, `temp_min`, `temp_max` FROM `recordings` WHERE `station_id` = \'%s\' AND `date_recorded` >= \'%s\' AND `date_recorded` <= \'%s\'',
			mysql_real_escape_string($stations[$closest]['dbid']),
			mysql_real_escape_string(date('Y-m-d',$date_range['begin'])),
			mysql_real_escape_string(date('Y-m-d',$date_range['end']))
		);
		$recordset = mysql_query($query);
		if ($recordset && mysql_num_rows($recordset)/$num_days >= .6) {
			$data[] = array(
				'mid' => $mid,
				'station' => $stations[$closest]
			);
			while ($record = mysql_fetch_assoc($recordset)) {
				$date_data[$record['date_recorded']] = array(
					'temp' => $record['temp'],
					'temp_min' => $record['temp_min'],
					'temp_max' => $record['temp_max']
				);
			}
			$data[0]['station']['data'] = $date_data;
			$data_found = true;
		} else {
			$data_found = false;
			break;
			//unset($stations[$closest]);
		}
	}
}

echo (isset($_GET['callback']) ? $_GET['callback'].'('.json_encode($data).')' : json_encode($data));
exit();



//http://stackoverflow.com/q/4057665
function rad ($x) { return $x*M_PI/180; }
function find_closest_station ($lat, $lng, $stations, $recalc = FALSE) {
	static $stations_cache = array();
	static $R = 6371;
	static $distances = array();
	$closest = -1;
	reset($distances);
	if (count(array_diff($stations_cache,$stations)) > 0) {
		$stations_cache = $stations;
		$recalc = TRUE;
	}
	if (count($distances) == 0 || $recalc) {
		foreach ($stations as $i => $station) {
			$mlat = $station['lat']*.001;
			$mlng = $station['lng']*.001;
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
				$distances[$i] = $d;
			}
		}
		asort($distances);
	} else {
		unset($distances[key($distances)]);
	}
	reset($distances);
	return key($distances);
}
?>