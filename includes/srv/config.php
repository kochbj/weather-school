<?php
require_once 'password.php';
require_once 'settings.php';

/**
 * Set constants
**/
define( 'CLIMATE_DIR' , realpath( dirname( dirname( dirname( __FILE__ ) ) ) ) );
$climate_dir_www = str_replace( '\\' , '/' , str_replace( realpath( $_SERVER['DOCUMENT_ROOT'] ) , '' , realpath( dirname( dirname( dirname( __FILE__ ) ) ) ) ) );
if ( strpos( $climate_dir_www , '/app/webroot/' ) !== FALSE ) {
	$climate_dir_www = str_replace( '/app/webroot/' , '/' , $climate_dir_www );
}
define( 'CLIMATE_DIR_WWW' , $climate_dir_www );

mysql_connect( DB_HOST , DB_USER , DB_PASSWD ) OR trigger_error( 'Could not connect to mysql: ' . mysql_error( ) );
mysql_select_db( DB_SCHEMA ) OR trigger_error( 'Could not select database: ' . mysql_error( ) );
mysql_query( 'SET NAMES "utf8"' );

session_name( 'aaas-p2061-climateviz' );
session_set_cookie_params ( 7200 , CLIMATE_DIR_WWW , $_SERVER['HTTP_HOST'] );
session_start();

//echo '<pre>',print_r($_SESSION,TRUE),'</pre>';
//echo '<pre>',session_id(),'</pre>';

$login = FALSE;
if ( !isset( $_SESSION['user_id'] ) ) {
	if ( in_array( basename( $_SERVER['SCRIPT_URL'] ), array( 'reports' ) ) ) {
		if ( isset( $_SERVER['HTTP_X_REQUESTED_WITH'] ) && $_SERVER['HTTP_X_REQUESTED_WITH'] == 'XMLHttpRequest' ) {
			header( 'X-Authenticated: 0' );
		} else {
			header ( 'Location: http://' . $_SERVER['HTTP_HOST'] . CLIMATE_DIR_WWW . '/login?src=' . urlencode( $_SERVER['REQUEST_URI'] ) , TRUE );
			exit;
		}
	}
} else {
	$_SESSION['accesstime'] = time( );
	$login = TRUE;
	if ( isset( $_SERVER['HTTP_X_REQUESTED_WITH'] ) && $_SERVER['HTTP_X_REQUESTED_WITH'] == 'XMLHttpRequest' ) {
		header( 'X-Authenticated: 1' );
	}
}

// http://www.php.net/manual/en/function.base-convert.php#94874
// modified to allow "Z" padding and to use lowercase letters
function __num2alpha( $n , $pad = 0 ) {
	$r = '';
	for ( $i = 1 ; $n >= 0 && $i < 10 ; $i++ ) {
		$r = chr( 0x61 + ( $n % pow( 25 , $i ) / pow( 25 , $i - 1 ) ) ) . $r;
		$n -= pow( 25 , $i );
	}
	return sprintf( '%\'z'.$pad.'s' , $r );
}
function __alpha2num( $a ) {
	$a = str_replace( 'z' , '' , strtolower( $a ) );
	$r = 0;
	$l = strlen( $a );
	for ( $i = 0 ; $i < $l ; $i++ ) {
		$r += pow( 25 , $i ) * ( ord( $a[$l - $i - 1] ) - 0x60 );
	}
	return $r - 1;
}
