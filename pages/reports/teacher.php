<?php
$instance_code = ( !empty( $_GET['instance'] ) && trim( $_GET['instance'] ) ? $_GET['instance'] : NULL );
$student_id = ( !empty( $_GET['student_id'] ) && is_numeric( trim( $_GET['student_id'] ) ) ? (int) $_GET['student_id'] : NULL );
$students = array();

if ( isset( $_POST['create'] ) ) {
	$sql_stmt = sprintf(
		'INSERT INTO `instances` ( `user_id` , `label` , `created` ) VALUES ( %u , "%s" , NULL )' ,
		mysql_real_escape_string( $_SESSION['user_id'] ) ,
		mysql_real_escape_string( isset( $_POST['instLabel'] ) && strlen( trim( $_POST['instLabel'] ) ) > 0 ? filter_var( trim( $_POST['instLabel'] ) , FILTER_SANITIZE_STRING , FILTER_FLAG_STRIP_LOW|FILTER_FLAG_STRIP_HIGH|FILTER_FLAG_ENCODE_AMP ) : 'Instance created on ' . date( 'Y-m-d h:m:s' ) )
	);
	mysql_query( $sql_stmt );
	header( 'Location:  http://' . $_SERVER['HTTP_HOST'] . CLIMATE_DIR_WWW . $_SERVER['SCRIPT_URL'] );
	exit();
}

