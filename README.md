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


**status functions takes the first argument as "riverobject" returned from rivers functions.**
>Collect stats for river

	rivers.get().status({id:100}function (err, data){
		if(!err){
			// all rivers
			console.log(data);
		}
	}); 

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