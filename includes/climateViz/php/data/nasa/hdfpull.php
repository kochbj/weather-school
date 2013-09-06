<?php
require_once('../../includes/srv/config.php');

$data_dir_remote = 'ftp://goldsmr2.sci.gsfc.nasa.gov/data/s4pa//MERRA_MONTHLY/MATMNXRAD.5.2.0';
$data_dir_local = dirname(__FILE__).'/MATMNXRAD';

$chsub = array();
$chsub_pattern = '/(MERRA\d{3})\.prod\.assim\.tavgM_2d_rad_Nx\.\d{6}\.hdf/i'; // e.g. MERRA101.prod.assim.tavgM_2d_rad_Nx.197901.hdf
$current_chsub = NULL;

$tdef_count = 0;

$timestart = NULL;
$timeend = NULL;

$log = array();

// if the ctl file is not two weeks old then don't update
if ((int)filemtime('MATMNXRAD.ctl') > (int)strtotime('-2 weeks')) {
	exit();
}

$log[] = '[' . date('Y-m-d h:m:s') . ']' . ' starting MERRA HDF update';

// instead of checking all files, maybe check change dates on remote site to see if parsing is necessary
$data_files = array_fill(1979, date('Y')-1979+1, array_fill(1, 12, array('local'=>NULL,'remote'=>NULL)));
foreach ($data_files as $year => $months) {
	// grab list of remote files, expected location is in year subfolders of the remote site
	
	if ($data_files_remote = scandir($data_dir_remote.'/'.$year)) {
		$log[] = 'pull list of files for ' . $year;
		foreach (array_keys($months) as $month) {
			$log[] = 'parsing month ' . $month;
			// check for the existence of a local file
			if (count($data_files_local = glob($data_dir_local.'/'.$year.'/*.'.$year.sprintf('%02u',$month).'.hdf')) > 0) {
				$data_files[$year][$month]['local'] = basename($data_files_local[0]);
				$log[] = 'found local file';
			}
			// parse the list of remote files for one that matches the expected filename pattern for the current month
			foreach ($data_files_remote as $data_file_remote) {
				if (fnmatch('*.'.$year.sprintf('%02u',$month).'.hdf', $data_file_remote)) {
					$data_files[$year][$month]['remote'] = $data_file_remote;
					$log[] = 'found remote file';
					break;
				}
			}
			// if the local and remote file names don't match, replace the current local file with the remote
			if (strlen($data_files[$year][$month]['remote']) > 0 && $data_files[$year][$month]['remote'] != $data_files[$year][$month]['local']) {
				$log[] = 'attempting to download file from remote source';
				exec(
					'wget --directory-prefix='.$data_dir_local.'/'.$year . ' ' . str_replace('ftp://','http://',$data_dir_remote).'/'.$year.'/'.$data_files[$year][$month]['remote'],
					$exec_output,
					$exec_return
				);
				if ($exec_return == 0) {
					$log[] = 'successfully downloaded data file';
					if (strlen($data_files[$year][$month]['local']) > 0) {
						unlink($data_dir_local.'/'.$year.'/'.$data_files[$year][$month]['local']);
					}
					$data_files[$year][$month]['local'] = $data_files[$year][$month]['remote'];
				} else {
					$log[] = 'failed to download remote file';
				}
			} else {
				$log[] = 'nothing to do';
			}
			// parse the local file for the tdef and chsub params
			if (strlen($data_files[$year][$month]['local']) > 0 && preg_match($chsub_pattern, $data_files[$year][$month]['local'], $matches)) {
				if (!$timestart) {
					$timestart = ($timeend = mktime(0,0,0,$month,1,$year));
				} else {
					$timeend = mktime(0,0,0,$month,1,$year);
				}
				$tdef_count++;
				if ($current_chsub === NULL || $chsub[$current_chsub]['value'] != $matches[1]) {
					$chsub[] = array('value'=>$matches[1],'count'=>0);
					$current_chsub = count($chsub)-1;
				}
				$chsub[$current_chsub]['count']++;
			} elseif ($current_chsub !== NULL) {
				$tdef_count++;
				if ($chsub[$current_chsub]['value'] != '') {
					$chsub[] = array('value'=>'','count'=>0);
					$current_chsub = count($chsub)-1;
				}
				$chsub[$current_chsub]['count']++;
			}
		}
	} else {
		$log[] = 'unable to pull a list of files from the remote site';
	}
}

$log[] = 'updating grads ctl file';
if ($ctlfile = file_get_contents('MATMNXRAD.template.ctl')) {
	$chsub_text = array();
	$chsub_start = 1;
	foreach ($chsub as $chsub_param) {
		$chsub_text[] = 'CHSUB ' . $chsub_start . ' ' . ($chsub_start+$chsub_param['count']-1) . ' ' . $chsub_param['value'];
		$chsub_start = $chsub_start+$chsub_param['count'];
	}
	$ctlfile = str_replace('%TEMPLATE_CHSUB%', implode("\r\n",$chsub_text), $ctlfile);
	$ctlfile = str_replace('%TEMPLATE_TDEF_COUNT%', $tdef_count, $ctlfile);
	$ctlfile = str_replace('%TEMPLATE_TDEF_TIMESTART%', strtoupper(date('MY',$timestart)), $ctlfile);
	$ctlfile = str_replace('%TEMPLATE_TIMESTART%', strtolower(date('MY',$timestart)), $ctlfile);
	$ctlfile = str_replace('%TEMPLATE_TIMEEND%', strtolower(date('MY',$timeend)), $ctlfile);
	if (file_put_contents('MATMNXRAD.ctl', $ctlfile)) {
		$log[] = 'ctl successfully update';
	} else {
		$log[] = 'ctl not updated';
	}
} else {
	$log[] = 'unable to open ctl template';
}

$log[] = '[' . date('Y-m-d h:m:s') . ']' . ' MERRA HDF update complete';

// array_map('htmlentities', $log);
// echo '<ul><li>' , nl2br(implode('</li><li>', $log)) , '</li></ul>';
file_put_contents( 'hdfpull.log' , "\r\n\r\n".implode("\r\n", $log)."\r\n\r\n" , FILE_APPEND );
?>