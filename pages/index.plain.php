<?php
require_once 'config.php';

define( 'TEACHERS_CODE' , 'climate tlc' );

$src = isset( $_GET['src'] ) ? $_GET['src'] : '';
$errors = array(
	'general' => array( ) ,
	'form' => array(
		'login' => array( ) ,
		'register' => array( )
	)
);

if ( isset( $_POST['login-teachers'] ) || isset( $_POST['login-students'] ) ) {
	
	$src = ( !empty( $_POST['src'] ) && strlen( $_POST['src'] ) > 0 ? $_POST['src'] : NULL );
	$user = ( !empty( $_POST['user'] ) && strlen( $_POST['user'] ) > 0 ? $_POST['user'] : NULL );
	$pass = ( !empty( $_POST['pass'] ) && strlen( $_POST['pass'] ) > 0 ? $_POST['pass'] : NULL );
	$student = ( !empty( $_POST['student'] ) && strlen( $_POST['student'] ) > 0 ? $_POST['student'] : NULL );
	$teacher = ( !empty( $_POST['teacher'] ) && strlen( trim( $_POST['teacher'] ) ) > 0 ? ( $_POST['teacher'] == TEACHERS_CODE ? $_POST['teacher'] : trim( $_POST['teacher'] ) ) : NULL );
	$email = ( !empty( $_POST['email'] ) && strlen( trim( $_POST['email'] ) ) > 0 && filter_var( trim( $email ) , FILTER_VALIDATE_EMAIL ) ? trim( $email ) : NULL );
	
	if ( isset( $_POST['login-teachers'] ) ) {
		if (  $user && $pass ) {
			
			$strSQL = sprintf(
				'SELECT `users`.*, `groups`.`name` FROM `users` LEFT JOIN `groups` ON `users`.`group_id` = `groups`.`id` WHERE username=\'%s\'',
				mysql_real_escape_string( $user )
			);
			
			if ( ( $result = mysql_query( $strSQL ) ) !== false && mysql_num_rows( $result ) > 0 && ( $row = mysql_fetch_assoc( $result ) ) && password_verify( $pass . APP_SECURITY_SALT , $row['password'] ) ) {
			
				$_SESSION['user_id'] = $row['id'];
				if ( strlen( $src ) > 0 ) {
					header ( 'Location:  http://' . $_SERVER['HTTP_HOST'] . $src );
				} else {
					header ( 'Location:  http://' . $_SERVER['HTTP_HOST'] . dirname( $_SERVER['PHP_SELF'] ) . '/' . ( $row['name'] == 'Teachers' ? 'report.php' : 'module.html' ) );
				}
				exit( );
				
			} else {
				$errors['general'][] = 'The username or password were incorrect. Please try again.';
			}
			
		} else {
			$errors['general'][] = 'You must supply both a username and password to log in as a teacher.';
		}
		
	} elseif ( isset( $_POST['login-students'] ) ) {
		
		if ( $teacher ) {
			
			$strSQL = sprintf(
				'SELECT `users`.*, `groups`.`name` FROM `users` LEFT JOIN `groups` ON `users`.`group_id` = `groups`.`id` WHERE username=\'%s\'',
				mysql_real_escape_string( md5( ( $student ? $student : session_id( ) ) . $teacher . APP_SECURITY_SALT ) )
			);
			
			if ( ( $result = mysql_query( $strSQL ) ) !== false && mysql_num_rows( $result ) > 0 && ( $row = mysql_fetch_assoc( $result ) ) ) {
				
				$_SESSION['user_id'] = $row['id'];
				if ( strlen( $src ) > 0 ) {
					header ( 'Location:  http://' . $_SERVER['HTTP_HOST'] . $src );
				} else {
					header ( 'Location:  http://' . $_SERVER['HTTP_HOST'] . dirname( $_SERVER['PHP_SELF'] ) . '/' . ( $row['name'] == 'Teachers' ? 'report.php' : 'module.html' ) );
				}
				exit( );
				
			} else {
				
				$teacher_id = 0;
				$group_id = 3;
				
				$strSQL = sprintf(
					'SELECT `users`.*, `groups`.`name` FROM `users` LEFT JOIN `groups` ON `users`.`group_id` = `groups`.`id` WHERE `users`.`id` = %u',
					mysql_real_escape_string( __alpha2num( $teacher ) )
				);
				
				if ( ( $result = mysql_query( $strSQL ) ) !== false && mysql_num_rows( $result ) > 0 && ( $row = mysql_fetch_assoc( $result ) ) && $row['name'] == 'Teachers' ) {
					$teacher_id = $row['id'];
				} else {
					$errors['register']['teacher'] = 'I did not recognize that teacher code. Please check the code and try again.';
				}
				
				if ( count( $errors['register'] ) == 0 ) {
					
					$strSQL = sprintf(
						'INSERT INTO `users` ( `username` , `password` , `email` , `info` , `group_id` , `teacher_id` , `created` ) VALUES ( "%s" , "" , "%s" , "%s" , %u , %u , NULL )',
						mysql_real_escape_string( md5( ( $student ? $student : session_id( ) ) . $teacher . APP_SECURITY_SALT ) ) ,
						mysql_real_escape_string( $email ) ,
						mysql_real_escape_string( serialize( array( 'student' => $student ) ) ) ,
						mysql_real_escape_string( $group_id ) ,
						mysql_real_escape_string( $teacher_id )
					);
					
					if ( ( mysql_query( $strSQL ) ) !== false && mysql_affected_rows( ) > 0 ) {
						$_SESSION['user_id'] = mysql_insert_id( );
						if ( strlen( $src ) > 0 ) {
							header ( 'Location:  http://' . $_SERVER['HTTP_HOST'] . $src );
						} else {
							header ( 'Location:  http://' . $_SERVER['HTTP_HOST'] . dirname( $_SERVER['PHP_SELF'] ) . '/' . ( $group_id == 2 ? 'report.php' : 'module.html' ) );
						}
					} else {
						$errors['general'][] = 'I was unable to register you. Please try again.';
					}
					
				}
				
			}
			
		} else {
			$errors['general'][] = 'You must supply a teacher code to log in as a student.';
		}
		
	}
	
	sleep( 1 );
	
} 

