<?php
$student_id = ( !empty( $_GET['student'] ) && is_numeric( trim( $_GET['student'] ) ) ? (int) $_GET['student'] : NULL );
$students = array();

$domdoc = new DOMDocument;
$domdoc->loadHTMLFile( 'module.html' );
$domnodes = $domdoc->getElementsByTagName('label');

$sql_stmt = sprintf(
	'SELECT * FROM `users` WHERE `teacher_id` = %u' ,
	mysql_real_escape_string( $_SESSION['user_id'] )
);
if ( ( $student_records = mysql_query( $sql_stmt ) ) !== FALSE ) { while ( $student_record = mysql_fetch_assoc( $student_records ) ) {
	$students[ $student_record['id'] ] = array(
		'info' => array(
			'username' => $student_record['username'] ,
			'lastActive' => NULL
		) ,
		'data' => array( )
	);
	
	$sql_stmt = sprintf(
		'SELECT * FROM `activity` WHERE `user_id` = %u ORDER BY `created`' ,
		mysql_real_escape_string( $student_record['id'] )
	);
	if ( ( $activity_records = mysql_query( $sql_stmt ) ) !== FALSE ) {
		while ( ( $activity_record = mysql_fetch_assoc( $activity_records ) ) !== FALSE ) {
			$students[ $student_record['id'] ]['info']['lastActive'] = $activity_record['created'];
			$students[ $student_record['id'] ]['data'][ $activity_record['container'] ] = unserialize( $activity_record['data'] );
		}
	}
} }
?>

<!DOCTYPE html>

<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  
<title>Weather School / Teacher Report</title>

<link rel="stylesheet" type="text/css" href="http://ajax.googleapis.com/ajax/libs/jqueryui/1.10.0/themes/smoothness/jquery-ui.css" />

</head>

<body>
	
<p>Your teacher code is <strong><?php echo strtoupper( __num2alpha( $_SESSION['user_id'] , 5 ) ) ;?></strong></p>

<div class="tabs">
	
	<ul>
		<li><a href="#students">Your Students</a></li>
		<li><a href="#summary-report">Summary Report</a></li>
		<?php if ( isset( $student_id ) && count( $students[$student_id]['data'] ) > 0 ) { echo '<li><a href="#detail-report-' , $student_id , '">Detail Report for ' , htmlentities( $students[$student_id]['info']['username'] ) , '</a></li>'; } ?>
	</ul>
	
	<div id="students">
		<?php
		$sql_stmt = sprintf(
			'SELECT `users`.* , MAX( `activity`.`created` ) AS `lastActive` FROM `users` LEFT JOIN `activity` ON `users`.`id` = `activity`.`user_id` WHERE `teacher_id` = %u GROUP BY `users`.`id`' ,
			mysql_real_escape_string( $_SESSION['user_id'] )
		);
		
		if ( ( $records = mysql_query( $sql_stmt ) ) !== FALSE ) {
			echo '
				<h2>Your Students</h2>
				<table border="0" cellpadding="4"><tr><th>User</th><th>Last Active</th><th></th></tr>
			';
			while ( ( $record = mysql_fetch_assoc( $records ) ) !== FALSE ) {
				echo '<tr><td>' , $record['username'] , '</td><td>' , $record['lastActive'] , '</td><td>';
				if ( !empty( $record['lastActive'] ) ) {
					echo '<a href="' , $_SERVER['PHP_SELF'] , '?student=' , $record['id'] , '">load answers</a> | <a href="module.html?replay=student&amp;id=' , $record['id'] , '" target="_blank">replay module</a>';
				}
				echo '</td></tr>';
			}
			echo '</table>';
		} else {
			echo '<p>No activity recorded.</p>';
		}
		?>
	</div>
	
	
	<div id="summary-report">
		<div class="accordion">
		<?php
		foreach ( $domnodes as $domnode ) {
			if ( $domnode->hasAttribute( 'for' ) && ( $label_target = $domnode->getAttribute( 'for' ) ) !== '' ) {
				$responses = array();
				foreach ( $students as $id => $student ) {
					if ( strlen( trim( $student['data'][$label_target]['usrInput'] ) ) > 0 ) {
						$responses[] = trim( $student['data'][$label_target]['usrInput'] );
					}
				}
				echo
					'<h3>' , $domnode->nodeValue , '</h3><div><ul><li>' ,
					implode( '</li><li>' , $responses ) ,
					'</li></ul></div>'
				;
			}
		}
		?>
		</div>
	</div>
	
	
	<?php if ( isset( $student_id ) && count( $students[$student_id]['data'] ) > 0 ) { ?>
		<div id="detail-report-<?php echo $student_id ?>">
			<?php
			foreach ( $domnodes as $domnode ) {
				if ( $domnode->hasAttribute( 'for' ) && ( $label_target = $domnode->getAttribute( 'for' ) ) !== '' ) {
					echo '<p><i>' , $domnode->nodeValue , '</i><br>' , ( strlen( trim( $students[$student_id]['data'][$label_target]['usrInput'] ) ) > 0 ? trim( $students[$student_id]['data'][$label_target]['usrInput'] ) : '--' ) , '</p>';
				}
			}
			?>
		</div>
	<?php } ?>
	
</div>

<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.js"></script>
<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jqueryui/1.10.0/jquery-ui.js"></script>
<script>
	$( function( ) {
		$( '.tabs' ).tabs( { } );
		$( '.accordion' ).accordion( {
			active      : false ,
			heightStyle : 'content' ,
			collapsible : true
		} );
	} );
</script>
</body>
</html>

<?php /*echo '<pre>' , print_r($students,true) , '</pre>';*/ ?>