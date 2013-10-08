<?php
$errors = array(
	'general' => array( ) ,
	'form' => array(
		'login-students' => array( )
	)
);

if ( isset( $_POST['login-students'] ) ) {
	
	$student = ( !empty( $_POST['student'] ) && strlen( $_POST['student'] ) > 0 ? $_POST['student'] : NULL );
	$instance_code = ( !empty( $_POST['instance'] ) && strlen( trim( $_POST['instance'] ) ) > 0 ? strtoupper( trim( $_POST['instance'] ) ) : NULL );
	
	if ( $instance_code ) {
		
		$strSQL = sprintf(
			'SELECT * FROM `instances` WHERE `id` = %u',
			mysql_real_escape_string( __alpha2num( $instance_code ) )
		);
		
		if ( ( $instance_records = mysql_query( $strSQL ) ) !== FALSE && ( $instance_record = mysql_fetch_assoc( $instance_records ) ) !== FALSE ) {
			
			$teacher_id = $instance_record['user_id'];
			
			$strSQL = sprintf(
				'SELECT `users`.*, `groups`.`name` FROM `users` LEFT JOIN `groups` ON `users`.`group_id` = `groups`.`id` WHERE username=\'%s\'',
				mysql_real_escape_string( md5( __num2alpha( $teacher_id , 4 ) . ( $student ? $student : session_id( ) ) . APP_SECURITY_SALT ) )
			);
			
			if ( ( $result = mysql_query( $strSQL ) ) !== false && mysql_num_rows( $result ) > 0 && ( $row = mysql_fetch_assoc( $result ) ) ) {
				
				$_SESSION['student_id'] = $row['id'];
				header ( 'Location:  http://' . $_SERVER['HTTP_HOST'] . CLIMATE_DIR_WWW . '/modules/weather' );
				exit( );
				
			} else {
				
				$group_id = 3;
				
				$strSQL = sprintf(
					'SELECT `users`.*, `groups`.`name` FROM `users` LEFT JOIN `groups` ON `users`.`group_id` = `groups`.`id` WHERE `users`.`id` = %u',
					mysql_real_escape_string( $teacher_id )
				);
				
				if ( ( $result = mysql_query( $strSQL ) ) === false || mysql_num_rows( $result ) === 0 || ( $row = mysql_fetch_assoc( $result ) ) == false || $row['name'] != 'Teachers' ) {
					$errors['form']['login-students']['instance'] = 'I did not recognize that teacher code. Please check the code and try again. [' . __LINE__ . ']';
				}
				
				if ( count( $errors['form']['login-students'] ) == 0 ) {
					
					$strSQL = sprintf(
						'INSERT INTO `users` ( `username` , `password` , `email` , `info` , `group_id` , `teacher_id` , `created` ) VALUES ( "%s" , "" , "%s" , "%s" , %u , %u , NULL )',
						mysql_real_escape_string( md5( __num2alpha( $teacher_id , 4 ) . ( $student ? $student : session_id( ) ) . APP_SECURITY_SALT ) ) ,
						mysql_real_escape_string( NULL ) ,
						mysql_real_escape_string( serialize( array( 'student_code' => $student ) ) ) ,
						mysql_real_escape_string( $group_id ) ,
						mysql_real_escape_string( $teacher_id )
					);
					
					if ( ( mysql_query( $strSQL ) ) !== false && mysql_affected_rows( ) > 0 ) {
						$_SESSION['student_id'] = mysql_insert_id( );
						$_SESSION['instance_code'] = $instance_code;
						header ( 'Location:  http://' . $_SERVER['HTTP_HOST'] . CLIMATE_DIR_WWW . '/modules/weather' );
					} else {
						$errors['general'][] = 'I was unable to register you. Please try again.';
					}
					
				}
				
			}
		} else {
			$errors['form']['login-students']['instance'] = 'I did not recognize that teacher code. Please check the code and try again. [' . __LINE__ . ']';
		}
	} else {
		$errors['general'][] = 'To log in you need to provide a valid teacher code';
	}
	
	sleep( 1 );
	
} 

?>

<?php if ( count( $errors['general'] ) > 0 ) { ?>
	<div class="dialog">
		<p><?php echo implode( '</p><p>' , $errors['general'] ); ?></p>
	</div>
<?php } ?>


<table cellpadding="10"><tr><td width="50%">
	<h2>Students</h2>
	<p>Your teacher will tell you what to enter for student code and teacher code.</p>
	<form name="login" method="POST" action="<?php echo $_SERVER['REQUEST_URI']; ?>">
	<p>
		<label for="student" class="<?php echo ( isset( $errors['form']['login-students']['student'] ) ? 'error' : '' ); ?>">Student Code:</label> &nbsp;
		<input name="student" type="text" id="student" size="24" value="<?php echo htmlentities( $student ); ?>" class="<?php echo ( isset( $errors['form']['login-students']['student'] ) ? 'error' : '' ); ?>" title="<?php echo ( isset( $errors['form']['login-students']['student'] ) ? trim( $errors['form']['login-students']['student'] ) : '' ); ?>" />
	</p>
	<p>
		<label for="instance" class="<?php echo ( isset( $errors['form']['login-students']['instance'] ) ? 'error' : '' ); ?>">Teacher Code:</label> &nbsp;
		<input name="instance" type="text" id="text" size="24" class="<?php echo ( isset( $errors['form']['login-students']['instance'] ) ? 'error' : '' ); ?>" title="<?php echo ( isset( $errors['form']['login-students']['instance'] ) ? trim( $errors['form']['login-students']['instance'] ) : '' ); ?>" />
	</p>
	<p>
		<input type="hidden" name="src" value="<?=htmlentities($src, ENT_QUOTES, 'UTF-8')?>" />
		<input type="submit" name="login-students" value="Start Module" />
	</p>
	</form>
</td><td width="50%">
	<h2>Everyone Else</h2>
	<p>You don't need to log in to use the module. <a href="<?php echo CLIMATE_DIR_WWW; ?>/modules/weather">Jump right in</a>!</p>
</table>

<script>
	$( function( ) {
		$( '.dialog' ).dialog( {
			modal   : true ,
			width   : 400 ,
			buttons : {
				OK : function( ) {
					$( this ).dialog( 'close' );
				}
			}
		} );
		$( 'input.error' ).tooltip( );
	} );
</script>

