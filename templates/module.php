<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">

	<title>Weather School</title>
	<meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1">

	<link rel="stylesheet" type="text/css" href="<?php echo CLIMATE_DIR_WWW; ?>/includes/css/fonts/CartoGothicStd/CartoGothicStd.css" />
	<link rel="stylesheet" type="text/css" href="<?php echo CLIMATE_DIR_WWW; ?>/includes/css/fonts/ComingSoon/ComingSoon.css" />
	
	<link rel="stylesheet" type="text/css" href="<?php echo CLIMATE_DIR_WWW; ?>/includes/css/jquery-substring.css" />
	
<link rel="stylesheet" type="text/css" href="http://code.jquery.com/ui/1.11.2/themes/smoothness/jquery-ui.css" />
	<link rel="stylesheet" type="text/css" href="<?php echo CLIMATE_DIR_WWW; ?>/includes/jquery/plugins/jquery.plusslider/css/plusslider.css" />
	<link rel="stylesheet" type="text/css" href="<?php echo CLIMATE_DIR_WWW; ?>/includes/jquery/plugins/jquery.chosen/chosen.css" />
	<link rel="stylesheet" type="text/css" href="<?php echo CLIMATE_DIR_WWW; ?>/includes/jquery/plugins/jquery.plusslider/css/minimal.css" />
	<link rel="stylesheet" type="text/css" href="<?php echo CLIMATE_DIR_WWW; ?>/includes/jquery/plugins/jquery.mCustomScrollbar/jquery.mCustomScrollbar.css" />
	
	<link rel="stylesheet" type="text/css" href="<?php echo CLIMATE_DIR_WWW; ?>/includes/css/modules.css" />
	
	<?php
	$__local_css =  CLIMATE_DIR . DIRECTORY_SEPARATOR . $handler . DIRECTORY_SEPARATOR . $page . DIRECTORY_SEPARATOR . 'styles.css';
	if ( file_exists( $__local_css ) ) {
		echo '<link rel="stylesheet" type="text/css" href="' , CLIMATE_DIR_WWW , str_replace( CLIMATE_DIR , '' , $__local_css ) , '" />';
	}
	?>
	
	<script type="text/javascript" src="<?php echo CLIMATE_DIR_WWW; ?>/includes/js/prefixfree.min.js"></script>
	<script type="text/javascript" src="<?php echo CLIMATE_DIR_WWW; ?>/includes/js/moment.js"></script>
	
	<script type="text/javascript" src="http://code.jquery.com/jquery-1.10.2.min.js"></script>
	<script type="text/javascript" src="http://code.jquery.com/jquery-migrate-1.2.1.min.js"></script>
	<script type="text/javascript" src="http://code.jquery.com/ui/1.11.2/jquery-ui.js"></script>
	<script type="text/javascript" src="http://www.youtube.com/iframe_api"></script>
	<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/swfobject/2.2/swfobject.js"></script>


	<script type="text/javascript" src="<?php echo CLIMATE_DIR_WWW; ?>/includes/jquery/plugins/jquery.regex-selector.js"></script>
	<script type="text/javascript" src="<?php echo CLIMATE_DIR_WWW; ?>/includes/jquery/plugins/jquery.purl.js"></script>
	<script type='text/javascript' src="<?php echo CLIMATE_DIR_WWW; ?>/includes/jquery/plugins/jquery.mousewheel.min.js"></script>
	<script type='text/javascript' src="<?php echo CLIMATE_DIR_WWW; ?>/includes/jquery/plugins/jquery.plusslider/js/jquery.plusslider.js"></script>
	<script type='text/javascript' src="<?php echo CLIMATE_DIR_WWW; ?>/includes/jquery/plugins/jquery.mCustomScrollbar/jquery.mCustomScrollbar.min.js"></script>
	<script type='text/javascript' src="<?php echo CLIMATE_DIR_WWW; ?>/includes/jquery/plugins/jquery.chosen/chosen.jquery.js"></script>
	<script type="text/javascript" src="<?php echo CLIMATE_DIR_WWW; ?>/includes/jquery/plugins/jquery.cookie.js"></script>
	<script type="text/javascript" src="<?php echo CLIMATE_DIR_WWW; ?>/includes/jquery/plugins/jquery-ui.multidatespicker.js"></script>