?>
<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">

	<title>Weather School</title>
	<meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1">
	
	<link rel="stylesheet" type="text/css" href="../includes/css/fonts/CartoGothicStd/CartoGothicStd.css" />
	
	<link rel="stylesheet" type="text/css" href="http://ajax.googleapis.com/ajax/libs/jqueryui/1.10.0/themes/smoothness/jquery-ui.css" />
	
	<link rel="stylesheet" type="text/css" href="../includes/css/weather-school-intro.css" />
	
	<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.js"></script>
	<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jqueryui/1.10.0/jquery-ui.js"></script>
	
</head>
<body>
	
	<h1>AAAS Project 2061 Weather School</h1>
	
	<?php if ( count( $errors['general'] ) > 0 ) { ?>
		<div class="dialog">
			<p><?php echo implode( '</p><p>' , $errors['general'] ); ?></p>
		</div>
	<?php } ?>

	<div id="panel-students">
		<h2>Students</h2>
		<p>Your teacher will tell you what to enter for student code and teacher code.</p>
		<form name="login" method="POST" action="<?php echo $_SESSION['PHP_SELF']; ?>">
		<p>
			<label for="user">Student Code:</label><br>
			<input name="student" type="text" id="student" size="24" value="<?php echo htmlentities( $student ); ?>" class="<?php echo ( isset( $errors['login']['student'] ) ? 'error' : '' ); ?>" title="<?php echo ( isset( $errors['login']['student'] ) ? trim( $errors['login']['student'] ) : '' ); ?>" />
		</p>
		<p>
			<label for="teacher">Teacher Code:</label><br>
			<input name="teacher" type="text" id="text" size="24" class="<?php echo ( isset( $errors['login']['teacher'] ) ? 'error' : '' ); ?>" title="<?php echo ( isset( $errors['login']['teacher'] ) ? trim( $errors['login']['teacher'] ) : '' ); ?>" />
		</p>
		<p>
			<input type="hidden" name="src" value="<?=htmlentities($src, ENT_QUOTES, 'UTF-8')?>" />
			<input type="submit" name="login-students" value="Start Module" />
		</p>
		</form>
	</div>
	
	<div id="panel-teachers">
		<h2>Teachers</h2>
		<p><a href="login.php#register">Log in here</a> or register to create and access class reports.</p>
		<form name="login" method="POST" action="<?php echo $_SESSION['PHP_SELF']; ?>">
		<p>
			<label for="user">Username:</label><br>
			<input name="user" type="text" id="user" size="24" value="<?php echo htmlentities( $user ); ?>" class="<?php echo ( isset( $errors['login']['user'] ) ? 'error' : '' ); ?>" title="<?php echo ( isset( $errors['login']['user'] ) ? trim( $errors['login']['user'] ) : '' ); ?>" />
		</p>
		<p>
			<label for="pass">Password:</label><br>
			<input name="pass" type="password" id="pass" size="24" class="<?php echo ( isset( $errors['login']['pass'] ) ? 'error' : '' ); ?>" title="<?php echo ( isset( $errors['login']['user'] ) ? trim( $errors['login']['pass'] ) : '' ); ?>" />
		</p>
		<p>
			<input type="hidden" name="src" value="<?=htmlentities($src, ENT_QUOTES, 'UTF-8')?>" />
			<input type="submit" name="login-teachers" value="Log In" />
		</p>
		</form>
	</div>
	
	<div id="panel-others">
		<h2>Everyone Else</h2>
		<p>You don't need to log in to use the module. <a href="module.html">Jump right in</a>!</p>
	</div>
	
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
</body>
</html>
