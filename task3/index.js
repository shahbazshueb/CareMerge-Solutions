//@author: Shahbaz 

const path = require('path')  
const express = require('express')  
const exphbs = require('express-handlebars')
var rp = require('request-promise');
var Promise = require('promise');
const url = require('url') ;
const http = require("http");
const app = express();
var cheerio = require("cheerio");

function addhttp(url) {
    if (!/^(?:f|ht)tps?\:\/\//.test(url)) {
        url = "http://" + url;
    }
    return url;
}



app.engine('.hbs', exphbs({  
  defaultLayout: 'main',
  extname: '.hbs',
  layoutsDir: path.join(__dirname, 'views/')
}))
app.set('view engine', '.hbs') ; 
app.set('views', path.join(__dirname, 'views'))  ;

app.get('/I/want/title', (req, res) => {  
	// @var {string{ dataString stores the final html to be passed to the view
	var dataString = "";

	// @var {number} queryObject query string of url
	var queryObject = url.parse(req.url,true).query;
	

	if(typeof queryObject.address != 'string'){
		if(typeof queryObject.address != 'object'){
			res.status('404').send('Invalid Query String');
			return;
		}
	}


	var promiseArray = [];
	var i = 0;
	var addressArray = new Array().concat(queryObject.address);
	addressArray.forEach(function(element) {
		promiseArray[i] = rp(addhttp(element))
    		.then(function (htmlString) {
				
        		var data = cheerio.load(htmlString);
    			var title = data("title").text();
				dataString += "<li>" + element + " - " + title + "</li>"; 
    	})
    	.catch(function (err) {
        	dataString += '<li>' + element + ' - ' + 'NO RESPONSE' + '</li>';
    	});
		i++;
	}, this);
	Promise.all(promiseArray).then(function(results){
		res.render('home', {
    		data: dataString
  		});
	});
});

app.get('*', function(req, res){
  res.status('404').send('Error');
});

console.log("Listening at 3000");
app.listen(3000);

