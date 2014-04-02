<?php
require_once('settings.php');

ini_set('display_errors',true);

$dbc = mysql_connect(DB_HOST, DB_USER, DB_PASSWD) OR trigger_error('Could not connect to mysql: ' . mysql_error() );

mysql_select_db(DB_SCHEMA) OR trigger_error('Could not select database: ' . mysql_error());

mysql_query("SET NAMES 'utf8'");
?>
