///////////////////////////
// MAIN COMPUTE FUNCTION //
///////////////////////////

function compute (p) {

	// constants
	
			var degrees_to_radians  =    3.1416 /  180.0000;
			var radians_to_degrees  =  180.0000 /    3.1416;
				 var feet_to_meters  =    1.0000 /    3.2800;
	var degree_minutes_to_decimal =    1.0000 /   60.0000;
	var degree_seconds_to_decimal =    1.0000 / 3600.0000;
	
	// variable instantiation
	var deg_marker, min_marker, sec_marker;
	var longitude_deg, longitude_min, longitude_sec;
	var time_entered, latitude_entered, longitude_entered, surface_tilt_entered, surface_azimuth_entered;
	var clock_time_input_mode, solar_time_input_mode;
	var doable_altitude_angle, doable_azimuth_angle, doable_hour_angle, doable_incidence_angle, doable_incidence_angle, doable_solar_time, doable_sun_rise_set;
	var time_hours, time_minutes, clock_time, universal_time;
	var solar_insolation, doable_solar_insolation;
	
	p.format_as_string = false;

	// convert longitude, latitude, and surface azimuth to decimal from degree-minute-second if necessary

		// longitude
		
		
	if (typeof(p.input_longitude) == "string" && p.input_longitude.indexOf ("d") != -1) {
	
		deg_marker = p.input_longitude.indexOf ("d");
		min_marker = p.input_longitude.indexOf ("m");
		sec_marker = p.input_longitude.indexOf ("s");

		longitude_deg = p.input_longitude.substr (0, deg_marker)                         - 0;
		longitude_min = p.input_longitude.substr (deg_marker+1, min_marker-deg_marker-1) - 0;
		longitude_sec = p.input_longitude.substr (min_marker+1, sec_marker-min_marker-1) - 0;
		
		p.input_longitude = longitude_deg + (longitude_min * degree_minutes_to_decimal) + 
							  (longitude_sec * degree_seconds_to_decimal);
	}

	else p.input_longitude -= 0;
	
		// latitude
		
	if (typeof(p.input_latitude) == "string" && p.input_latitude.indexOf ("d") != -1) {
	
		deg_marker = p.input_latitude.indexOf ("d");
		min_marker = p.input_latitude.indexOf ("m");
		sec_marker = p.input_latitude.indexOf ("s");

		latitude_deg = p.input_latitude.substr (0, deg_marker)                         - 0;
		latitude_min = p.input_latitude.substr (deg_marker+1, min_marker-deg_marker-1) - 0;
		latitude_sec = p.input_latitude.substr (min_marker+1, sec_marker-min_marker-1) - 0;
		
		p.input_latitude = latitude_deg + (latitude_min * degree_minutes_to_decimal) + 
							 (latitude_sec * degree_seconds_to_decimal);
	}
	
	else p.input_latitude -= 0;
		
		// surface azimuth
		
	if (typeof(p.input_surface_azimuth) == "string" && p.input_surface_azimuth.indexOf ("d") != -1) {

		deg_marker = p.input_surface_azimuth.indexOf ("d");
		min_marker = p.input_surface_azimuth.indexOf ("m");
		sec_marker = p.input_surface_azimuth.indexOf ("s");

		surface_azimuth_deg = p.input_surface_azimuth.substr (0, deg_marker)                         - 0;
		surface_azimuth_min = p.input_surface_azimuth.substr (deg_marker+1, min_marker-deg_marker-1) - 0;
		surface_azimuth_sec = p.input_surface_azimuth.substr (min_marker+1, sec_marker-min_marker-1) - 0;
		
		p.input_surface_azimuth = surface_azimuth_deg + (surface_azimuth_min * degree_minutes_to_decimal) + 
									  (surface_azimuth_sec * degree_seconds_to_decimal);
	}

	// else p.input_surface_azimuth -= 0;
	
	// check which input fields were filled in by user
	
	time_entered            = (String(p.input_time).length            > 0);
	latitude_entered        = (String(p.input_latitude).length        > 0);
	longitude_entered       = (String(p.input_longitude).length       > 0);
	surface_tilt_entered    = (String(p.input_surface_tilt).length    > 0);
	surface_azimuth_entered = (String(p.input_surface_azimuth).length > 0);


	// convert input strings to numbers
	
	p.input_elevation = p.input_elevation - 0;
	
	// set sign of latitude, longitude, and surface azimuth
	
	if (       latitude_entered &&       p.input_north_south == "South")        p.input_latitude *= -1;	
	if (      longitude_entered &&         p.input_east_west ==  "East")       p.input_longitude *= -1;

	// determine time formats

	clock_time_input_mode = (p.input_time_basis == "Clock time");
	solar_time_input_mode = (p.input_time_basis == "Solar time");

	// determine what's do-able
	
	doable_solar_time       = ((longitude_entered || solar_time_input_mode) && time_entered)           ;
	doable_hour_angle       = (longitude_entered && time_entered)                                      ;
	doable_altitude_angle   = (longitude_entered && time_entered && latitude_entered)                  ;
	doable_azimuth_angle    = (longitude_entered && time_entered && latitude_entered)                  ;
	doable_sun_rise_set     = (longitude_entered && latitude_entered)                                  ;
	doable_incidence_angle  = (doable_azimuth_angle && surface_tilt_entered && surface_azimuth_entered);
	doable_solar_insolation = (longitude_entered && latitude_entered)                                  ;

	//////////////////
	// CALCULATIONS //
	//////////////////
			
	// --------------------------------------- //
	// SUN ANGLE PROCEDURE STEP 1:  CLOCK TIME //
	// --------------------------------------- //
	
	if (doable_solar_time) {
		
		// ...remove semicolon from time string if necessary
		
		p.input_time = RemoveSemicolon (p.input_time);
	
		// ...parse time input string and get hours and minutes
			
		if (String(p.input_time).length == 4) {                          // like "1234"
		
			time_hours   = p.input_time.substring (0, 2) - 0;
			time_minutes = p.input_time.substring (2, 4) - 0;
		}

		else {                                                // like "123"
		
			time_hours   = p.input_time.substring (0, 1) - 0;
			time_minutes = p.input_time.substring (1, 3) - 0;
		}
		
		// ...adjust for AM/PM designation
		
		if ((p.input_am_pm == "AM") && (time_hours == 12)) time_hours = 0;
		
		if  (p.input_am_pm == "PM") { if (time_hours != 12) time_hours += 12; }
	
		// ...calculate clock_time
		
		clock_time = time_hours + (time_minutes / 60);

		// ...calculate daylight savings time adjustment (hours ahead of standard time)
		
		if (p.input_daylight_savings == "Yes") p.input_daylight_savings = 1;
		
		else p.input_daylight_savings = 0;
			
	// ------------------------------------------- //
	// SUN ANGLE PROCEDURE STEP 2:  UNIVERSAL TIME //
	// ------------------------------------------- //
			
		universal_time = clock_time - p.input_time_zone - p.input_daylight_savings;
	}

	// if no time entered, perform calculations for 0000 hours UT
	
	else universal_time = 0;
	
	// ----------------------------------------------- //
	// SUN ANGLE PROCEDURE STEP 3:  SUN-EARTH GEOMETRY //
	// ----------------------------------------------- //
	
	month_num = MonthStringToMonthNum (p.input_month) - 0;
	
	if (month_num > 2) {

		year_corrected  = p.input_year   ;
		month_corrected = month_num - 3;
	}

	else {

		year_corrected  = p.input_year - 1;
		month_corrected = month_num  + 9;
	}
	
	epoch_day_count = ((universal_time / 24) + p.input_date + Math.floor (30.6 * month_corrected + 0.5) + 
							Math.floor (365.25 * (year_corrected  - 1976)) - 8707.5) / 36525;
	

	mean_anomaly = Mod360 (357.528 + 35999.05 * epoch_day_count);

	correction_to_center = (1.915 * Math.sin (mean_anomaly * degrees_to_radians)) + 
								  (0.020 * Math.sin (2.0 * mean_anomaly * degrees_to_radians));
	
	mean_longitude = Mod360 (280.460 + (36000.770 * epoch_day_count) + correction_to_center);
	
	right_ascension = mean_longitude - 2.466 * Math.sin (2.0 * mean_longitude * degrees_to_radians) + 
							0.053 *  Math.sin (4.0 * mean_longitude * degrees_to_radians);
	
	obliquity_of_ecliptic = 23.4393 - (0.013 * epoch_day_count);
	
	// ------------------------------------------------- //
	// SUN ANGLE PROCEDURE STEP 4:  GREENWICH HOUR ANGLE //
	// ------------------------------------------------- //

	greenwich_hour_angle = Mod360 ((15 * universal_time) - 180 - correction_to_center + mean_longitude - right_ascension);

	// ---------------------------------------- //
	// SUN ANGLE PROCEDURE STEP 5:  DECLINATION //
	// ---------------------------------------- //

	declination = Math.atan (Math.tan (obliquity_of_ecliptic * degrees_to_radians) * 
									 Math.sin (right_ascension * degrees_to_radians)) * radians_to_degrees;

	p.output_declination = ( p.format_as_string ? FormatFloatString (declination) : declination );

	// --------------------------------------------- //
	// SUN ANGLE PROCEDURE STEP 6:  EQUATION OF TIME //
	// --------------------------------------------- //

	equation_of_time = (mean_longitude - correction_to_center - right_ascension) / 15;

	p.output_eot = ( p.format_as_string ? FormatFloatString (equation_of_time) : equation_of_time );

	// --------------------------------------- //
	// SUN ANGLE PROCEDURE STEP 7:  HOUR ANGLE //
	// --------------------------------------- //

	if (doable_hour_angle) {
	
		if (p.input_time_basis == "Clock time") hour_angle = ModPlusMinus180 (greenwich_hour_angle - p.input_longitude);
		
		else hour_angle = 15 * (clock_time - 12);

		p.output_hour_angle = ( p.format_as_string ? FormatFloatString (hour_angle) : hour_angle );
	}
	
	else p.output_hour_angle = "";

	// ------------------------------------------- //
	// SUN ANGLE PROCEDURE STEP 8:  ALTITUDE ANGLE //
	// ------------------------------------------- //

	if (doable_altitude_angle) {

		altitude_angle = 
				radians_to_degrees * (Math.asin ((Math.sin (p.input_latitude * degrees_to_radians) * 
				Math.sin (declination * degrees_to_radians)) - (Math.cos (p.input_latitude * degrees_to_radians) * 
				Math.cos (declination * degrees_to_radians) * Math.cos ((hour_angle + 180) * degrees_to_radians))));

		p.output_altitude = ( p.format_as_string ? FormatFloatString (altitude_angle) : altitude_angle );
	}
	
	else p.output_altitude = "";
	
	// ------------------------------------------ //
	// SUN ANGLE PROCEDURE STEP 9:  AZIMUTH ANGLE //
	// ------------------------------------------ //

	if (doable_altitude_angle) {
	
		azimuth_angle_north_zero =
				radians_to_degrees * (Math.acos (((Math.cos (declination * degrees_to_radians) * 
				(Math.cos (p.input_latitude * degrees_to_radians) * Math.tan (declination * degrees_to_radians) + 
				Math.sin (p.input_latitude * degrees_to_radians) * Math.cos ((hour_angle + 180) * degrees_to_radians))) / 
				Math.cos (altitude_angle * degrees_to_radians))));

		if (p.input_zero_azimuth == "North") zero_azimuth_correction = 0;
		
		else zero_azimuth_correction = 180;

		if ((hour_angle > 0) && (hour_angle < 180)) azimuth_angle = ModPlusMinus180 (360 - azimuth_angle_north_zero - zero_azimuth_correction);
		
		else azimuth_angle = ModPlusMinus180 (azimuth_angle_north_zero - zero_azimuth_correction);
		 
		p.output_azimuth = ( p.format_as_string ? FormatFloatString (azimuth_angle) : azimuth_angle );
	}
	
	else p.output_azimuth = "";
	
	// --------------------------------------------------------- //
	// SUN ANGLE PROCEDURE STEP 10:  SOLAR/CLOCK TIME DIFFERENCE //
	// --------------------------------------------------------- //
	
	if (doable_solar_time) solar_clock_difference = 
			-1 * p.input_daylight_savings + equation_of_time - (p.input_time_zone  +  p.input_longitude / 15);
	
	else solar_clock_difference = 0;
	
	// ---------------------------------------------- //
	// SUN ANGLE PROCEDURE STEP 11:  LOCAL SOLAR TIME //
	// ---------------------------------------------- //
	
	if (doable_solar_time) {
	
		// set solar time
		
		if (clock_time_input_mode) solar_time = clock_time + solar_clock_difference;

		else solar_time = clock_time;

		// check to see if it's the next or previous day...we use "+" as a suffix to the time on the output form
		// to indicate the next day, and "-" to indicate the previous day
		
		day_indicator = "";

			// next day
			
		if (solar_time >= 24) {
		
			solar_time -= 24;
			
			day_indicator = "+";
		}

			// previous day
			
		if (solar_time < 0) {
		
			solar_time += 24;
			
			day_indicator = "-";
		}

		// form output
		
		p.output_solar_time = (DecimalTimeToClockTime (solar_time, p.input_am_pm)) + day_indicator;
	}

	else p.output_solar_time = "";
	
	// ------------------------------------------------------ //
	// SUN ANGLE PROCEDURE STEP 12:  SUNRISE AND SUNSET TIMES //
	// ------------------------------------------------------ //
	
	if (doable_sun_rise_set) {
	
	if (p.input_feet_meters == "feet") p.input_elevation *= feet_to_meters;
	
		pre_daylength = -1 * ((Math.sin (p.input_latitude * degrees_to_radians) * Math.sin (declination * degrees_to_radians) - 
						Math.sin ((-0.8333 - 0.0347 * Math.sqrt (p.input_elevation)) * degrees_to_radians)) / 
						(Math.cos (p.input_latitude * degrees_to_radians) * Math.cos (declination * degrees_to_radians)));

		// if -1 < pre_daylength < 1, then there is a sunrise and a sunset...

		if (Math.abs (pre_daylength) < 1) {
		
			day_length = Math.acos (pre_daylength) * radians_to_degrees * 8;
					
			sunrise_time = 12 - (0.5 * day_length / 60) - solar_clock_difference;
			sunset_time  = 12 + (0.5 * day_length / 60) - solar_clock_difference;
		
			p.output_day_length = ( p.format_as_string ? FormatFloatString (day_length / 60) : day_length / 60 );
			p.output_sunrise    = DecimalTimeToClockTime (sunrise_time, p.input_am_pm);
			p.output_sunset     = DecimalTimeToClockTime (sunset_time,  p.input_am_pm);
		}

		// ...otherwise, the sun is either above or below the horizon all day, so we return null values
		
		else {
		
			p.output_day_length = "N/A";
			p.output_sunrise    = "N/A";
			p.output_sunset     = "N/A";
		}
	}
	
	else {
	
		p.output_day_length = "";
		p.output_sunrise    = "";			
		p.output_sunset     = "";
	}

	// --------------------------------------------- //
	// SUN ANGLE PROCEDURE STEP 13:  INCIDENCE ANGLE //
	// --------------------------------------------- //
	
	if (doable_incidence_angle) {
	
		// change sign of p.input_surface_azimuth if it's in the direction of negative azimuth
	
		if (((p.input_surface_east_west == "East") && (p.input_zero_azimuth == "South")) ||
			 ((p.input_surface_east_west == "West") && (p.input_zero_azimuth == "North")))   p.input_surface_azimuth *= -1;
			 
		incidence_angle = radians_to_degrees * Math.acos (Math.cos (p.input_surface_tilt * degrees_to_radians) * 
								Math.sin (altitude_angle * degrees_to_radians) + Math.sin(p.input_surface_tilt * degrees_to_radians) * 
								Math.cos(altitude_angle * degrees_to_radians) * Math.cos((azimuth_angle - p.input_surface_azimuth) * 
								degrees_to_radians));
								
		p.output_incidence_angle = ( p.format_as_string ? FormatFloatString (incidence_angle) : incidence_angle );
	}

	else p.output_incidence_angle = "";			
	
	// ---------------------------------------------- //
	// SUN ANGLE PROCEDURE STEP 14:  SOLAR INSOLATION //
	// ---------------------------------------------- //
	// I = S cos Z
	//   S ~ 1000 W/m^2
	//   Z = cos^-1 ( sin(latitiude) sin(solar_declination) + cos(latitiude) cos(solar_declination) cos(15 (time-12)) )
	// FIXME: this is an extremely rough calculation based on info gleaned form the following urls:
	// FIXME: we're using a fixed solar insolation of 1300 as a shortcut (a terribly inaccurate shortcut)
	// @url http://education.gsfc.nasa.gov/experimental/July61999siteupdate/inv99Project.Site/Pages/solar.insolation.html
	// @url http://education.gsfc.nasa.gov/experimental/July61999siteupdate/inv99Project.Site/Pages/science-briefs/ed-stickler/ed-irradiance.html
	// @url http://www.esrl.noaa.gov/gmd/grad/solcalc/azel.html
	// @url http://scienceforums.com/topic/17089-q-calculating-the-intensity-of-sunlight-based-on-latitude/
	// @url http://www.itacanet.org/the-sun-as-a-source-of-energy/part-2-solar-energy-reaching-the-earths-surface/
	
	if (doable_solar_insolation) {
		// solar_insolation = Math.sin ((90 - p.input_latitude) + 23.4) * 1000;
		var hourAngle = 15 * ( solar_time - 12 );
		var cosZ = Math.cos ( 
			Math.acos (
				(
					Math.sin( ( p.input_north_south=='North'?1:-1 ) * p.input_latitude * degrees_to_radians ) * Math.sin( p.output_declination * degrees_to_radians )
				)
				+
				(
					Math.cos( ( p.input_north_south=='North'?1:-1 ) * p.input_latitude * degrees_to_radians ) * Math.cos( p.output_declination * degrees_to_radians ) * Math.cos( hourAngle * degrees_to_radians )
				)
			)
		);
		solar_insolation = 1000 * cosZ;
		// solar insolation * hours of daylight = Wh/m^2 per (hours of daylight)
		// calculate Wh/m^2 by calculating hourly insolation
		// (sunrise + 30 min) solar insolation Wh/m^s = insolation * 1h
		// add one hour and repeat until half hour before sunset
		// add the values to get Wh/m^2 per 24 hours (i.e. per day)
		
		// FIXME: sometimes this comes out negative, still not entirely accurate
		p.output_solar_insolation = ( p.format_as_string ? FormatFloatString ( solar_insolation ) : solar_insolation );
	}

	else p.output_solar_insolation = "";
	
	return p;
}

