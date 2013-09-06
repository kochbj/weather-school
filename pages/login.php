<?php
define( 'TEACHERS_CODE' , 'climate tlc' );

$src = isset( $_GET['src'] ) ? $_GET['src'] : '';
$errors = array(
	'general' => array( ) ,
	'form' => array(
		'login' => array( ) ,
		'register' => array( )
	)
);

if ( isset( $_POST['login'] ) || isset( $_POST['register'] ) ) {
	
	$src = ( !empty( $_POST['src'] ) && strlen( $_POST['src'] ) > 0 ? $_POST['src'] : NULL );
	$user = ( !empty( $_POST['user'] ) && strlen( $_POST['user'] ) > 0 ? $_POST['user'] : NULL );
	$pass = ( !empty( $_POST['pass'] ) && strlen( $_POST['pass'] ) > 0 ? $_POST['pass'] : NULL );
	$teacher = ( !empty( $_POST['teacher'] ) && strlen( trim( $_POST['teacher'] ) ) > 0 ? ( $_POST['teacher'] == TEACHERS_CODE ? $_POST['teacher'] : trim( $_POST['teacher'] ) ) : NULL );
	$email = ( !empty( $_POST['email'] ) && strlen( trim( $_POST['email'] ) ) > 0 && filter_var( trim( $email ) , FILTER_VALIDATE_EMAIL ) ? trim( $email ) : NULL );
	
	if ( $user && $pass ) {
		
		if ( isset( $_POST['login'] ) ) {
			
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
			
		} elseif ( isset( $_POST['register'] ) ) {
			
			$strSQL = sprintf(
				'SELECT * FROM `users` WHERE username=\'%s\'',
				mysql_real_escape_string( $user )
			);
			
			if ( ( $result = mysql_query( $strSQL ) ) !== false && mysql_num_rows( $result ) > 0 ) {
				
				$errors['register']['user'] = 'That username has been taken. Please try another one.';
				
			} else {
				
				$teacher_id = 0;
				$group_id = 3;
				
				if ( $teacher && strtolower( $teacher ) != TEACHERS_CODE ) {
					
					$strSQL = sprintf(
						'SELECT `users`.*, `groups`.`name` FROM `users` LEFT JOIN `groups` ON `users`.`group_id` = `groups`.`id` WHERE `users`.`id` = %u',
						mysql_real_escape_string( __alpha2num( $teacher ) )
					);
					
					if ( ( $result = mysql_query( $strSQL ) ) !== false && mysql_num_rows( $result ) > 0 && ( $row = mysql_fetch_assoc( $result ) ) && $row['name'] == 'Teachers' ) {
						$teacher_id = $row['id'];
					} else {
						$errors['register']['teacher'] = 'I did not recognize that teacher code. Please check the code and try again.';
					}
					
				} elseif ( $teacher && strtolower( $teacher ) == TEACHERS_CODE ) {
					$group_id = 2;
				}
				
				if ( count( $errors['register'] ) == 0 ) {
					
					$strSQL = sprintf(
						'INSERT INTO `users` ( `username` , `password` , `email` , `group_id` , `teacher_id` , `created` ) VALUES ( "%s" , "%s" , "%s" , %u , %u , NULL )',
						mysql_real_escape_string( $user ) ,
						mysql_real_escape_string( password_hash( $pass . APP_SECURITY_SALT , APP_SECURITY_HASH , array( 'cost' => APP_SECURITY_HASH_COST ) ) ) ,
						mysql_real_escape_string( $email ) ,
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
			
		}
		
		sleep( 1 );
		
	} else {
		$errors['general'][] = 'You must enter both a username and password.';
	}

} 

?>
<!DOCTYPE html>

<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  
<title>Weather School / Login</title>

<link rel="stylesheet" type="text/css" href="http://ajax.googleapis.com/ajax/libs/jqueryui/1.10.0/themes/smoothness/jquery-ui.css" />

<style>
	#loginBox { margin: 2em auto; padding: .25em; width: 450px; background-color: #99aacc; border-radius: 5px; text-align: center; font-family: Arial, sans-serif; }
	input[type=text] , input[type=password] { width: 100%; padding: .5em; border-radius: 5px; border: none; }
	form { margin: 0px; }
	
	.ui-widget-content {
		background-image: none;
		background-color: #c0cacf;
	}
	.ui-accordion-header a {
		display: block;
	}
	.ui-dialog-titlebar {
		display: none;
	}
	.ui-tooltip {
		padding: 10px 20px;
		background-color: orange;
		border-radius: 20px;
		box-shadow: 0 0 7px black;
		border: 1px solid black;
	}	
	input.error {
		border: 1px solid red;
	}
</style>

</head>

<body>
	
<?php if ( count( $errors['general'] ) > 0 ) { ?>
	<div class="dialog">
		<p><?php echo implode( '</p><p>' , $errors['general'] ); ?></p>
	</div>
<?php } ?>

<div id="loginBox">
	<div class="accordion">
		<h3>Login</h3>
		<div>
			<form name="login" method="POST" action="<?php echo $_SESSION['PHP_SELF']; ?>">
			<p>
				<label for="user">Username:</label><br>
				<input name="user" type="text" id="user" size="24" value="<?php echo htmlentities( $user ); ?>" class="<?php echo ( isset( $errors['login']['user'] ) ? 'error' : '' ); ?>" title="<?php echo ( isset( $errors['login']['user'] ) ? trim( $errors['login']['user'] ) : '' ); ?>" />
			</p>
			<p>
				<label for="pass">Password:</label><br>
				<input name="pass" type="password" id="pass" size="24" class="<?php echo ( isset( $errors['login']['pass'] ) ? 'error' : '' ); ?>" title="<?php echo ( isset( $errors['login']['passF'] ) ? trim( $errors['login']['pass'] ) : '' ); ?>" />
			</p>
			<p>
				<input type="hidden" name="src" value="<?=htmlentities($src, ENT_QUOTES, 'UTF-8')?>" />
				<input type="submit" name="login" value="Log In" />
			</p>
			</form>
		</div>
		
		<h3>Register</h3>
		<div>
			<form name="register" method="POST" action="<?php echo $_SESSION['PHP_SELF']; ?>">
			<p>
				<label for="user">Username:</label><br>
				<input name="user" type="text" id="user" size="24" value="<?php echo htmlentities( $user ); ?>" class="<?php echo ( isset( $errors['register']['user'] ) ? 'error' : '' ); ?>" title="<?php echo ( isset( $errors['register']['user'] ) ? trim( $errors['register']['user'] ) : '' ); ?>" />
			</p>
			<p>
				<label for="pass">Password:</label><br>
				<input name="pass" type="password" id="pass" size="24" class="<?php echo ( isset( $errors['register']['pass'] ) ? 'error' : '' ); ?>" title="<?php echo ( isset( $errors['register']['user'] ) ? trim( $errors['register']['pass'] ) : '' ); ?>" />
			</p>
			<p>
				<label for="pass">Email:<br><span style="font-size: 78%">(for password recovery)</span></label><br>
				<input name="email" type="text" id="email" size="24" class="<?php echo ( isset( $errors['register']['email'] ) ? 'error' : '' ); ?>" title="<?php echo ( isset( $errors['register']['user'] ) ? trim( $errors['register']['email'] ) : '' ); ?>" />
			</p>
			<p>
				<label for="teacher">Teacher Code:<br><span style="font-size: 78%">(if you have one)</span></label><br>
				<input name="teacher" type="text" id="teacher" size="24" value="<?php echo htmlentities( $teacher ); ?>" class="<?php echo ( isset( $errors['register']['teacher'] ) ? 'error' : '' ); ?>" title="<?php echo ( isset( $errors['register']['teacher'] ) ? trim( $errors['register']['teacher'] ) : '' ); ?>" />
			</p>
			<p>
				<input type="hidden" name="src" value="<?=htmlentities($src, ENT_QUOTES, 'UTF-8')?>" />
				<input type="submit" name="register" value="Register" />
			</p>
			</form>
		</div>
	</div>
	
	<div class="ui-accordion ui-widget ui-helper-reset"><h3 class="ui-accordion-header ui-helper-reset ui-state-default ui-corner-all ui-accordion-icons"><a href="module.html">I do not want to log in</a></h3></div>
	
	<?php if ( strlen( ADMIN_EMAIL ) > 0 ) { ?>
		<p>If you have problems or questions with log in or registration contact <a href="mailto:<?php echo ADMIN_EMAIL; ?>"><?php echo ( strlen( ADMIN_NAME ) > 0 ? ADMIN_NAME : ADMIN_EMAIL ); ?></a></p>
	<?php } ?>
</div>

<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.js"></script>
<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jqueryui/1.10.0/jquery-ui.js"></script>
<script>
	$( function( ) {
		document.forms[0].user.focus();
		
		$( '.accordion' ).accordion( {
			active      : <?php echo ( isset( $_POST['register'] ) ? 1 : 0 ) ?> ,
			heightStyle : 'content'
		} );
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
