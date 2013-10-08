<?php
define( 'TEACHERS_CODE' , 'climate tlc' );

$src = ( isset( $_GET['src'] ) ? $_GET['src'] : '' );
$errors = array(
	'general' => array( ) ,
	'form' => array(
		'login' => array( )
	)
);

if ( isset( $_POST['login'] ) ) {
	
	$src = ( !empty( $_POST['src'] ) && strlen( $_POST['src'] ) > 0 ? $_POST['src'] : NULL );
	$user = ( !empty( $_POST['user'] ) && strlen( $_POST['user'] ) > 0 ? $_POST['user'] : NULL );
	$pass = ( !empty( $_POST['pass'] ) && strlen( $_POST['pass'] ) > 0 ? $_POST['pass'] : NULL );
	$teacher = ( !empty( $_POST['teacher'] ) && strlen( trim( $_POST['teacher'] ) ) > 0 ? ( $_POST['teacher'] == TEACHERS_CODE ? $_POST['teacher'] : trim( $_POST['teacher'] ) ) : NULL );
	$email = ( !empty( $_POST['email'] ) && strlen( trim( $_POST['email'] ) ) > 0 && filter_var( trim( $email ) , FILTER_VALIDATE_EMAIL ) ? trim( $email ) : NULL );
	
	if ( $user && $pass ) {
		
		$strSQL = sprintf(
			'SELECT `users`.*, `groups`.`name` FROM `users` LEFT JOIN `groups` ON `users`.`group_id` = `groups`.`id` WHERE username=\'%s\'',
			mysql_real_escape_string( $user )
		);
		
		if ( ( $result = mysql_query( $strSQL ) ) !== false && mysql_num_rows( $result ) > 0 && ( $row = mysql_fetch_assoc( $result ) ) && password_verify( $pass . APP_SECURITY_SALT , $row['password'] ) ) {
			
			$_SESSION['user_id'] = $row['id'];
			$_SESSION['user'] = $row['username'];
			if ( strlen( $src ) > 0 ) {
				header( 'Location:  http://' . $_SERVER['HTTP_HOST'] . $src );
			} else {
				header( 'Location:  http://' . $_SERVER['HTTP_HOST'] . CLIMATE_DIR_WWW . '/' . ( $row['name'] == 'Teachers' ? 'reports' : 'module' ) );
			}
			exit( );
			
		} else {
			$errors['general'][] = 'The username or password were incorrect. Please try again.';
		}
		
		sleep( 1 );
		
	} else {
		$errors['general'][] = 'You must enter both a username and password.';
	}

} 

?>

<?php if ( count( $errors['general'] ) > 0 ) { ?>
	<div class="dialog">
		<p><?php echo implode( '</p><p>' , $errors['general'] ); ?></p>
	</div>
<?php } ?>

	<h2>Login</h2>
	<p>Log in to create teacher codes and view reponses from your students. If you do not have a username visit the <a href="<?php echo CLIMATE_DIR_WWW; ?>/register">registration page</a>.</p>
	<div>
		<form name="login" method="POST" action="<?php echo $_SERVER['REQUEST_URI']; ?>">
			<p>
				<label for="user">Username:</label> &nbsp;
				<input name="user" type="text" id="user" size="24" value="<?php echo htmlentities( $user ); ?>" class="<?php echo ( isset( $errors['form']['login']['user'] ) ? 'error' : '' ); ?>" title="<?php echo ( isset( $errors['form']['login']['user'] ) ? trim( $errors['form']['login']['user'] ) : '' ); ?>" />
			</p>
			<p>
				<label for="pass">Password:</label> &nbsp;
				<input name="pass" type="password" id="pass" size="24" class="<?php echo ( isset( $errors['form']['login']['pass'] ) ? 'error' : '' ); ?>" title="<?php echo ( isset( $errors['form']['login']['pass'] ) ? trim( $errors['login']['form']['pass'] ) : '' ); ?>" />
			</p>
			<p>
				<label for="teacher">Teacher Code:</label> &nbsp;
				<input name="teacher" type="text" id="teacher" size="24" class="<?php echo ( isset( $errors['form']['login']['teacher'] ) ? 'error' : '' ); ?>" title="<?php echo ( isset( $errors['form']['login']['teacher'] ) ? trim( $errors['login']['form']['teacher'] ) : '' ); ?>" />
			</p>
			<p>
				<input type="hidden" name="src" value="<?=htmlentities($src, ENT_QUOTES, 'UTF-8')?>" />
				<input type="submit" name="login" value="Log In" />
			</p>
		</form>
	</div>

	<?php if ( strlen( ADMIN_EMAIL ) > 0 ) { ?>
		<p>If you have problems or questions with log in or registration contact <a href="mailto:<?php echo ADMIN_EMAIL; ?>"><?php echo ( strlen( ADMIN_NAME ) > 0 ? ADMIN_NAME : ADMIN_EMAIL ); ?></a></p>
	<?php } ?>
</div>

<script>
	$( function( ) {
		document.forms[0].user.focus();
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

