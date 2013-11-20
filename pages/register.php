<?php
$group = 'Teachers';
$errors = array(
	'general' => array( ) ,
	'form' => array(
		'register' => array( )
	)
);

if ( isset( $_POST['register'] ) ) {
	
	$user = ( !empty( $_POST['user'] ) && strlen( $_POST['user'] ) > 0 ? $_POST['user'] : NULL );
	$pass = ( !empty( $_POST['pass'] ) && strlen( $_POST['pass'] ) > 0 ? $_POST['pass'] : NULL );
	$email = filter_var( trim( $_POST['email'] ) , FILTER_VALIDATE_EMAIL , array( 'default' => '' ) );
	$group = ( isset( $_POST['group'] ) && in_array( $_POST['group'] , array( 'Teachers' , 'Users' ) ) ? $_POST['group'] : 'Teachers' );
	
	if ( $user && $pass ) {
		
		$records = mysql_query( 'SELECT * FROM `groups`' );
		$groups = array();
		while ( $record = mysql_fetch_assoc( $records ) ) {
			$groups[$record['id']] = $record['name'];
		}
		
		$strSQL = sprintf(
			'SELECT * FROM `users` WHERE username=\'%s\'',
			mysql_real_escape_string( $user )
		);
		
		if ( ( $result = mysql_query( $strSQL ) ) !== false && mysql_num_rows( $result ) > 0 ) {
			
			$errors['form']['register']['user'] = 'That username has been taken. Please try another one.';
			
		} else {
			
			if ( count( $errors['form']['register'] ) == 0 ) {
				
				$strSQL = sprintf(
					'INSERT INTO `users` ( `username` , `password` , `email` , `group_id` , `teacher_id` , `created` ) VALUES ( "%s" , "%s" , "%s" , %u , 0 , NULL )',
					mysql_real_escape_string( $user ) ,
					mysql_real_escape_string( password_hash( $pass . APP_SECURITY_SALT , APP_SECURITY_HASH , array( 'cost' => APP_SECURITY_HASH_COST ) ) ) ,
					mysql_real_escape_string( $email ) ,
					mysql_real_escape_string( array_search( $group , $groups ) )
				);
				
				if ( ( mysql_query( $strSQL ) ) !== false && mysql_affected_rows( ) > 0 ) {
					$_SESSION['user_id'] = mysql_insert_id( );
					$_SESSION['user'] = $user;
					$_SESSION['group'] = $group;
					header ( 'Location:  http://' . $_SERVER['HTTP_HOST'] . CLIMATE_DIR_WWW . '/reports' , TRUE );
					return 302; exit;
				} else {
					$errors['general'][] = 'I was unable to register you. Please try again.';
				}
				
			}
			
		}
	
		sleep( 1 );
		
	} else {
		$errors['general'][] = 'You must enter both a username and password.';
	}

}
?>

<h2>Site Registration</h2>

<?php if ( count( $errors['general'] ) > 0 ) { ?>
	<div class="dialog">
		<p><?php echo implode( '</p><p>' , $errors['general'] ); ?></p>
	</div>
<?php } ?>
<?php if ( count( $errors['form']['register'] ) > 0 ) { ?>
	<div class="dialog">
		<p>I was unable to validate the information you submitted. Please correct the errors noted below and try again.</p>
	</div>
<?php } ?>

<div>
	<form name="register" method="POST" action="<?php echo $_SERVER['REQUEST_URI']; ?>">
	<p><input type="radio" name="group" id="group-teacher" value="Teachers" <?php if ( $group == 'Teachers' ) { echo 'checked="checked"'; } ?>> <label for="group-teacher">I am a teacher and want to use the module in my classroom.</label></p>
	<p><input type="radio" name="group" id="group-individual" value="Users" <?php if ( $group == 'Users' ) { echo 'checked="checked"'; } ?>> <label for="group-individual">I am an individual and would like to use the module and save and view my work.</p>
	<p class="labelColumn">
		<label for="user" class="<?php echo ( isset( $errors['form']['register']['user'] ) ? 'error' : '' ); ?>">Username:</label> &nbsp;
		<input name="user" type="text" id="user" size="24" value="<?php echo htmlentities( $user ); ?>" class="<?php echo ( isset( $errors['form']['register']['user'] ) ? 'error' : '' ); ?>" title="<?php echo ( isset( $errors['form']['register']['user'] ) ? trim( $errors['form']['register']['user'] ) : '' ); ?>" />
	</p>
	<p class="labelColumn">
		<label for="pass" class="<?php echo ( isset( $errors['form']['register']['pass'] ) ? 'error' : '' ); ?>">Password:</label> &nbsp;
		<input name="pass" type="password" id="pass" size="24" value="<?php echo htmlentities( $pass ); ?>" class="<?php echo ( isset( $errors['form']['register']['pass'] ) ? 'error' : '' ); ?>" title="<?php echo ( isset( $errors['form']['register']['user'] ) ? trim( $errors['form']['register']['pass'] ) : '' ); ?>" />
	</p>
	<p class="labelColumn">
		<label for="pass" class="<?php echo ( isset( $errors['form']['register']['email'] ) ? 'error' : '' ); ?>">Email:</label> &nbsp;
		<input name="email" type="text" id="email" size="24" value="<?php echo htmlentities( $email ); ?>" class="<?php echo ( isset( $errors['form']['register']['email'] ) ? 'error' : '' ); ?>" title="<?php echo ( isset( $errors['form']['register']['user'] ) ? trim( $errors['form']['register']['email'] ) : '' ); ?>" />
		<br><span style="font-size: 78%">(for password recovery)</span>
	</p>
	<p>
		<input class="button" type="submit" name="register" value="Register" />
	</p>
	</form>
</div>

<?php if ( strlen( ADMIN_EMAIL ) > 0 ) { ?>
	<p>If you have problems or questions with log in or registration contact <a href="mailto:<?php echo ADMIN_EMAIL; ?>"><?php echo ( strlen( ADMIN_NAME ) > 0 ? ADMIN_NAME : ADMIN_EMAIL ); ?></a></p>
<?php } ?>

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

