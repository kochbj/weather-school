// initialize
$('.datePicker').datepicker({
	minDate : startupOpts.dateMin,
	maxDate : startupOpts.dateMax,
	defaultDate : startupOpts.dateDefault,
	yearRange : startupOpts.dateMin.getFullYear()+':'+startupOpts.dateMax.getFullYear(),
	autoSize : true,
	changeMonth : true,
	changeYear : true,
	showButtonPanel: true
});
$("#ui-datepicker-div").css("z-index",1001);
