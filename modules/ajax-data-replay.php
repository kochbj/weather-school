<?php
$data = array();

if ( isset( $_GET['instance_id'] , $_GET['student_id'] ) ) {
	
	// FIXME: Add some code to determine if the current user has access to this student's data
	
	$sql_stmt = 'SELECT * FROM `activity` LEFT JOIN `instances` ON `activity`.`instance_id` = `instances`.id WHERE `instances`.`user_id` = "' . mysql_real_escape_string( $_SESSION['user_id'] ) . '" AND `activity`.`instance_id` = "' . mysql_real_escape_string( $_GET['instance_id'] ) . '" AND `activity`.`user_id` = "' . mysql_real_escape_string( $_GET['student_id'] ) . '" ORDER BY `activity`.`created`';
	
	if ( ( $records = mysql_query( $sql_stmt ) ) !== FALSE ) {
		
		while ( ( $record = mysql_fetch_assoc( $records ) ) !== FALSE ) {
			$data[ $record['container'] ] = unserialize( $record['data'] );
		}
		
		// echo '<pre>' , print_r( $activity , TRUE ) , '</pre>';
	
	}
	
}
	
echo ( isset( $_GET['callback'] ) ? $_GET['callback'] . '(' . json_encode( $data ) . ')' : json_encode( $data ) );