if ( $instance_code ) {
	$domdoc = new DOMDocument;
	$domdoc->loadHTMLFile( CLIMATE_DIR . DIRECTORY_SEPARATOR . modules . DIRECTORY_SEPARATOR . 'weather/slides.php' );
	$xpath = new DOMXpath( $domdoc );
	$module = array( );
	$slides = $xpath->query( '/html/body/div[@data-slide-type="key"]' );
	foreach ( $slides as $slide ) {
		$module[ $slide->getAttribute( 'id' ) ] = array(
			'title' => $slide->getAttribute( 'data-slide-group-title' ) ,
			'label_count' => $xpath->query( './/label' , $slide )->length ,
			'slides' => array(
				$slide
			)
		);
	}
	$slides = $xpath->query( '/html/body/div[@data-slide-type="normal"]' );
	foreach ( $slides as $slide ) {
		$module[ $slide->getAttribute( 'data-slide-parent-id' ) ]['slides'][] = $slide;
		$module[ $slide->getAttribute( 'data-slide-parent-id' ) ]['label_count'] += $xpath->query( './/label' , $slide )->length;
	}
	$label_count = $domdoc->getElementsByTagName( 'label' )->length;
	
	$sql_stmt = sprintf(
		'SELECT * FROM instances WHERE user_id = %u AND id = %u' ,
		mysql_real_escape_string( $_SESSION['user_id'] ) ,
		mysql_real_escape_string( __alpha2num( $instance_code ) )
	);
	$instance = mysql_fetch_assoc( mysql_query( $sql_stmt ) );
	
	$sql_stmt = sprintf(
		'SELECT `users`.* , MAX( `activity`.`created` ) AS `lastActive` FROM `users` LEFT JOIN `activity` ON `users`.`id` = `activity`.`user_id` WHERE `teacher_id` = %u AND `instance_id` = %u GROUP BY `users`.`id`' ,
		mysql_real_escape_string( $_SESSION['user_id'] ) ,
		mysql_real_escape_string( __alpha2num( $instance_code ) )
	);
	
	if ( ( $student_records = mysql_query( $sql_stmt ) ) !== FALSE ) { while ( $student_record = mysql_fetch_assoc( $student_records ) ) {
		$student_record['info'] = unserialize( $student_record['info'] );
		$students[ $student_record['id'] ] = array(
			'info' => array(
				'id' => $student_record['id'] ,
				'username' => $student_record['username'] ,
				'student_code' => $student_record['info']['student_code'] ,
				'lastActive' => $student_record['lastActive'] ,
				'answered' => 0
			) ,
			'data' => array( )
		);
		
		$sql_stmt = sprintf(
			'SELECT * FROM `activity` WHERE `user_id` = %u AND `instance_id` = %u ORDER BY `created`' ,
			mysql_real_escape_string( $student_record['id'] ) ,
			mysql_real_escape_string( __alpha2num( $instance_code ) )
		);
		if ( ( $activity_records = mysql_query( $sql_stmt ) ) !== FALSE ) {
			while ( ( $activity_record = mysql_fetch_assoc( $activity_records ) ) !== FALSE ) {
				$students[ $student_record['id'] ]['data'][ $activity_record['container'] ] = unserialize( $activity_record['data'] );
				if ( array_key_exists( 'usrInput' , $students[ $student_record['id'] ]['data'][ $activity_record['container'] ] ) ) {
					$students[ $student_record['id'] ]['info']['answered']++;
				}
			}
		}
	} }
?>

	<h2>Use the module in your classroom</h2>
	
	<h3>Current Record: <?php echo $instance['label']; ?></h3>
	<div style="float: right;"><a href="reports">Return to your record list</a></div>
	<div>
		<b>Teacher code:</b> <?php echo __num2alpha( $instance['id'] , 4 ); ?>
		&nbsp; | &nbsp;
		<b>Number of students:</b> <?php echo count( $students ); ?>
	</div>
	
	<div class="tabs">
		
		<ul>
			<li><a href="#students">Class List</a></li>
			<?php if ( isset( $student_id ) && count( $students[$student_id]['data'] ) > 0 ) { echo '<li><a href="#detail-report-' , $student_id , '">Responses: ' , htmlentities( $students[$student_id]['info']['student_code'] ) , '</a></li>'; } ?>
			<li><a href="#summary-report">Responses: All Students</a></li>
		</ul>
		
		<div id="students">
			<?php
			if ( count( $students ) > 0 ) {
				echo '
					<h3>Class List</h3>
					<p>The following lists the students who have used the module. If you provided student codes and the student used the same code each time then their work will be collected under the same record. Click on a student name to view that student\'s responses.</p>
					<table border="0" cellpadding="4" class="list"><tr><th>Student Code</th><th>Last Active</th><th>% Complete</th></tr>
				';
				foreach ( $students as $id => $student ) {
					echo '
						<tr><td>
							<a href="' , $_SERVER['SCRIPT_URL'] , '?instance=' , $instance_code , '&amp;student_id=' , $id , '#detail-report-' , $id , '" class="hinted">
							' , ( strlen( $student['info']['student_code'] ) > 0 ? $student['info']['student_code'] : '&mdash;&mdash;&mdash;' ) , '
							</a>
						</td><td>
							<a href="' , $_SERVER['SCRIPT_URL'] , '?instance=' , $instance_code , '&amp;student_id=' , $id , '">
							' , $student['info']['lastActive'] , '
							</a>
						</td><td>
							' , sprintf( '%f' , $student['info']['answered'] / $label_count ) , ' (' , $student['info']['answered'] , '/' , $label_count , ')
						</td></tr>';
				}
				echo '</table>';
			} else {
				echo '<p>No activity recorded.</p>';
			}
			?>
		</div>
		
		<?php if ( isset( $student_id ) && count( $students[$student_id]['data'] ) > 0 ) { ?>
			<div id="detail-report-<?php echo $student_id ?>">
				<div class="accordion">
				<?php
				foreach ( $module as $section ) {
					if ( $section['label_count'] == 0 ) { continue; }
					echo '
						<h3>Section: ' , $section['title'] , '</h3>
						<div>'
					;
					foreach ( $section['slides'] as $slide ) {
						$labels = $xpath->query( './/label' , $slide );
						if ( $labels->length == 0 ) { continue; }
						echo '
							<h4>' , $slide->getAttribute( 'data-slide-title' ) , '</h4>'
						;
						foreach ( $labels as $label ) {
							if ( $label->hasAttribute( 'for' ) && ( $label_target = $label->getAttribute( 'for' ) ) !== '' ) {
								echo '
									<p><i>' , $label->nodeValue , '</i></b>
									<blockquote><p>' , ( strlen( trim( $students[$student_id]['data'][$label_target]['usrInput'] ) ) > 0 ? trim( $students[$student_id]['data'][$label_target]['usrInput'] ) : '--' ) , '</p></blockquote>'
								;
							}
						}
					}
					echo '
						</div>'
					;
				}
				?>
				</div>
				</div>
		<?php } ?>
		
		<div id="summary-report">
			<div class="accordion">
			<?php
			foreach ( $module as $section ) {
				if ( $section['label_count'] == 0 ) { continue; }
				echo '
					<h3>Section: ' , $section['title'] , '</h3>
					<div>'
				;
				foreach ( $section['slides'] as $slide ) {
					$labels = $xpath->query( './/label' , $slide );
					if ( $labels->length == 0 ) { continue; }
					echo '
						<h4>' , $slide->getAttribute( 'data-slide-title' ) , '</h4>'
					;
					foreach ( $labels as $label ) {
						if ( $label->hasAttribute( 'for' ) && ( $label_target = $label->getAttribute( 'for' ) ) !== '' ) {
							echo '
								<div class="accordion2">
									<p class="question"><i>' , $label->nodeValue , '</i></p><ul>'
							;
							foreach ( $students as $id => $student ) {
								if ( strlen( trim( $student['data'][$label_target]['usrInput'] ) ) > 0 ) {
									echo '
										<li><span class="student-code"><a href="' , $_SERVER['SCRIPT_URL'] , '?instance=' , $instance_code , '&amp;student_id=' , $id , '#detail-report-' , $id , '">' , ( strlen( $student['info']['student_code'] ) > 0 ? $student['info']['student_code'] : '--' ) , '</a></span>
										<span class="expandable">' , trim( $student['data'][$label_target]['usrInput'] ) , '
										</li>'
									;
								}
							}
							echo '
									</ul>
								</div>'
							;
						}
					}
				}
				echo '
					</div>'
				;
			}
			?>
			</div>
		</div>
		
		
	</div>
	<script>
		$( function( ) {
			$( '.tabs' ).tabs( { } );
			$( '.accordion' ).accordion( {
				active      : false ,
				heightStyle : 'content' ,
				collapsible : true
			} );
			$( '.accordion2' ).accordion( {
				active      : false ,
				header      : 'p.question' ,
				heightStyle : 'content' ,
				collapsible : true
			} );
			
			$( '.ui-tabs-nav li' ).removeClass( 'ui-corner-top' ).addClass( 'ui-corner-bottom' );
			
			window.scroll(0,0);
		} );
	</script>
	

<?php } else { ?>


	<h2>Use the module in your classroom</h2>
	<p>To assign the module to students in your classroom and then generate, view, and print out a record of the student responses to the “Think About It” questions in the module, follow these simple steps:</p>
	<form method="post" action="<?php echo $_SERVER['SCRIPT_URL']; ?>">
	<style>li { margin-top: .35em; }</style>
	<ol>
		<li>Give the record a name and click on "Create":</label> <input name="instLabel" id="instLabel" value="" style="width: 35%" placeholder="e.g., 1st Period Earth Science"> <input type="submit" name="create" value="Create"></li>
		<li>Each record has a Teacher Code that you should give to your students.</li>
		<li>Ask students to go to <a href="http://weatherschool.aaas.org">WeatherSchool.aaas.org</a> and click on the <em>Start using the module</em> button at the bottom of the screen.</li>
		<li>Ask students to enter the Teacher Code in the pop-up box.</li>
		<li>If you want to link responses to individual students you can ask students to enter a student code. The teacher will determine the type of Student Code entered (school ID, first initial plus last name, etc). This should be something the student can remember.</li>
		<li>The student can then click on "Begin the module."</li>
		<li>To access, view, and print student responses, visit <a href="http://weatherschool.aaas.org">WeatherSchool.aaas.org</a>, log in, and then select the report you want from your list.</li>
	</ol>
	</form>
	
		
	<h3>Saved reports</h3>
	<div style="margin-left: 1.25em;">
	<table class="list">
		<tr>
			<th>Teacher Code</th>
			<th>Record Name</th>
			<th>Created</th>
		</tr>
		<?php
		$sql_stmt = sprintf(
			'SELECT * FROM instances WHERE user_id = %u' ,
			mysql_real_escape_string( $_SESSION['user_id'] )
		);
		$instances = mysql_query( $sql_stmt );
		while ( ( $instance = mysql_fetch_assoc( $instances ) ) !== FALSE ) {
			echo '
			<tr>
				<td align="center"><a href="' , $_SERVER['SCRIPT_URL'] , '?instance=' , __num2alpha( $instance['id'] , 4 ) , '" class="hinted">' , __num2alpha( $instance['id'] , 4 ) , '</a></td>
				<td><a href="' , $_SERVER['SCRIPT_URL'] , '?instance=' , __num2alpha( $instance['id'] , 4 ) , '">' , $instance['label'] , '</a></td>
				<td align="center">' , $instance['created'] , '</td>
			</tr>';
		}
		?>
	</table>
	</div>
	

<?php } ?>

