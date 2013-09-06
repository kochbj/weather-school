<?php
require_once('config.php');

# Update the station list (though this should be part of some kind of cron script, rather than run every time 
# this script is accessed).
# Redirect stdout and stderr to /dev/null so that PHP won't wait for execution of the external script to end.
# See http://www.welldonesoft.com/technology/articles/php/forking/
exec('php ' . dirname(__FILE__) . '/data/noaa/stations.php > /dev/null 2>&1 &');

$country = (isset($_GET['country']) ? trim($_GET['country']) : NULL);
$num_stations = (isset($_GET['num_stations']) && is_numeric($_GET['num_stations']) ? (int) trim($_GET['num_stations']) : 10);
$date_min = (isset($_GET['date_min']) && strtotime($_GET['date_min']) ? strtotime($_GET['date_min']) : NULL);
$date_max = (isset($_GET['date_max']) && strtotime($_GET['date_max']) ? strtotime($_GET['date_max']) : NULL);

$range = (isset($_GET['range']) ? $_GET['range'] : NULL);
if (isset($range)) {
	$range['max-lat'] = round((max($range['n'], $range['s']))*1000, 0);
	$range['min-lat'] = round((min($range['n'], $range['s']))*1000, 0);
	$range['max-lng'] = round((max($range['e'], $range['w']))*1000, 0);
	$range['min-lng'] = round((min($range['e'], $range['w']))*1000, 0);
}

$data = array();

if (!isset($date_min, $date_max)) {
	$data[] = array(
		'stations' => array(),
		'status' => array(
			500 => 'Please provide a start date and an end date.'
		)
	);
	echo (isset($_GET['callback']) ? $_GET['callback'].'('.json_encode($data).')' : json_encode($data));
	exit();
}

$datetime_min = date_create(date('Y-m-d',$date_min));
$datetime_max = date_create(date('Y-m-d',$date_max));
$interval = date_diff($datetime_min, $datetime_max);
// $num_days = (int) $interval->format('%a');
// FIXME %a is broken on windows when using PHP compiled with VC6 http://bugs.php.net/bug.php?id=51184
$num_days = (int) round(abs($date_max-$date_min)/(60*60*24))+1;

$elevation_ranges = array(
	array(false,500),
	array(501,1000),
	array(1001,1500),
	array(1501,2000),
	array(2001,2500),
	array(2501,3000),
	array(3000,false)
);
$stations = array();
foreach ($elevation_ranges as $elevation_range) {
	$query = sprintf(
		'SELECT * FROM `stations` WHERE `lattitude` <> -99999 AND `begin` <= \'%s\' AND `end` >= \'%s\' %s %s %s %s ORDER BY RAND() LIMIT %u',
		mysql_real_escape_string(date('Y-m-d',$date_min)),
		mysql_real_escape_string(date('Y-m-d',$date_max)),
		(isset($country) ? 'AND fips_country = "'.mysql_real_escape_string($country).'" AND state IN ("AL","AR","AZ","CA","CO","CT","DC","DE","FL","GA","IA","ID","IL","IN","KS","KY","LA","MA","MD","ME","MI","MN","MO","MS","MT","NC","ND","NE","NH","NJ","NM","NV","NY","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VA","VT","WA","WI","WV","WY")' : ''),
		(isset($range) ? ' AND lattitude < '.mysql_real_escape_string($range['max-lat']).' AND lattitude > '.mysql_real_escape_string($range['min-lat']).' AND longitude < '.mysql_real_escape_string($range['max-lng']).' AND longitude > '.mysql_real_escape_string($range['min-lng']) : ''),
		($elevation_range[0] ? 'AND elevation >= '.$elevation_range[0]*10 : ''),
		($elevation_range[1] ? 'AND elevation <= '.$elevation_range[1]*10 : ''),
		mysql_real_escape_string((int)round($num_stations/count($elevation_ranges))) /*for some reason this is calculated on the first round as E if not specifically cast as int*/
	);
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
}
if (count($stations) < $num_stations) {
	$query = sprintf(
		'SELECT * FROM `stations` WHERE `lattitude` <> -99999 AND `begin` <= \'%s\' AND `end` >= \'%s\' %s %s ORDER BY RAND() LIMIT %u',
		mysql_real_escape_string(date('Y-m-d',$date_min)),
		mysql_real_escape_string(date('Y-m-d',$date_max)),
		(isset($country) ? 'AND fips_country = "'.mysql_real_escape_string($country).'" AND state IN ("AL","AR","AZ","CA","CO","CT","DC","DE","FL","GA","IA","ID","IL","IN","KS","KY","LA","MA","MD","ME","MI","MN","MO","MS","MT","NC","ND","NE","NH","NJ","NM","NV","NY","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VA","VT","WA","WI","WV","WY")' : ''),
		(isset($range) ? ' AND lattitude < '.mysql_real_escape_string($range['max-lat']).' AND lattitude > '.mysql_real_escape_string($range['min-lat']).' AND longitude < '.mysql_real_escape_string($range['max-lng']).' AND longitude > '.mysql_real_escape_string($range['min-lng']) : ''),
		mysql_real_escape_string($num_stations-count($stations))
	);
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
}

echo (isset($_GET['callback']) ? $_GET['callback'].'('.json_encode($stations).')' : json_encode($stations));
exit();
?>