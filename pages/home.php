<head>
<script type="text/javascript" src="<?php echo CLIMATE_DIR_WWW; ?>/includes/jquery/plugins/owl-carousel/owl.carousel.js"></script>
<link rel="stylesheet" type="text/css" href="<?php echo CLIMATE_DIR_WWW; ?>/includes/jquery/plugins/owl-carousel/owl.carousel.css"/>
<link rel="stylesheet" type="text/css" href="<?php echo CLIMATE_DIR_WWW; ?>/includes/jquery/plugins/owl-carousel/owl.theme.css"/>
<style>
#slides-demo .item{
	margin: 3px;
}
#slides-demo .item img{
  display: block;
  width: 100%;
}
#earth-button {
	cursor:pointer;
	color:red;
	
	height: 175px;
	width:175px;
	background: url(/media/img/earthbutton.jpg) no-repeat;	
	background-size:cover;
	font-size:215%;
  line-height: 175px; 
	box-sizing: border-box;
	text-align: center;
	float: right; 
}
</style>
<script> 
$(document).ready(function() {
 
  $("#slides-demo").owlCarousel({
 
			loop: true,
			items : 5,
      //itemsDesktop : [1199,5],
      //itemsDesktopSmall : [979,5]
 
  });
 
});
</script>
</head>

<h2 style="text-align:center; font-size:175%;">Welcome to WeatherSchool @ AAAS.org!</h2>
<p style="margin:auto;font-size:175%">
<br>
<br>
<br>
<a href="modules/weather/" id="earth-button" onclick="window.open(this.href,'_blank','height=740,width=935,menubar=no,location=no,resizable=yes,scrollbars=no,status=no,toolbar=no');return false;">START</a>
WeatherSchool @ AAAS was developed by researchers at the American Association for the Advancement of Science (AAAS) to help you explore how different factors—time of the year, location, or elevation—work together to produce the day-to-day weather you experience in your local community as well as the overall climate for the region of the world where you live. WeatherSchool can be used by anyone with an interest in weather and climate.
<br><br></p>
<?php	/*
<!--<p>These interactive learning modules let you access data collected mostly by the <a href="http://www.noaa.gov">National Oceanic and Atmospheric Administration</a> (NOAA) and the <a href="http://www.nasa.gov">National Aeronautics and Space Administration</a> (NASA) from weather stations, satellites, and other observation sites on land and sea around the world. These data give you a picture of how different factors—time of the year, location, or elevation, for example—work together to produce the day-to-day weather you experience in your local community  as well as the overall climate for the region of the world where you live (for example, the New England area of the U.S. or the southernmost part of India).</p>
<p>To help you explore these weather-related factors, WeatherSchool @ AAAS.org  includes the following features:</p>
<ul>
	<li>Weather-related data sets for thousands of locations around the world</li>
	<li>Interactives for selecting and viewing weather-related data for a single or multiple locations over different periods of time</li>
	<li>Graphing tools for analyzing relationships between weather variables (e.g., hours of daylight and air temperature) for one or more locations and over different periods of time</li>
	<li>Guided activites to exemplify how to use the interactive maps and graphing tools to explore targeted concepts.
	<li>“Quiz Yourself” questions at the end of each module to review module concepts</li>
	<li>Dynamic models of the Earth-Sun system to help explain what happens as the Earth spins on its axis and rotates around the Sun over the course of the year</li>-->

	<li>Features for saving, viewing, and printing out responses to questions in the module—for a single user or a group of users in a classroom setting (requires account set-up)</li>
	<li>Easy-to-use tutorials to update your knowledge of map reading, longitude and latitude, and basic graphing of linear relationships. </li>

</ul> 
<p>Designed primarily for middle and high school students and their teachers, WeatherSchool @ AAAS.org can also be used by anyone with an interest in learning more about weather and climate.</p>
	*/ ?>

		

<table style="margin: 3em auto; width: 65%;"><tr valign="top" align="center">
	<td width="50%">