////////////////////////////////////////////////////////////////////////////////////
//  OTHER FUNCTIONS  
////////////////////////////////////////////////////////////////////////////////////


///////////////////////////////////////////
// FUNCTION:  DECIMAL TIME TO CLOCK TIME //
///////////////////////////////////////////

// converts "12.7500" to "12:45", with formatting based on the am_pm parameter

function DecimalTimeToClockTime (decimal_time, am_pm) {
	
	hours = Math.floor (decimal_time);
	
	minutes = Math.round (60 * (decimal_time % 1));
	
	if (minutes < 10) minutes = "0" + minutes;  // add leading "0" if necessary
	
	if (am_pm == "24 hr") {

		if (hours < 10) hours = "0" + hours;  // add leading "0" if necessary

		return (hours + "" + minutes);
	}
	
	else {
	
		if (hours < 12) {

			if (hours == 0) hours = 12;

			return (hours + ":" + minutes + "am");
		}

		else {

			if (hours == 12) hours = 24;

			return((hours - 12) + ":" + minutes + "pm");
		}
	}
}


////////////////////////
// FUNCTION:  MOD 360 //
////////////////////////

// adds or subtracts multiples of 360 until number is in range of 0 to 360

function Mod360 (input) {

	return (input - Math.floor (input / 360.0) * 360);
}


