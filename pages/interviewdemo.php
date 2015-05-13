<style>

#Dogfamily { background-image: url(/includes/media/interviewdemo/Dogfamily.jpg); display: none !important;}
#SiberianHusky { background-image: url(/includes/media/interviewdemo/SiberianHusky.jpg); display: none !important;}
#Cow { background-image: url(/includes/media/interviewdemo/Cow.jpg); display: none !important;}
#Goldfish { background-image: url(/includes/media/interviewdemo/Goldfish.jpg); display: none !important;}
#Beetle { background-image: url(/includes/media/interviewdemo/Beetle.jpg); display: none !important;}
#Lizard { background-image: url(/includes/media/interviewdemo/Lizard.jpg); display: none !important;}
#SeaBass { background-image: url(/includes/media/interviewdemo/SeaBass.jpg); display: none !important;}
#Jellyfish { background-image: url(/includes/media/interviewdemo/Jellyfish.jpg); display: none !important;}
#Plants { background-image: url(/includes/media/interviewdemo/Plants.jpg); display: none !important;}
#Bacterium {  background-image: url(/includes/media/interviewdemo/Bacterium.jpg); display: none !important;}

#sortable { margin-left: auto; margin-right: auto; width: 650px; height: 50px; padding: 0.5em; }

.treeimage {
	display: none;
	width: 500px;
	height: 500px;
	padding: 0.5em;
	background-repeat: no-repeat;
	background-position: left center;
	background-size:contain;
	margin-left: auto;
	margin-right: auto;

}
#Animals { background-image: url(/includes/media/interviewdemo/Animals.png); } 
#Tree { background-image: url(/includes/media/interviewdemo/Tree.png); } 
#Traits { background-image: url(/includes/media/interviewdemo/Traits.png); } 
#Fish { background-image: url(/includes/media/interviewdemo/Fish.png); } 
#DNA { background-image: url(/includes/media/interviewdemo/DNA.png); } 

.transition {
    -webkit-transform: scale(5.0); 
    -moz-transform: scale(5.0);
    -o-transform: scale(5.0);
    transform: scale(5.0);
}

#sortable > div {
	display: inline-block;
	vertical-align: bottom;
	width: 50px;
	height: 50px;
	padding: 0.5em;
	background-repeat: no-repeat;
	background-position: left center;
	background-size:contain;
 }

button { margin-left: auto; margin-right: auto; left: 50%; position: absolute; }
.ui-state-highlight {background-color:lightgray; border-color: gray;}

#nextactivity {display:none;}

</style>


<br>
<br>
<br>
<br>
<br>
<div class="demo">
    <div id="sortable">
				
        <div id = "Dogfamily"></div>
				<div id = "SiberianHusky"></div>
				<div id = "Cow"></div>
				<div id = "Goldfish"></div>
				<div id = "Beetle"></div>
				<div id = "Lizard"></div>
				<div id = "SeaBass"></div>
				<div id = "Jellyfish"></div>
				<div id = "Plants"></div>
				<div id = "Bacterium"></div>
		</div>
		<div class="treeimage" id="Animals"></div>
		<div class="treeimage" id="Tree"></div>
		<div class="treeimage" id="Traits"></div>
		<div class="treeimage" id="Fish"></div>
		<div class="treeimage" id="DNA"></div>
</div>
<br>
<br>
<br>
<br>	
<button id="nextimg">Next Image</button>
<br>
<br>
<br>
<br>
<button id="nextactivity">Next Activity</button>
<br>
<br>
<br>
<br>
<br>
<script>
	var sortimages = ['Dogfamily','SiberianHusky', 'Cow', 'Goldfish', 'Beetle','Lizard','SeaBass','Jellyfish','Plants','Bacterium'];
	var firstcounter = 0;
	$('#nextimg').click(function(){
		$('#'+sortimages[firstcounter]).click(function(){ $( this ).toggleClass( "transition" ); });
		$('#'+sortimages[firstcounter]).attr("style", "display: inline-block !important");
		console.log(firstcounter, sortimages.length);
		if (firstcounter == sortimages.length-1) {
			$('#nextactivity').attr("style", "display: inline-block");
			$('#nextimg').off('click');
			}	
		
		firstcounter = (firstcounter + 1) % sortimages.length;
});
	$("#sortable").sortable({
					 tolerance: 'pointer',
						placeholder: 'ui-state-highlight',
    				forcePlaceholderSize:true 
				});
//var treeimages = ['Organisms',]
var treeimages = ['Animals','Tree','Traits','Fish','DNA'];
var secondcounter =0;
$("#nextactivity").click(function(){
	$("#sortable").hide();
	$('#'+treeimages[secondcounter]).show();
		$('#nextimg').click(function(){
			$('#'+treeimages[secondcounter]).hide();
			$('#'+treeimages[secondcounter+1]).show();
			secondcounter = (secondcounter + 1) % treeimages.length;
		});
	$('#nextactivity').hide();
})

</script>