<script type="text/javascript" src="<?php echo CLIMATE_DIR_WWW; ?>/includes/jquery/plugins/jquery.expander.js"></script>
<script type="text/javascript">
$( function ( ) {
	$( '.expandable' ).expander( {
		collapseEffect   : 'fadeOut',
		expandEffect     : 'fadeIn',
		expandPrefix     : ' ', // default is '... '
		expandText       : '[...]', // default is 'read more'
		slicePoint       : 200,  // default is 100
		userCollapseText : '[^]'  // default is 'read less'
	} );
} );
</script>
<script type="text/javascript">
//http://www.cssnewbie.com/cross-browser-support-for-html5-placeholder-text-in-forms/
jQuery(function() {
	jQuery.support.placeholder = false;
	test = document.createElement('input');
	if('placeholder' in test) jQuery.support.placeholder = true;
});
$(function() {
	if(!$.support.placeholder) { 
		var active = document.activeElement;
		$(':text').focus(function () {
			if ($(this).attr('placeholder') != '' && $(this).val() == $(this).attr('placeholder')) {
				$(this).val('').removeClass('hasPlaceholder');
			}
		}).blur(function () {
			if ($(this).attr('placeholder') != '' && ($(this).val() == '' || $(this).val() == $(this).attr('placeholder'))) {
				$(this).val($(this).attr('placeholder')).addClass('hasPlaceholder');
			}
		});
		$(':text').blur();
		$(active).focus();
		$('form').submit(function () {
			$(this).find('.hasPlaceholder').each(function() { $(this).val(''); });
		});
	}
});
</script>

<?php /*echo '<pre>' , print_r($students,true) , '</pre>';*/ ?>
