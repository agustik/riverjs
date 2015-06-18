
var rivers = require('./rivers.js');

var fs = require('fs');



/*
rivers.get().rivers(function (err, data){
    console.log(data);
    /*var river, arr,i=0, l = data.length;
    var arr = [];
    for (key in data){
        river = data[key];
        rivers.get().status(river,function (err, status){
            arr.push(status);
            i++;
            if(i == l){
                fs.writeFileSync('rivers.json',  JSON.stringify(arr, null, 4));
            }
        });
    }*
}); */

rivers.get().status({id:91},function (err, status){
    console.log(status);
});