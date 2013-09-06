<?php
# Update the station list (though this should be part of some kind of cron script, rather than run every time 
# this script is accessed).
# Redirect stdout and stderr to /dev/null so that PHP won't wait for execution of the external script to end.
# See http://www.welldonesoft.com/technology/articles/php/forking/
exec('php ' . dirname(__FILE__) . '/data/nasa/hdfpull.php > /dev/null 2>&1 &');

// http://developer.yahoo.com/geo/placefinder/
// http://code.google.com/apis/maps/
define('GRADS_DIR', realpath(str_replace('\\','/',dirname(__FILE__)).'/grads'));
define('GRADS_DIR_HTTP', 'http://' . $_SERVER['HTTP_HOST'] . dirname($_SERVER['PHP_SELF']) . '/grads');
require_once(GRADS_DIR.'/functions.php');
require_once(GRADS_DIR.'/map_settings.php');

$time_start = NULL;
$utime_start = NULL;
if (isset($_GET['timeStart']) && strlen(trim($_GET['timeStart'])) > 0) {
	$utime_start = strtotime($_GET['timeStart']);
	$time_start = date('MY', $utime_start);
}
$time_end = NULL;
$utime_end = NULL;
if (isset($_GET['timeEnd']) && strlen(trim($_GET['timeEnd'])) > 0) {
	$utime_end = strtotime($_GET['timeEnd']);
	$time_end = date('MY', $utime_end);
}
if (isset($utime_start, $utime_end) && $utime_end < $utime_start) {
	$tmp = $time_start;
	$time_start = $time_end;
	$time_end = $tmp;
	$tmp = $utime_start;
	$utime_start = $utime_end;
	$utime_end = $tmp;
}

$map_scope = isset($_GET['mapscope-ajax']) && array_key_exists($_GET['mapscope-ajax'], $map_scopes) ? $_GET['mapscope-ajax'] : 'world';

$plot = array(
	'type'=>(count($map_scopes[$map_scope]) > 1 ? 'shaded' : 'line'),
	'coords'=>$map_scopes[$map_scope]
);

$active_charts = array();
if (isset($_GET['charts'])) {
	foreach ($_GET['charts'] as $source) {
		if (array_key_exists($source, $charts)) {
			$active_charts[$source] = array(
				'source'=>$charts[$source]['source'],
				'var'=>$charts[$source]['var']
			);
		}
	}
}

$output=array(
	'msg'=>array(),
	'data'=>array(
		'mapscope' => $map_scope,
		'charts' => array(),
		'defaults' => array(
			'minDate' => NULL,
			'maxDate' => NULL,
			'startDateDefault' => NULL,
			'endDateDefault' => NULL,
			'startDateSet' => NULL,
			'endDateSet' => NULL,
		)
	)
);

// set form params
$output['data']['mapscope'] = $map_scope;
foreach ($active_charts as $active_chart => $chart_params) {
	$active_source = $chart_params['source'];
	$active_var = $chart_params['var'];
	
	$imglist = array();
	if (isset($time_start, $time_end) && count($active_charts) > 0) {
		generateVisuals($chart_params['source'], $chart_params['var'], $utime_start, $utime_end, $plot);
		$imglist = generateImagelist($chart_params['source'], $chart_params['var'], $utime_start, $utime_end, $plot);
	}

	if (isset($active_source)) {
		$output['data']['charts'][] = array(
			'source' => $active_chart,
			'minDate' => date('1 F Y', strtotime($dataset[$active_source]['timestart'])),
			'maxDate' => date('1 F Y', strtotime($dataset[$active_source]['timeend'])),
			'startDateDefault' => (isset($utime_start) ? date('1 F Y', $utime_start) : date('1 F Y', strtotime($dataset[$active_source]['timestart']))),
			'endDateDefault' => (isset($utime_end) ? date('1 F Y', $utime_end) : date('1 F Y', strtotime($dataset[$active_source]['timeend']))),
			'startDateSet' => (isset($utime_start) ? date('1 F Y', $utime_start) : NULL),
			'endDateSet' => (isset($utime_end) ? date('1 F Y', $utime_end) : NULL),
			'imglist' => $imglist
		);
	}
	
	$defaults =& $output['data']['defaults'];
	$chart = end($output['data']['charts']);
	if ($defaults['minDate'] == NULL || $defaults['minDate'] > $chart['minDate']) {
		$defaults['minDate'] = $chart['minDate'];
	}
	if ($defaults['maxDate'] == NULL || $defaults['maxDate'] < $chart['maxDate']) {
		$defaults['maxDate'] = $chart['maxDate'];
	}
	if ($defaults['startDateDefault'] == NULL || $defaults['startDateDefault'] > $chart['startDateDefault']) {
		$defaults['startDateDefault'] = $chart['startDateDefault'];
	}
	if ($defaults['endDateDefault'] == NULL || $defaults['endDateDefault'] < $chart['endDateDefault']) {
		$defaults['endDateDefault'] = $chart['endDateDefault'];
	}
	if ($defaults['startDateSet'] == NULL || $defaults['startDateSet'] > $chart['startDateSet']) {
		$defaults['startDateSet'] = $chart['startDateSet'];
	}
	if ($defaults['endDateSet'] == NULL || $defaults['endDateSet'] < $chart['endDateSet']) {
		$defaults['endDateSet'] = $chart['endDateSet'];
	}
}


header("Content-type: application/json");
echo (isset($_GET['callback']) ? $_GET['callback'].'('.json_encode($output).')' : json_encode($output));
