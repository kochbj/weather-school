<?php
// echo '<pre>',print_r($_POST,TRUE),'</pre>';

$sql_stmt = sprintf(
	'INSERT INTO `activity` ( `instance_id` , `user_id` , `session_id` , `container` , `data` ) VALUES ( %u , %u , "%s" , "%s" , "%s" )' ,
	mysql_real_escape_string( __alpha2num( $_SESSION['instance_code'] ) ) ,
	mysql_real_escape_string( isset( $_SESSION['student_id'] ) ? $_SESSION['student_id'] : ( isset( $_SESSION['user_id'] ) ? $_SESSION['user_id'] : '' ) ) ,
	mysql_real_escape_string( session_id( ) ) ,
	mysql_real_escape_string( $_POST['value']['container'] ) ,
	mysql_real_escape_string( serialize( $_POST['value']['data'] ) )
);

// echo '<pre>',$sql_stmt,'</pre>';

$data = array();
if ( mysql_query( $sql_stmt ) && mysql_affected_rows() > 0 ) {
	$data['status'] = 'saved';
} else {
	$data['status'] = 'not saved';
}

echo json_encode( $data );