<?php
require_once(realpath(dirname(__FILE__).'/../../config.php'));

exit;

$stations_gsod_file = 'ftp://ftp.ncdc.noaa.gov/pub/data/gsod/ish-history.csv';
$stations_gsod_file_cache = dirname(__FILE__).'/data_file_cache/stations.cache.txt';

$stations_nsrdb_file = 'http://rredc.nrel.gov/solar/old_data/nsrdb/1991-2010/NSRDB_StationsMeta.csv';
$stations_nsrdb_file_cache = dirname(__FILE__).'/data_file_cache/stations.nsrdb.cache.txt';

$log = array();

$log[] = '[' . date('Y-m-d h:m:s') . ']' . ' starting station list update';

if ((!file_exists($stations_gsod_file_cache) || (filemtime($stations_gsod_file_cache) < strtotime('-28 days') && filemtime($stations_gsod_file) > filemtime($stations_gsod_file_cache))) && $stations = file_get_contents($stations_gsod_file)) {
	$log[] = 'pulled station data';
	if (file_put_contents($stations_gsod_file_cache, $stations)) {
		$log[] = 'station data cached';
		$query = sprintf(
			'
			LOAD DATA INFILE \'%s\' 
			REPLACE INTO TABLE stations
			FIELDS TERMINATED BY \',\' ENCLOSED BY \'"\'
			IGNORE 1 LINES
			(`usafid`, `wban`, `name`, `wmo_country`, `fips_country`, `state`, `callsign`, @lat, @lng, @elev, @begindate, @enddate)
			SET `id` = CONCAT(`usafid`,`wban`), `lattitude` = @lat*.001, `longitude` = @lng*.001, `elevation` = @elev*.1, `begin` = IF(@begindate = \'\', NULL, IF(@begindate = \'NO DATA\', NULL, @begindate)), `end` = IF(@enddate = \'\', NULL, IF(@enddate = \'NO DATA\', NULL, @enddate))
			;',
			mysql_real_escape_string($stations_gsod_file_cache)
		);
		$log[] = 'running query: ' . $query;
		if (mysql_query($query)) {
			$log[] = 'loaded station data into database (' . mysql_affected_rows() . ')';
			
			// load NSRDB station data
			if ($stations_nsrdb = file_get_contents($stations_nsrdb_file)) {
				$log[] = 'pulled NSRDB station list';
				$stations_nsrdb = preg_split('((\r\n)|\r|\n)',$stations_nsrdb);
				array_shift($stations_nsrdb);
				$log[] = 'updating stations that are in the NSRDB';
				$station_count = 0;
				$station_fail_count = 0;
				foreach ($stations_nsrdb as $station) {
					$station = explode(',',$station);
					$query = sprintf(
						'UPDATE `stations` SET nsrdb = 1, nsrdb_class = %u, nsrdb_measured = %u WHERE usafid = %u;',
						mysql_real_escape_string($station[1]),
						mysql_real_escape_string($station[2]),
						mysql_real_escape_string($station[0])
					);
					if (mysql_query($query)) {
						$station_count++;
					} else {
						$station_fail_count++;
					}
				}
				$log[] = $station_count . ' stations updated, ' . $station_fail_count . ' stations failed to update';
			} else {
				$log[] = 'unable to load NSRDB station data';
			}
		} else {
			$log[] = 'unable to load station data into database :: ' . mysql_error();
		}
	} else {
		$log[] = 'unable to cache station data';
	}
} else {
	$log[] = 'no work to do';
}

$log[] = '[' . date('Y-m-d h:m:s') . ']' . ' station list update complete';

// array_map('htmlentities', $log);
// echo '<ul><li>' , nl2br(implode('</li><li>', $log)) , '</li></ul>';
// file_put_contents( dirname(__FILE__).'/stations.log' , "\r\n\r\n".implode("\r\n", $log)."\r\n\r\n" , FILE_APPEND );
?>
