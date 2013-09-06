<?php
$data = array();

if ( isset( $_GET['student_id'] ) ) {
	
	$sql_stmt = 'SELECT * FROM `activity` WHERE `user_id` = "' . mysql_real_escape_string( $_GET['student_id'] ) . '" ORDER BY `created`';
	
	if ( ( $records = mysql_query( $sql_stmt ) ) !== FALSE ) {
		
		while ( ( $record = mysql_fetch_assoc( $records ) ) !== FALSE ) {
			$data[ $record['container'] ] = unserialize( $record['data'] );
		}
		
		// echo '<pre>' , print_r( $activity , TRUE ) , '</pre>';
	
	}
	
}	
	
echo ( isset( $_GET['callback'] ) ? $_GET['callback'] . '(' . json_encode( $data ) . ')' : json_encode( $data ) );