////////////////////////////
// FUNCTION:  MOD +/- 180 //
////////////////////////////

// adds or subtracts multiples of 360 until number is in range of -180 to 180

function ModPlusMinus180 (input) {

	return (Mod360 (input + 180) - 180);
}


////////////////////////////////////
// FUNCTION:  MONTH STRING TO NUM //
////////////////////////////////////

function MonthStringToMonthNum (whichMonth) {

	if (whichMonth == "Jan") return  (1);
	if (whichMonth == "Feb") return  (2);
	if (whichMonth == "Mar") return  (3);
	if (whichMonth == "Apr") return  (4);
	if (whichMonth == "May") return  (5);
	if (whichMonth == "Jun") return  (6);
	if (whichMonth == "Jul") return  (7);
	if (whichMonth == "Aug") return  (8);
	if (whichMonth == "Sep") return  (9);
	if (whichMonth == "Oct") return (10);
	if (whichMonth == "Nov") return (11);
	if (whichMonth == "Dec") return (12);
		
	return ("Zeke the Solar Cat"); // you can't get here but I swear it made me do this
}

////////////////////////////////////
// FUNCTION:  MONTH NUM TO STRING //
////////////////////////////////////

function MonthNumToMonthString (whichMonth) {

	if (whichMonth == 1) return  ("Jan");
	if (whichMonth == 2) return  ("Feb");
	if (whichMonth == 3) return  ("Mar");
	if (whichMonth == 4) return  ("Apr");
	if (whichMonth == 5) return  ("May");
	if (whichMonth == 6) return  ("Jun");
	if (whichMonth == 7) return  ("Jul");
	if (whichMonth == 8) return  ("Aug");
	if (whichMonth == 9) return  ("Sep");
	if (whichMonth == 10) return ("Oct");
	if (whichMonth == 11) return ("Nov");
	if (whichMonth == 12) return ("Dec");
		
	return ("Zeke the Solar Cat"); // you can't get here but I swear it made me do this
}


