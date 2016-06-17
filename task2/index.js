//@author: Shahbaz 

const path = require('path')  
const express = require('express')  
const exphbs = require('express-handlebars')
const async = require("async");

const url = require('url') ;
const http = require("http");
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
	

	if(typeof queryObject.address != 'string'){
		if(typeof queryObject.address != 'object'){
			res.status('404').send('Invalid Query String');
			return;
		}
	}


	// @var {array} asyncTasks  to hold async tasks
	var asyncTasks = [];


	var addressArray = new Array().concat(queryObject.address);
	addressArray.forEach(function(element) {
		asyncTasks.push(function(callback){
    		request(addhttp(element),{timeout: 1500},  function (error, response, body){
				if (!error && response.statusCode == 200) 
  				{	
    				var data = cheerio.load(body);
    				var title = data("title").text();
					var uri = response.request.uri.host + response.request.uri.path;
					dataString += "<li>" + element + " - " + title + "</li>"; 
					

	  			}
				else{
					dataString += '<li>' + error.hostname + ' - ' + 'NO RESPONSE' + '</li>';
				}		
				callback();
			});
  		});

	}, this);
	
	//the tasks will run in parallel
	async.parallel(asyncTasks, function(){
  		// All tasks are done now so render
  		res.render('home', {
    		data: dataString
  		});;
	});

  	
});

app.get('*', function(req, res){
  res.status('404').send('Error');
});

console.log("Listening at 3000");
app.listen(3000);

