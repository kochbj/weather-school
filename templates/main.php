<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
		
	<title>Climate Resources ~ Project 2061 ~ AAAS</title>

	<!--<link rel="stylesheet" type="text/css" href="<?php echo CLIMATE_DIR_WWW; ?>/includes/css/fonts/CartoGothicStd/CartoGothicStd.css" />-->
	<link rel="stylesheet" type="text/css" href="hhtp://fonts.googleapis.com/css?family=Open+Sans"/>
	
	<link rel="stylesheet" type="text/css" href="<?php echo CLIMATE_DIR_WWW; ?>/includes/css/fonts/ComingSoon/ComingSoon.css" />
	
	<!--<link rel="stylesheet" type="text/css" href="http://code.jquery.com/ui/1.10.3/themes/smoothness/jquery-ui.css" />-->
	<link rel="stylesheet" type="text/css" href="<?php echo CLIMATE_DIR_WWW; ?>/includes/css/jquery-ui.css" />
	
	<link rel="stylesheet" type="text/css" href="<?php echo CLIMATE_DIR_WWW; ?>/includes/css/extras.css" />
	<link rel="stylesheet" type="text/css" href="<?php echo CLIMATE_DIR_WWW; ?>/includes/css/default.css" />
	<link rel="stylesheet" type="text/css" href="<?php echo CLIMATE_DIR_WWW; ?>/includes/css/main.css" />
	
	<?php
	$__local_css =  CLIMATE_DIR . DIRECTORY_SEPARATOR . $handler . DIRECTORY_SEPARATOR . $page . '.css';
	if ( file_exists( $__local_css ) ) {
		echo '<link rel="stylesheet" type="text/css" href="' , CLIMATE_DIR_WWW , '/' , str_replace( CLIMATE_DIR , '' , $__local_css ) , '" />';
	}
	?>
	
	<script type="text/javascript" src="<?php echo CLIMATE_DIR_WWW; ?>/includes/js/prefixfree.min.js"></script>
	
	<script type="text/javascript" src="http://code.jquery.com/jquery-1.10.2.min.js"></script>
	<!--<script type="text/javascript" src="http://code.jquery.com/jquery-migrate-1.2.1.min.js"></script>-->
	<script type="text/javascript" src="http://code.jquery.com/ui/1.10.3/jquery-ui.js"></script>
	
	<script type="text/javascript" src="<?php echo CLIMATE_DIR_WWW; ?>/includes/jquery/plugins/jquery.regex-selector.js"></script>
	<script type="text/javascript" src="<?php echo CLIMATE_DIR_WWW; ?>/includes/jquery/plugins/jquery.cookie.js"></script>
	
	<script>
		(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
		(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
		m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
		})(window,document,'script','//www.google-analytics.com/analytics.js','ga');

		ga('create', 'UA-4074773-4', 'auto');
		ga('send', 'pageview');
	</script>



	<?php
	$__local_js =  dirname( $page ) . DIRECTORY_SEPARATOR . basename( $page , '.php' ) . '.js';
	if ( file_exists( $__local_js ) ) {
		echo '<script type="text/javascript" src="' , CLIMATE_DIR_WWW , '/' , str_replace( CLIMATE_DIR , '' , $__local_js ) , '"></script>';
	}
	?>
	
	<?php if ( isset( $__header  ) ) { echo $__header; } ?>
	
</head>

<body>
	<div class="site-header" onclick="location.href='<?php echo CLIMATE_DIR_WWW; ?>/'">
		<div class="logo"><a href="http://www.project2061.org/" onclick="ga('send', 'event', 'outbound', 'click', 'P2061 Home Logo');"><img src="http://assessment.aaas.org/img/logo-p2061.png" alt="AAAS Project 2061" /></a></div>
		<h1 style="font-size: 240%;">WeatherSchool @ AAAS <sup>beta</sup></h1>
	</div>
	<div class="site-nav-panel">
		<div class="navigation">
			<ul>
				<li class="<?php echo ( $page == 'home' ? 'selected' : '' ); ?>"><p><a href="<?php echo CLIMATE_DIR_WWW; ?>/">Home</a></p></li>
				<!--<li class="<?php echo ( $page == 'module' ? 'selected' : '' ); ?>"><p><a href="<?php echo CLIMATE_DIR_WWW; ?>/module">Start the Module</a></p></li>
				<li class="<?php echo ( $page == 'reports' ? 'selected' : '' ); ?>"><p><a href="<?php echo CLIMATE_DIR_WWW; ?>/reports">Create &amp; View Reports</a></p></li>-->
				<li class="<?php echo ( $page == 'about' ? 'selected' : '' ); ?>"><p><a href="<?php echo CLIMATE_DIR_WWW; ?>/about">About</a></p></li>
				<li class="<?php echo ( $page == 'standards' ? 'selected' : '' ); ?>"><p><a href="<?php echo CLIMATE_DIR_WWW; ?>/standards">Standards</a></p></li>
				<li class="<?php echo ( $page == 'assessments' ? 'selected' : '' ); ?>"><p><a href="http://assessment.aaas.org/topics" target="_blank" onclick="ga('send', 'pageview', '/assessments');">Assessments</a></p></li>

			</ul>
		<!--</div>
		<div id="userControls">
			<?php if ( isset( $_SESSION['user'] ) ) { ?>
			Logged in as <?php echo $_SESSION['user']; ?> (<a href="<?php echo CLIMATE_DIR_WWW; ?>/logout">log out</a>)
			<?php } else { ?>
			<a href="<?php echo CLIMATE_DIR_WWW; ?>/login">Login</a> or <a href="<?php echo CLIMATE_DIR_WWW; ?>/register">Register</a>
			<?php } ?>
		</div>-->
	</div>
	<div id="body">
		<div id="content">
			
			<?php if ( isset( $__content  ) ) { echo $__content; } ?>
			
		</div>
	</div>
	<div id="footer">
		<p><a href="mailto:gdeboer@aaas.org?Subject=Question%20about%20WeatherSchool@AAAS"target="_top" onclick="ga('send', 'event', 'email', 'open', 'contactus');">Questions? Contact Us</a>
		<br>
		<a href="<?php echo CLIMATE_DIR_WWW; ?>/policies">Read our privacy policy and terms of use</a>
		<br>
		Copyright &copy; <?php echo date( 'Y' ); ?>. American Association for the Advancement of Science. All Rights Reserved
		</p>
	</div>
	
</body>
</html>