<script type="text/javascript" src="<?php echo CLIMATE_DIR_WWW; ?>/includes/jquery/plugins/jquery.bind-first-0.2.3.js"></script>
	<script type="text/javascript" src="<?php echo CLIMATE_DIR_WWW; ?>/includes/climateViz/js/controller.js"></script>
	<script type='text/javascript' src='<?php echo CLIMATE_DIR_WWW; ?>/includes/js/modules.js'></script>
	
	<?php
	$__local_js =  CLIMATE_DIR . DIRECTORY_SEPARATOR . $handler . DIRECTORY_SEPARATOR . $page . DIRECTORY_SEPARATOR . '/scripts.js';
	if ( file_exists( $__local_js ) ) {
		echo '<script type="text/javascript" src="' , CLIMATE_DIR_WWW , str_replace( CLIMATE_DIR , '' , $__local_js ) , '" />';
	}
	?>
	
	<script>
		var _gaq = _gaq || [];
		_gaq.push(['_setAccount', 'UA-411599-5']);
		_gaq.push(['_trackPageview']);
		
		(function() {
			var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
			ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
			var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
		})();
		
		$('document').ready(function() {
			$('a:regex(href, \.(doc|docx*|xls|xlsx*|ppt|pptx*|exe|zip|pdf)$)').click(function () {
				_gaq.push(['_trackEvent', 'download', 'click', (this.pathname.substring(0,1)=='/'?this.pathname:'/'+this.pathname)]);
			});
			$('a[href^="mailto:"]').click(function () {
				_gaq.push(['_trackEvent', 'email', 'click', this.href.replace(/mailto:/, "")]);
			});
			$('a[href^="http\\:\\/\\/"]').click(function () {
				if (location.hostname != this.href.hostname) {
					_gaq.push(['_trackEvent', 'outbound', 'click', this.href.replace(/http:\/\//, "")]);
				}
			});
		});
	</script>
	
	<?php if ( isset( $__header  ) ) { echo $__header; } ?>
	
</head>
<body>
	<div id="slider-positioner">
	<script>	
// Include the UserVoice JavaScript SDK (only needed once on a page)
UserVoice=window.UserVoice||[];(function(){var uv=document.createElement('script');uv.type='text/javascript';uv.async=true;uv.src='//widget.uservoice.com/IWB0Ty3WEiCebGnplEO0cg.js';var s=document.getElementsByTagName('script')[0];s.parentNode.insertBefore(uv,s)})();

//
// UserVoice Javascript SDK developer documentation:
// https://www.uservoice.com/o/javascript-sdk
//

// Set colors
UserVoice.push(['set', {
  accent_color: '#448dd6',
  trigger_color: 'white',
  trigger_background_color: 'rgba(46, 49, 51, 0.6)'
}]);

// Identify the user and pass traits
// To enable, replace sample data with actual user traits and uncomment the line
UserVoice.push(['identify', {
  //email:      'john.doe@example.com', // User’s email address
  //name:       'John Doe', // User’s real name
  //created_at: 1364406966, // Unix timestamp for the date the user signed up
  //id:         123, // Optional: Unique id of the user (if set, this should not change)
  //type:       'Owner', // Optional: segment your users by type
  //account: {
  //  id:           123, // Optional: associate multiple users with a single account
  //  name:         'Acme, Co.', // Account name
  //  created_at:   1364406966, // Unix timestamp for the date the account was created
  //  monthly_rate: 9.99, // Decimal; monthly rate of the account
  //  ltv:          1495.00, // Decimal; lifetime value of the account
  //  plan:         'Enhanced' // Plan name for the account
  //}
}]);

// Add default trigger to the bottom-right corner of the window:
//UserVoice.push(['addTrigger', { mode: 'contact', trigger_position: 'top-right' }]);

// Or, use your own custom trigger:
UserVoice.push(['addTrigger', '#feedback', { mode: 'contact', trigger_position: 'top-right' }]);

// Autoprompt for Satisfaction and SmartVote (only displayed under certain conditions)
UserVoice.push(['autoprompt', {}]);
</script>
		<div id="slider-navigation">
			<div id="click-cover" class="cover"></div>	
				<div id="slider-menu">
				<div class="access-control">menu</div>
				<!--<ul>
				</ul>-->
				<div id="accordion">
			</div>
			<?php //<div id="login-nav">Log in as a: Student | Non-Student</div>
			//<div class="you-are-here"><p><span class="screen-id"></span> (#<span class="screen-num"></span> of <span class="screen-total"></span>)</p></div> ?>
			</div>
			<div class="prev">&lt;</div>
			<div class="next">&gt;</div>
		</div>
		<div id="slider">
			
			<?php if ( isset( $__content  ) ) { echo $__content; } ?>
			
		</div>
	</div>
		<div id="feedback">help/feedback?</div>
		<div id="help-tip">Widgets not appearing? Try refreshing (Ctrl/&#8984;+R).</div>
			<script>
							$('#feedback').hover( function() { setTimeout( function() {$('#help-tip').show("slide", { direction: "left" }, 1000); },200); }, function() { setTimeout( function() {$('#help-tip').hide("slide", { direction: "left" }, 4000); },0); } );
		</script>
		<div id="homebutton" onclick="window.open('','weatherhome').focus()"></div>
	<div class="you-are-here"><p><span class="screen-id"></span> (#<span class="screen-num"></span> of <span class="screen-total"></span>)</p></div>
<?php /*
<div id="login" style="display: none;" title="">
		<p>Are you a student using the module in your classroom? Fill in the following information provided by your teacher and click on ENTER to start the module:</p>
		<form id="student-login">
			<p>
				<label for="user">Student Code:</label>
				<input name="student" type="text" id="student" size="24" value="<?php echo htmlentities( $student ); ?>" class="<?php echo ( isset( $errors['login']['student'] ) ? 'error' : '' ); ?>" title="<?php echo ( isset( $errors['login']['student'] ) ? trim( $errors['login']['student'] ) : '' ); ?>" />
			</p>
			<p>
				<label for="teacher">Teacher Code:</label>
				<input name="teacher" type="text" id="text" size="24" class="<?php echo ( isset( $errors['login']['teacher'] ) ? 'error' : '' ); ?>" title="<?php echo ( isset( $errors['login']['teacher'] ) ? trim( $errors['login']['teacher'] ) : '' ); ?>" />
			</p>
			<p>
				<input type="submit" name="login-students" value="Start Module" />
			</p>
		</form>
		<hr>
		<div style="text-align: center;"><a href="#introduction" id="skip-action" class="button">skip this step</a></div>
		</div>
 */?>
</body>
</html>
