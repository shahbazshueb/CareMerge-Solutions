//@author: Shahbaz 

const path = require('path')  
const express = require('express')  
const exphbs = require('express-handlebars')
var url = require('url') ;
var http = require("http");
const app = express();
var request = require("request");
var cheerio = require("cheerio");
//require('request').debug = true;
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
	
	// @var {number} check used in async operations  
	var check = 0;

	// @var {number} final used in async operations
	var final = 0;

	var getDataFromSite = function (site){
		request(addhttp(site),{timeout: 1500},  function (error, response, body){
				if (!error && response.statusCode == 200) 
  				{	
    				var data = cheerio.load(body);
    				var title = data("title").text();
					dataString += "<li>" + site + " - " + title + "</li>"; 
	  			}
				else{
					dataString += '<li>' + error.hostname + ' - ' + 'NO RESPONSE' + '</li>';
				}
				check++;
				//If the titles of all the url have been received render the page
				if(check == final){
					res.render('home', {
    					data: dataString
  					});
				}			
			});
	}
	if(typeof queryObject.address == 'string')
	{
		final = 1;
		getDataFromSite(queryObject.address);
	}
	else if(typeof queryObject.address == 'object')
	{
		final = queryObject.address.length;
		for(var i = 0; i < queryObject.address.length; i++){
			
			getDataFromSite(queryObject.address[i]);
		}
	}
	else{
		res.status('404').send('Invalid Query String');
	}
  	
});

app.get('*', function(req, res){
  res.status('404').send('Error');
});

console.log("Listening at 3000");
app.listen(3000);

