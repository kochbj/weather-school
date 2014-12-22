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
	background: url(/media/img/earthbuttonblue.jpg) no-repeat;	
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
<div style='background-color: #e0f0ff; box-shadow: 1px 1px 2px #A7CBE9; border: 1px solid #daeaf0; border-radius:20px; padding: 10px 20px;'>
<h2 style="text-align:center; font-size:175%;">Welcome to WeatherSchool @ AAAS.org!</h2>
<p style="margin: 2em auto;font-size:175%">
<a href="modules/weather/" id="earth-button" onclick="window.open(this.href,'_blank','height=740,width=935,menubar=no,location=no,resizable=yes,scrollbars=no,status=no,toolbar=no');return false;"></a>
WeatherSchool @ AAAS was developed by researchers at the American Association for the Advancement of Science (AAAS) to help you explore how different factors—time of the year, location, or elevation—work together to produce the day-to-day weather you experience in your local community as well as the overall climate for the region of the world where you live. WeatherSchool can be used by anyone with an interest in weather and climate. <b>Click on the globe to begin.<b>
</p>
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
</div>
<hr>

<div style="font-size: 88%; margin: 4em;">
	<p>Development of this website is supported by grant # NA09SEC4690008 from the U.S. Department of Commerce, National Oceanic and Atmospheric Administration and by grant # NNX09AL72G from the National Aeronautics and Space Administration.</p>
	<p align="center">
		<a href="http://www.nasa.gov"><img src="media/img/nasa-226x170.jpg" alt="NASA logo" width="82" height="60" border="0" align="absmiddle" style="margin: 0em 35px;" /></a>
		<a href="http://www.noaa.gov"><img src="media/img/noaa-220x220.jpg" alt="NOAA logo" width="68" height="68" border="0" align="absmiddle" style="margin: 0em 35px;" /></a>
	</p>
</div>