/////////////////////////////////
// FUNCTION:  REMOVE SEMICOLON //
/////////////////////////////////

// for time inputs, if second or third character is a semicolon, remove it
	
function RemoveSemicolon (inputString) {

	if (inputString.substring (1,2) == ":") return (inputString.substring(0,1) + inputString.substring(2,4));

	if (inputString.substring (2,3) == ":") return (inputString.substring(0,2) + inputString.substring(3,5));

	return (inputString);
}


////////////////////////////////////
// FUNCTION:  FORMAT FLOAT STRING //
////////////////////////////////////

// This does two things...it forces two digits of precision after the decimal point, and it
// aligns the numbers to two integer digits and two decimal digits in the form:
//
//                  XX.XX
//                 - X.XX
//                   X.XX
	
function FormatFloatString (input) {

	// if negative number, format as positive number, then add negative back at end

	if (input < 0) {

		negative_number = true;

		input *= -1;
	}

	else negative_number = false;

	// get integer and decimal portions

	integer_portion = Math.floor (input); 

	decimal_portion = Math.round (input * 100) % 100;

	// fix potential rounding error

	if ((decimal_portion == 0) && ((input - integer_portion) > 0.5)) integer_portion += 1;

	// pad integer with space if necessary
	
	if (integer_portion < 10) integer_portion_string = " " + integer_portion;

 	else integer_portion_string = "" + integer_portion;
        
	// pad decimal with zero if necessary
	
	if (decimal_portion < 10) decimal_portion_string = "0" + decimal_portion;

	else decimal_portion_string = "" + decimal_portion;

	// return number, with negative sign if required
	
	if (negative_number == true) return ("-" + integer_portion_string + "." + decimal_portion_string);

	else return (" " + integer_portion_string + "." + decimal_portion_string);
}
