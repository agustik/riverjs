var request = require('request');

var Iconv  = require('iconv').Iconv;

var iconv = new Iconv('ISO-8859-1', 'UTF-8');

var cheerio = require('cheerio');

// first get all datapoints http://vmkerfi.vedur.is/vatn/vdv_gmap.php

var url = {
	graph : "http://vmkerfi.vedur.is/vatn/vdv_gmap_site_data.php",
	front : "http://vmkerfi.vedur.is/vatn/vdv_gmap.php",
	base : "http://vmkerfi.vedur.is/vatn/"
} 


var rivers = {
	get: function (){
        var _root = this;

        return {
            rivers : function (callback){
                request(url.front, {timeout: 20000, encoding: null}, function (error, response, body) {
                    if (!error && response.statusCode == 200) {

                        var buf = iconv.convert(body),
                            data = buf.toString('utf-8'),
                            arr=[], line, lines = data.split('\n'),
                            reg = new RegExp('(places\[[0-9]{0,4}\]=)');


                        for (key in lines){
                            line = lines[key];
                            if(reg.test(line)){
                                arr.push(_root.tools._cleanPlaces(line));
                            }
                        }
                        callback(null, arr);
                    }else{
                        callback(error, response);
                    }
                });
            },
            graph : function (river, callback){
                if(!river){
                    callback('No river object, river.id is required');
                    return;
                }
                request(url.graph + "?site_id="+river.id, {timeout: 20000, encoding: null}, function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        var buf = iconv.convert(body),
                            buffer = buf.toString('utf-8'),
                            form = _root.tools._fetchForm(buffer);

                        _root.tools._fetchFormData(form, function (err, data){
                            if(!err){
                                var parse = _root.tools._cleanRiverData(data);
                                callback(null, parse);
                            }
                        });
                    }else{
                        callback(error, response);
                    }
                });

            },
            status : function (river, callback){
                if(!river){
                    callback('No river object, river.id is required');
                    return;
                }
                request(url.graph + "?site_id="+river.id, {timeout: 20000, encoding: null}, function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        var buf = iconv.convert(body),
                            buffer = buf.toString('utf-8'),
                            values = _root.tools._fetchRiverStatus(buffer),
                            obj = { river : river, value : values};

                        callback(null, obj);
                        
                    }else{
                        callback(error, response);
                    }
                });
            }
        }

    },
    tools : {
        _fetchFormData : function (obj, callback){
            // hack ...
            var _tools = this;
            obj.data.js_graph_variable_list = obj.data.variable;
            request.post({ url :url.base+obj.url, form : obj.data }, function (error, response, body){
                if (!error && response.statusCode == 200) {
                    callback(null, body);
                }else{
                    callback(error, response);
                }
            });
        }, 
        _serialize : function (arr){
            var value, obj = {};
            for (key in arr){
                value = arr[key];
                obj[value.name] = value.value;
            }
            return obj;
        },
        _fetchForm : function (string){
            var _tools = this;
            var $ = cheerio.load(string);

            var form = $('#js_graph_form');
            var obj = {};

            obj.url = form.attr().action;
            
            obj.data = _tools._serialize(form.serializeArray());       

            return obj;
        },
        _fetchRiverStatus : function (string){
            var _tools = this, td, key, value, time, tr, obj = {};
            
            var $ = cheerio.load(string);
            var element = $('#tab1');

                time = _tools._parseTime(element.find('div').text());
                tr = element.find('table').find('tr');
                
            tr.each(function (i){
               td = $(this).find('td');
               key = _tools._cleanKey($(this).find('.left_col').text());
               value = $(this).find('.right_col').text();
               obj[key] = value;
            });

            return {timestamp : time, mesurements : obj};

        },
        _cleanRiverData:function(data){
            var _tools = this, arr=[], line, lines = data.split('\n');
            var reg = new RegExp(/Array\([0-9]*\,/);


            for (key in lines){
                line = lines[key];
                if(reg.test(line)){
                    arr.push(_tools._cleanRiverJavascript(line));
                    //arr.push(line);
                }
            }
            return arr;

        },
        _parseTime : function (string){
            if(!string){
                return;
            }
            var tmp, timestamp, hh, mm, DD,MM,YYYY;

            tmp=string.split(': ')[1];

            x = tmp;

            tmp = x.split(" - ");

            hh = tmp[0].split(':')[0];
            mm = tmp[0].split(':')[1];
            YYYY = tmp[1].split(' ')[1];
            DD = tmp[1].split('.')[0];
            MM = tmp[1].split('.')[1].split(' ')[0];

            var datestring = [YYYY, MM, DD].join('.') + " " +[hh, mm].join(':');
            timestamp = new Date(datestring).getTime();

            return timestamp;

        },
        _cleanKey : function (key){
            if(!key){
                return;
            }
            key = key.replace(/ /g, '');
            key = key.replace(/°/, '');
            key = key.replace(/³/, '3');
            
            key = key.toLowerCase();

            var keys = {
                "vatnshæð(cm)" : "waterheight_cm",
                "loftvog(mb)" : "pressure_mb",
                "lofthiti(c)" : "air_temperature_c",
                "vindhviðuhraði(m/s)" : "peakwindspeed_m/s",
                "rafleiðin(µs/cm)" : "conducting_uS/cm",
                "rafhlada_min" : "battery_min",
                "rakastig(%)" : "humidity_pr",
                "vatnshiti(c)" : "water_temperature_c",
                "rennsli(m3/s)" : "flowrate_m3/s",
                "geislun(w/m2)" : "solarpower_w/m2",
                "vatnshæð(cmy.s.)" : "waterheight_os/cm",
                "úrkoma(mm/10mínútum)" : "precipitation_mm/10min",
                "rennsli(l/s)" : "flowrate_l/s",
                "rennsli_m3/s" : "flowrate_m3/s",
                "leiðni(µs/cm)" : "leiðni(µs/cm)",
                "loftþrýstingur(mb)" : "pressure_mb",
                "vindhraði(m/s)" : "windspeed_m/s",
                "rennsli(m3/s)w1" : "flowrate_m3/s_w1",
                "vindátt()" : "winddirection_deg",
                "vatnshæð(my.s.)" : "waterheight_os/cm",
                "vatnshæð" : "waterheight_cm",
                "vanshæð(cm)" : "waterheight_cm",
                "rafleiðni(µs/cm)" : "conducting_uS/cm",
                "raflleiðni(µs/cm)" : "conducting_uS/cm",
                "rakastif(%)" : "humidity_pr",
                "rafleiðni(us/cm)" : "conducting_uS/cm",
                "uppsöfnuðúrkoma(mm)" : "cumulative_precipitation",
                "vindhraði(m(s)" : "windspeed_m/s",
                "úrkomasíðustu10mín(mm)" : "precipitation_mm/10min",
                "uppsöfnuðúrkoma(mm)" : "cumulative_precipitation",
                "úrkomauppsöfnuð(mm)" : "cumulative_precipitation"
            };
            

            x=keys[key];
            if(x !== undefined){
                return x;
            }
            return key;
        },
        _cleanRiverJavascript : function (string){
  
            var obj= {}, tmp, x, y;

            x = string.split(';');
            if(x.length > 2){
                tmp=x[1].split('=')[1];
            }else{

                tmp = string.split('=')[1];
            }
            x = tmp.replace(/ /g, '');
            x = x.replace(/Array\(/, '');
            x = x.replace(/\)/, '');
            x = x.replace(/\;/, '');

            y = x.split(',');


            obj.timestamp = y[0];
            obj.value = y[1];
            return obj;
            
        },
        _cleanPlaces:function(string){

            var tmp, arr;


            tmp = string.split('=')[1];
            tmp = tmp.replace(/;/g,'');
            tmp = tmp.replace(/'/g,'"');

            arr = JSON.parse(tmp);
            return {
                id : arr[0],
                latitude : arr[1],
                longitude : arr[2],
                name : arr[4]
            };
        }
    }
    
};

module.exports=rivers;