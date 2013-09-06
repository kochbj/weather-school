<?php
// echo '<pre>',print_r($_POST,TRUE),'</pre>';
$sql_stmt = sprintf(
	'INSERT INTO `activity` ( `user_id` , `session_id` , `container` , `data` ) VALUES ( "%s" , "%s" , "%s" , "%s" )' ,
	mysql_real_escape_string( isset( $_SESSION['user_id'] ) ? $_SESSION['user_id'] : '' ) ,
	mysql_real_escape_string( session_id( ) ) ,
	mysql_real_escape_string( $_POST['value']['container'] ) ,
	mysql_real_escape_string( serialize( $_POST['value']['data'] ) )
);

//echo '<pre>',$sql_stmt,'</pre>';

if ( mysql_query( $sql_stmt ) && mysql_affected_rows() > 0 ) {
	echo 'saved';
} else {
	echo 'not saved';
}
