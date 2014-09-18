<?php
require_once('config.php');

$mid = (isset($_GET['mid']) ? trim($_GET['mid']) : NULL);
$sid = (isset($_GET['sid']) ? trim($_GET['sid']) : NULL);
$dbid = (isset($_GET['dbid']) ? trim($_GET['dbid']) : NULL);
$date_min = (isset($_GET['date_min']) && strtotime($_GET['date_min']) ? strtotime($_GET['date_min']) : NULL);
$date_max = (isset($_GET['date_max']) && strtotime($_GET['date_max']) ? strtotime($_GET['date_max']) : NULL);
$date_ranges = (isset($_GET['date_ranges']) && is_array($_GET['date_ranges']) ? $_GET['date_ranges'] : array());
$data_parse = (isset($_GET['data_parse']) && in_array($_GET['data_parse'],array('raw')) ? $_GET['data_parse'] : 'raw');
$data_columns = (isset($_GET['data_columns']) && is_array($_GET['data_columns']) ? $_GET['data_columns'] : array('date_recorded','temp'));

foreach ($date_ranges as $index => $date_range) {
	if (isset($date_ranges[$index]['begin']) && strtotime(preg_replace('/\(.*\)/is','',$date_ranges[$index]['begin'])) && isset($date_ranges[$index]['end']) && strtotime(preg_replace('/\(.*\)/is','',$date_ranges[$index]['end']))) {
		$date_ranges[$index]['begin'] = strtotime(preg_replace('/\(.*\)/is','',$date_ranges[$index]['begin']));
		$date_ranges[$index]['end'] = strtotime(preg_replace('/\(.*\)/is','',$date_ranges[$index]['end']));
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

$data = array('query' => $_GET , 'results' => array());

if (!isset($mid, $sid) && count($date_ranges) == 0) {
	$data['results'] = array(
		'mid' => $mid,
		'recordings' => array(),
		'status' => array(
			500 => 'Please provide an identifier and date range.'
		)
	);
	echo (isset($_GET['callback']) ? $_GET['callback'].'('.json_encode($data).')' : json_encode($data));
	exit();
}

/*foreach ($date_ranges as $date_range) {

	// $num_days = (int) $interval->format('%a');
	// FIXME %a is broken on windows when using PHP compiled with VC6 http://bugs.php.net/bug.php?id=51184
	$num_days = (int) round(abs($date_range['end']-$date_range['begin'])/(60*60*24))+1;
	$current_date = $datetime_min;
	while ($current_date->format('U') <= $datetime_max->format('U')) {
		$date_data[$current_date->format('Y-m-d')] = array(
			array_combine($data_columns,array_fill(0,count($data_columns),NULL))
		);
		$current_date->modify('+1 day');
	}
}*/

foreach ($date_ranges as $date_range) {
	$date_data = array();
	$datetime_min = date_create(date('Y-m-d',$date_range['begin']));
	$datetime_max = date_create(date('Y-m-d',$date_range['end']));
	$interval = date_diff($datetime_min, $datetime_max);
	// $num_days = (int) $interval->format('%a');
	// FIXME %a is broken on windows when using PHP compiled with VC6 http://bugs.php.net/bug.php?id=51184
	$num_days = (int) round(abs($date_range['end']-$date_range['begin'])/(60*60*24))+1;
	$current_date = $datetime_min;
	while ($current_date->format('U') <= $datetime_max->format('U')) {
		$date_data[$current_date->format('Y-m-d')] =
			array_combine($data_columns,array_fill(0,count($data_columns),NULL)
		);
		$date_data[$current_date->format('Y-m-d')]['date_recorded']= $current_date->format('Y-m-d');
		$current_date->modify('+1 day');
	}


	// FIXME can we check here to see if it's necessary to request a recordings update?
	file_get_contents('http://' . $_SERVER['HTTP_HOST'] . dirname($_SERVER['PHP_SELF']) . '/data/noaa/recordings_gsod.php?dbid=' . urlencode($dbid) . '&year_min=' . date('Y',$date_range['begin']) . '&year_max=' . date('Y',$date_range['end']));
	// FIXME: this is *really* insecure
	$sql_stmt = 'SELECT %s FROM `recordings_gsod` WHERE (`station_id` = \'%s\' OR `station_id` = \'%s\') AND `date_recorded` >= \'%s\' AND `date_recorded` <= \'%s\'';
	$query = sprintf(
		$sql_stmt,
		mysql_real_escape_string('`'.implode('`,`',$data_columns).'`'),
		mysql_real_escape_string($dbid),
		mysql_real_escape_string(substr($dbid,0,-5).'99999'),
		mysql_real_escape_string(date('Y-m-d',$date_range['begin'])),
		mysql_real_escape_string(date('Y-m-d',$date_range['end']))
	);
	$recordset = mysql_query($query);
	if ($recordset) {
		$data['results'][] = array(
			'mid' => $mid,
			'sid' => $sid,
			'station' => array('dbid'=>$dbid,'data'=>array(), 'missing'=>TRUE)
		);
		$recordcount=0;
		while ($record = mysql_fetch_assoc($recordset)) {
			$recordcount+=1;
			$data_value = array();
			foreach ($data_columns as $data_column) {
				$date_data[$record['date_recorded']][$data_column] = $record[$data_column];
				//$data_value[$data_column] = $record[$data_column];
			}
			//$data['results'][key($data['results'])]['station']['data'][] = $data_value;
			//$data['results'][key($data['results'])]['station']['data'][] = $date_data[$record['date_recorded']];
		}
		if ($recordcount == count($date_data)) { $data['results'][key($data['results'])]['station']['missing'] = FALSE;  }
		$data['results'][key($data['results'])]['station']['data'] = array_values($date_data);
	}
}
echo (isset($_GET['callback']) ? $_GET['callback'].'('.json_encode($data).')' : json_encode($data));
exit();
?>
