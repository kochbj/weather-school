<?php
require_once('config.php');

# Update the station list (though this should be part of some kind of cron script, rather than run every time 
# this script is accessed).
# Redirect stdout and stderr to /dev/null so that PHP won't wait for execution of the external script to end.
# See http://www.welldonesoft.com/technology/articles/php/forking/
exec('php ' . dirname(__FILE__) . '/data/noaa/stations.php > /dev/null 2>&1 &');

$valid_recordings = array('temp','temp_min','temp_max','dewpoint','pressuresl','visibility','wind_mean','wind_max','wind_gust','precipitation');
$recordings = array_intersect($valid_recordings, (isset($_REQUEST['recordings']) && is_array($_REQUEST['recordings']) ? $_REQUEST['recordings'] : array()));

// the map marker array
$markers = isset($_REQUEST['markers']) ? json_decode($_REQUEST['markers']) : array();

if (count($markers) == 0) {
	echo 'Please provide a latitude, longitude, start date, and end date.';
	exit();
}

$columns_base = array('user_lat','user_lng','station','lat','lng');
$columns = array_merge($columns_base,$recordings);

foreach ($markers as $id => $marker) {
	$datetime_min = date_create(date('Y-m-d',strtotime($marker->date_min)));
	$datetime_max = date_create(date('Y-m-d',strtotime($marker->date_max)));
	$interval = date_diff($datetime_min, $datetime_max);
	// $num_days = (int) $interval->format('%a');
	// FIXME %a is broken on windows when using PHP compiled with VC6 http://bugs.php.net/bug.php?id=51184
	$num_days = (int) round(abs($marker->date_max-$marker->date_min)/(60*60*24))+1;
	$date_data = array();
	$current_date = $datetime_min;
	while ($current_date->format('U') <= $datetime_max->format('U')) {
		$date_data[$current_date->format('Y-m-d')] = array_fill_keys($recordings,NULL);
		$current_date->modify('+1 day');
	}
	$markers[$id]->recordings = $date_data;
	
	$query = sprintf(
		'SELECT * FROM `stations` WHERE `lattitude` <> -99999 AND `begin` <= \'%s\' AND `end` >= \'%s\'',
		mysql_real_escape_string(date('Y-m-d',strtotime($marker->date_min))),
		mysql_real_escape_string(date('Y-m-d',strtotime($marker->date_max)))
	);
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
		$closest = find_closest_station($marker->lat, $marker->lng, $stations);
		
		// FIXME can we check here to see if it's necessary to request a recordings update?
		file_get_contents('http://' . $_SERVER['HTTP_HOST'] . dirname($_SERVER['PHP_SELF']) . '/data/noaa/recordings_gsod.php?dbid=' . urlencode($stations[$closest]['dbid']) . '&year_min=' . date('Y',strtotime($marker->date_min)) . '&year_max=' . date('Y',strtotime($marker->date_max)));
		
		$query = sprintf(
			'SELECT `date_recorded`, `%s` FROM `recordings` WHERE `station_id` = \'%s\' AND `date_recorded` >= \'%s\' AND `date_recorded` <= \'%s\'',
			mysql_real_escape_string(implode('`,`',$recordings)),
			mysql_real_escape_string($stations[$closest]['dbid']),
			mysql_real_escape_string(date('Y-m-d',strtotime($marker->date_min))),
			mysql_real_escape_string(date('Y-m-d',strtotime($marker->date_max)))
		);
		$recordset = mysql_query($query);
		if ($recordset && mysql_num_rows($recordset)/$num_days >= .6) {
			$markers[$id]->station = $stations[$closest];
			while ($record = mysql_fetch_assoc($recordset)) {
				$markers[$id]->recordings[$record['date_recorded']] = array();
				foreach ($recordings as $recording) {
					$markers[$id]->recordings[$record['date_recorded']][$recording] = $record[$recording];
				}
			}
			$data_found = true;
		} else {
			//unset($stations[$closest]);
		}
	}
}

$lines = array();
$lines[] = implode(',',$columns);
foreach ($markers as $id => $marker) { foreach ($marker->recordings as $date => $recording) {
	$line = array(
		$marker->lat,
		$marker->lng,
		$marker->station['dbid'],
		sprintf('%.3f',$marker->station['lat']/1000),
		sprintf('%.3f',$marker->station['lng']/1000)
	);
	foreach ($recordings as $recording_column) {
		$line[] = $recording[$recording_column];
	}
	$lines[] = implode(',',$line);
} }
header('Content-type: text/csv');
header('Content-disposition: attachment; filename=data.csv');
echo implode("\r\n",$lines);
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
			/* If the distance calculation results in $d, do not add it to the distances array. 
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