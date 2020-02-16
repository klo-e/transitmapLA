/*

	Global variables

*/
var metro = {};

//bus stop location array
metro.busstops = [];
/*

	Run this when the html document is loaded
	Source: https://learn.jquery.com/using-jquery-core/document-ready/

*/
metro.livebusicon = L.icon({
	iconUrl: 'images/livebus.png',
	iconSize: [32, 32], // size of the icon
});

metro.busicon = L.icon({
	iconUrl: 'images/bus-stop.png',
	iconSize: [18, 18], // size of the icon
});

$( document ).ready(function() {
	metro.init();
});

/*

	The initialize function is the first thing this application does

*/
metro.init = function()
{
	console.log("hello world")
	metro.map = L.map('map').setView([34.0522, -118.2437], 10);

	var Stamen_TonerLines = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lines/{z}/{x}/{y}{r}.{ext}', {
	attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	subdomains: 'abcd',
	minZoom: 0,
	maxZoom: 20,
	ext: 'png'
	}).addTo(metro.map);

  metro.getBusRoutes();

  metro.mapBusStops(20);
};

//get bus routes
metro.getBusRoutes = function()
{
	$.getJSON('http://api.metro.net/agencies/lametro/routes/',
		function(data)
		{
			//loop through each item
			$.each(data.items, function(i,item){
				console.log(item.display_name);
				$('#stoplist').append('<div class="well well-sm" onclick="metro.mapBusStops('+item.id+')">' + item.display_name + '</div>');
			});
		}
	);
}

//map bus stops
metro.mapBusStops = function(busnum)
{
	metro.removeLayer();

	$.getJSON('http://api.metro.net/agencies/lametro/routes/' + busnum + '/sequence/', function(data)
	{
		$.each(data.items, function(i,item){
			//create the lat/lon for this stop
			var thisbusstop = L.marker([item.latitude, item.longitude],{icon:metro.busicon}).addTo(metro.map)
				.bindPopup(item.display_name);
				metro.busstops.push(thisbusstop); //adds this new stop to the busstop array
		});
		// zoom map to extent of all bus stops
		var group = new L.featureGroup(metro.busstops);
		metro.map.fitBounds(group.getBounds());

	});

	metro.getLiveBus(busnum);

}

metro.removeLayer = function()
{
	//check if busstops has values in it
	if (metro.busstops)
	{
		//loop through each bus stop and remove it
		for (i in metro.busstops)
		{
			metro.map.removeLayer(metro.busstops[i]);
		}
		// reset the busstops array to null
		metro.busstops = [];
	}
}

//get bus routes
metro.getLiveBus = function(busnum)
{
	// get real time buses from metro API
	$.getJSON('http://api.metro.net/agencies/lametro/routes/' + busnum + '/vehicles/',
		function(data)
		{
			console.log(data)
			//loop through each item
			$.each(data.items, function(i,item){
				//create the marker for this bus
				var thisbusstop = L.marker([item.latitude, item.longitude],{icon:metro.livebusicon}).addTo(metro.map)
					.bindPopup(item.display_name);

				//add this bus to the busstop array (so that we can delete it later)
				metro.busstops.push(thisbusstop);
			});
		}
	);
}
