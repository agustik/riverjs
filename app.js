var request = require('request');


var utf8 = require('utf8');


var Iconv  = require('iconv').Iconv;

var iconv = new Iconv('ISO-8859-1', 'UTF-8');



// first get all datapoints http://vmkerfi.vedur.is/vatn/vdv_gmap.php




request('http://vmkerfi.vedur.is/vatn/vdv_gmap.php', {timeout: 20000, encoding: null}, function (error, response, body) {
  if (!error && response.statusCode == 200) {

  	var buf = iconv.convert(body);
    var buffer = buf.toString('utf-8');
    vatn.getPoints(buffer);
  }
});



var vatn = {
	getPoints:function (data){
		var _root = this;
		var raw=[];
		var line, lines = data.split('\n');
		var reg = new RegExp('(places\[[0-9]{0,4}\]=)');
		for (key in lines){
			line = lines[key];
			if(reg.test(line)){
				raw.push(_root._cleanPlaces(line));
			}
		}
		console.log(raw, raw.length);
	},
	_cleanPlaces:function(string){

		var tmp;


		tmp = string.split('=')[1];
		tmp = tmp.replace(/;/g,'');
		tmp = tmp.replace(/'/g,'"');
		var arr = this._parseJSON(tmp);
		return {
			latitude : arr[1],
			longitude : arr[2],
			name : arr[4]
		};
	},
	_parseJSON: function (string){
		try{
			return JSON.parse(string);

		}catch (e){
			console.log(e)
		}
	}
};