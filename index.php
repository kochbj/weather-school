<?php
ob_start();

require_once 'includes/srv/config.php';

$urlparts = ( isset( $_GET['_ctrl_url'] ) && !empty( $_GET['_ctrl_url'] ) ? explode( '/' , $_GET['_ctrl_url'] ) : array( ) );
$handler = 'pages';
$page = 'home';
$is_deep = false;
switch ( count( $urlparts ) ) {
	case 2 : case 3 :
		$handler = array_shift( $urlparts );
		$handler = ( file_exists( realpath( CLIMATE_DIR . DIRECTORY_SEPARATOR . $handler ) ) ? $handler : 'pages' );
	case 1 :
		$page = array_shift( $urlparts );
	default :
		$page_path = realpath( $handler . DIRECTORY_SEPARATOR . $page . ( count( $urlparts ) > 0 && $handler == 'modules' ? DIRECTORY_SEPARATOR . 'slides' : '' ) . '.php' );
		if ( $page_path === FALSE || strpos( $page_path , CLIMATE_DIR ) === FALSE ) {
			$handler = 'pages';
			$page = '404';
			$page_path = realpath( $handler . DIRECTORY_SEPARATOR . $page . '.php' );
		}
		if ( isset( $_SERVER['HTTP_X_REQUESTED_WITH'] ) && $_SERVER['HTTP_X_REQUESTED_WITH'] == 'XMLHttpRequest' ) {
			$template = 'json';
		} else {
			$template = ( $handler == 'pages' ? 'main' : substr( $handler , 0 , -1 ) );
		}
}

$__content = '';
if ( file_exists( $page_path ) ) {
	$__content_return = include $page_path;
	if ( $__content_return == 302 ) {
		ob_clean(); ob_end_flush(); exit;
	}
	$__content = ob_get_clean( );
}

include 'templates' . DIRECTORY_SEPARATOR . $template . '.php';