</td>
	<!--<td width="50%">
		<?php if ( $login ) { ?>
			<p><a href="reports" class="button">Access your reports</a></p>
		<?php } else { ?>
			<p><a href="register" class="button">Register now</a></p>
			<p class="note">required for classroom use and<br>for saving and viewing your work</p>
		<?php } ?>
	</td>-->
</tr></table>
<div id="slides-demo">
	
	<!--<div class="item"><img height="150px" width="195px" src="<?php echo CLIMATE_DIR_WWW; ?>/includes/media/screenshots/A.1.2.jpg"></div>-->
<div class="item"><img height="150px" width="195px" src="<?php echo CLIMATE_DIR_WWW; ?>/modules/weather/assets/introduction/Kathmandu-Kathmandu_ValleyNeedAttribution.jpg"></div>
	<div class="item"><img height="150px" width="195px" src="<?php echo CLIMATE_DIR_WWW; ?>/includes/media/screenshots/B.1.1.jpg"></div>
<div class="item"><img height="150px" width="195px" src="<?php echo CLIMATE_DIR_WWW; ?>/includes/media/screenshots/C.1.3.jpg"></div>
<div class="item"><img height="150px" width="195px" src="<?php echo CLIMATE_DIR_WWW; ?>/modules/weather/assets/introduction/MoscowColdFront.jpg"></div>	
	<div class="item"><img height="150px" width="195px" src="<?php echo CLIMATE_DIR_WWW; ?>/includes/media/screenshots/D.1.8.jpg"></div>
	<div class="item"><img height="150px" width="195px" src="<?php echo CLIMATE_DIR_WWW; ?>/includes/media/screenshots/E.1.2.jpg"></div>
<div class="item"><img height="150px" width="195px" src="<?php echo CLIMATE_DIR_WWW; ?>/modules/weather/assets/introduction/Rj_north_york_moors.jpg"></div>	
	
<!--<div class="item"><img height="150px" width="195px" src="<?php echo CLIMATE_DIR_WWW; ?>/includes/media/screenshots/F.1.2.jpg"></div>-->
	<div class="item"><img height="150px" width="195px" src="<?php echo CLIMATE_DIR_WWW; ?>/includes/media/screenshots/G.1.4.jpg"></div>
<div class="item"><img height="150px" width="195px" src="<?php echo CLIMATE_DIR_WWW; ?>/modules/weather/assets/introduction/tromsoneedattribution.jpg"></div>	
	<div class="item"><img height="150px" width="195px" src="<?php echo CLIMATE_DIR_WWW; ?>/includes/media/screenshots/TOOLS.1.jpg"></div>
	<div class="item"><img height="150px" width="195px" src="<?php echo CLIMATE_DIR_WWW; ?>/includes/media/screenshots/TOOLS.3.2.jpg"></div>
<div class="item"><img height="150px" width="195px" src="<?php echo CLIMATE_DIR_WWW; ?>/modules/weather/assets/introduction/Sunset_TreeNeedAttribution.jpg"></div>	
	<div class="item"><img height="150px" width="195px" src="<?php echo CLIMATE_DIR_WWW; ?>/includes/media/screenshots/TOOLS.4.3.jpg"></div>
	<!--<div class="item"><img height="150px"  width="195px" src="<?php echo CLIMATE_DIR_WWW; ?>/includes/media/screenshots/TOOLS.5.1.jpg"></div>-->

</div>	
<hr>

<div style="font-size: 88%; margin: 4em;">
	<p>Development of this website is supported by grant # NA09SEC4690008 from the U.S. Department of Commerce, National Oceanic and Atmospheric Administration and by grant # NNX09AL72G from the National Aeronautics and Space Administration.</p>
	<p align="center">
		<a href="http://www.nasa.gov"><img src="media/img/nasa-226x170.jpg" alt="NASA logo" width="82" height="60" border="0" align="absmiddle" style="margin: 0em 35px;" /></a>
		<a href="http://www.noaa.gov"><img src="media/img/noaa-220x220.jpg" alt="NOAA logo" width="68" height="68" border="0" align="absmiddle" style="margin: 0em 35px;" /></a>
	</p>
</div>
