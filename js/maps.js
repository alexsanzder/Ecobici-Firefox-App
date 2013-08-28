// Ecobici Firefox OS App
//Development for Firefox OS
//autor: alejandro.sanchez@weetsi.com)

//TODO
//- Add panel select for country/city network services
//- Add more info about the station
//- Find the nearest station 
//- Settings

//Analytics
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

  ga('create', 'UA-43551826-1', 'github.com');
  ga('send', 'pageview');


var map;
var infowindow = new google.maps.InfoWindow;
var infobox;
var infoBubble;
var locationMarker = null;
var purpleMarker = new google.maps.MarkerImage("img/pin/purple_pin.png");
var greenMarker = new google.maps.MarkerImage("img/pin/green_pin.png");
var redMarker = new google.maps.MarkerImage("img/pin/red_pin.png");
var yellowMarker = new google.maps.MarkerImage("img/pin/yellow_pin.png");
var blueMarker = new google.maps.MarkerImage("img/pin/blue_pin.png");
purpleMarker.anchor = new google.maps.Point(6, 20);
greenMarker.anchor = new google.maps.Point(6, 20);
redMarker.anchor = new google.maps.Point(6, 20);
yellowMarker.anchor = new google.maps.Point(6, 20);
blueMarker.anchor = new google.maps.Point(6, 20);

var markersArray = [];

var selected = false;
var selectedIcon = false;

window.addEvent('domready', function() {
		var mapOptions = {
		zoom: 12,
		center: new google.maps.LatLng(19.42, -99.170),
		zoomControlOptions: {
			style: google.maps.ZoomControlStyle.SMALL,
			position: google.maps.ControlPosition.LEFT_TOP
		},
		disableDefaultUI: true,
		zoomControl: true,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);


	reload("index", true);

	$('location').addEvent('click', function(ev) {
		new Event(ev).stop();

		// close the infowindow
		if (infoBubble) {
			infoBubble.close();
		}

		getLocation(function(position) {
			var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
			map.panTo(pos);
			map.setZoom(16);
			if (locationMarker != null) {
				locationMarker.setMap(null);
				locationMarker = null;
			}
			
			setTimeout(function() {
				
				var marker = new google.maps.Marker({
					'position': pos,
					'title': "¡ Usted esta aquí !",
					'map': map,
					animation: google.maps.Animation.DROP,
					'icon': purpleMarker
				});
				locationMarker = marker;
				
				infoBubble = new InfoBubble({
					map: map,
					content: '<div class="phoneytext">Usted esta aquí</div>',
					shadowStyle: 1,
					padding: 0,
					backgroundColor: 'rgb(57,57,57)',
					borderRadius: 4,
					arrowSize: 9,
					borderWidth: 1,
					borderColor: '#2c2c2c',
					disableAutoPan: false,
					hideCloseButton: true,
					arrowPosition: 50,
					maxWidth: 200,
					backgroundClassName: 'phoney',
					arrowStyle: 0
				});
				
				infoBubble.open(map, marker);
			
			}, 650);
				// add infoBubble
				
		});
	});
	
	
	$('update').addEvent('click', function(ev) {
		reload("index", false);
			if (infoBubble) {
				infoBubble.close();
			}
	});
});


var reload = function(system, center) {
		loadBikes(map, system, center, function() {}, function() {
			$('update').addClass("loading");
		}, function() {
			$('update').removeClass("loading");
		});
	};



var cleanMarkers = function() {
		if (markersArray) {
			markersArray.each(function(marker) {
				marker.setMap(null);
			});
			markersArray.length = 0;
		}
	};

var loadBikes = function(map, city_id, center, onFailure, onRequest, onComplete) {
		
		//Consultamos la api de citybik.es para el sistema "ecobici" pero pensando en que 
		//se puede usar para todas las redes cambiaremos la variable country para cada pais.
		var country;
		country='ecobici'; //red de bicicletas en Mexico
		
		loadJSON('http://api.citybik.es/' + country + '.json', 'get', null, function() {
		}, function() {
			onRequest();
		}, function(response) {
			var stations = response;
			if (center) {
				map.setZoom(14);
			}
			cleanMarkers();
			var tmpMarker;
			stations.each(function(elem) {
				if (elem.bikes == 0) {
					tmpMarker = redMarker;
				} else if (elem.bikes < 5) {
					tmpMarker = yellowMarker;
				} else {
					tmpMarker = greenMarker;
				}
				
			
				
				var timestamp= elem.timestamp;
				var t = Date.parse(timestamp);
				var time = t.decrement('hour', 7);
				time = time.format('%I:%M:%S%p %d/%m/%Y');
				
				
				var marker = new google.maps.Marker({
					'position': new google.maps.LatLng(elem.lat / 1E6, elem.lng / 1E6),
					'title': elem.name,
					'map': map,
					'icon': tmpMarker
				});

				// add event listener when marker is clicked
				google.maps.event.addListener(marker, 'click', function() {
					console.dir(this);

					if (infowindow) {
						infowindow.close();
					}

					if (infoBubble) {
						infoBubble.close();
					}

					if (selected && selectedIcon) {
						selected.setIcon(selectedIcon);
					}
					selectedIcon = this.getIcon();
					selected = this;
					this.setIcon(blueMarker);

					// add infoBubble
					infoBubble = new InfoBubble({
						map: map,
						content: '<div class="phoneytext">' + elem.name + '<br>Bicis: ' + elem.bikes + '    Estaciones: ' + elem.free + '<br>Actualización: ' + time +'</div>',
						shadowStyle: 1,
						padding: 0,
						backgroundColor: 'rgb(57,57,57)',
						borderRadius: 4,
						arrowSize: 15,
						borderWidth: 1,
						borderColor: '#2c2c2c',
						disableAutoPan: false,
						hideCloseButton: true,
						arrowPosition: 50,
						maxWidth: 300,
						backgroundClassName: 'phoney',
						arrowStyle: 0
					});
					infoBubble.open(map, this);
				});
				markersArray.push(marker);
			});
			onComplete();
		});
	}



var loadJSON = function(url, method, data, onFailure, onRequest, onComplete) {
		var request = new Request.JSONP({
			async: true,
			method: method,
			url: url,
			data: data,
			onFailure: onFailure,
			onRequest: onRequest,
			onComplete: onComplete
		});
		request.send();
	}

var getLocation = function(callback) {
		if (navigator && navigator.geolocation) navigator.geolocation.getCurrentPosition(callback, function() {
			alert("Error al obtener su ubicación");
		});
		else alert("Su browser no soporta geolocation");
	}
