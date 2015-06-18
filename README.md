riverjs
=========

Collects data about rivers from the Icelandic weatherstation website.

Usage

var rivers = require('./rivers.js');


**Get all rivers, returns object with id, river name and lng,lat**
>Collect all rivers

	rivers.get().rivers(function (err, data){
		if(!err){
			// all rivers
			console.log(data);
		}
	}); 

>Example

	[ 
	  { id: 310,
	    latitude: 64.829674,
	    longitude: -17.63032,
	    name: 'Skjálfandafljót, brú norðan Hraunkvíslar V609' },
	  { id: 11,
	    latitude: 64.540131,
	    longitude: -21.620991,
	    name: 'Andakílsá við Engjanes' },
	  { id: 168,
	    latitude: 63.672779,
	    longitude: -18.410521,
	    name: 'Ása-Eldvatn V328' }
	]

**status functions takes the first argument as "riverobject" returned from rivers functions.**
>Collect stats for river

	rivers.get().status({id:100}function (err, data){
		if(!err){
			// all rivers
			console.log(data);
		}
	}); 

>Example

	{
	    river: {
	        id: 91
	    },
	    value: {
	        timestamp: 1434589200000,
	        mesurements: {
	            air_temperature_c: '3.3',
	            pressure_mb: '10.2',
	            humidity_pr: '95',
	            cumulative_precipitation: '220',
	            'windspeed_m/s': '7',
	            'peakwindspeed_m/s': '9'
	        }
	    }
	}

**You can also collect all data**
>Collecting all rivers and river status

	rivers.get().rivers(function (err, data){
	    var river;
	    for (key in data){
	        river = data[key];
	        rivers.get().status(river,function (err, status){
	            console.log(status);
	        });
	    }
	}); 