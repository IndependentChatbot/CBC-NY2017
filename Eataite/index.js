<!--// Eataite,CBC 2017 -->

<!--//Sample curl Post   
// curl -X POST -H 'Content-type: application/json' --data '{"text":"Hello, World!"}' https://hooks.slack.com/services/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
-->

'use strict';

const httpstatus = require('./httpstatus');
const request = require('request');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const server = app.listen(process.env.PORT || 3000, () => {
  console.log('Express server listening on port %d in %s mode', server.address().port, app.settings.env);
});

// Auth

app.get('/slack', function(req, res){
  if (!req.query.code) { // access denied
    res.redirect('http://www.google.com/');
    return;
  }
  var data = {form: {
      client_id: process.env.SLACK_CLIENT_ID,
      client_secret: process.env.SLACK_CLIENT_SECRET,
      code: req.query.code
  }};
  request.post('https://slack.com/api/oauth.access', data, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      // Get an auth token
      let token = JSON.parse(body).access_token;

      // Get the team domain name to redirect to the team URL after auth
      request.post('https://slack.com/api/team.info', {form: {token: token}}, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          if(JSON.parse(body).error == 'missing_scope') {
            res.send('Image Order has been added to your team!');
          } else {
            let team = JSON.parse(body).team.domain;
            res.redirect('http://' +team+ '.slack.com');
          }
        }
      });
    }
  })
});

/* *******************************
/* Image Order Slash Command
/* ***************************** */

app.get('/', (req, res) => {
  handleQueries(req.query, res);
});

app.post('/', (req, res) => {
  handleQueries(req.body, res);
});

function handleQueries(q, res) {
  if(q.token !== process.env.SLACK_VERIFICATION_TOKEN) {
    // the request is NOT coming from Slack!
    return;
  }
  if (q.text) {
    let code = q.text;

    if(! /^\d+$/.test(code)) { // not a digit
      res.send('Enter feedback');
      return;
    }

    let status = httpstatus[code];
    if(!status) {
      res.send('Bummer, ' + code + ' describe your opinion.');
      return;
    }

    let image = 'https://http.cat/' + code;
    let data = {
      response_type: 'in_channel', // public to the channel
      text: code + ': ' + status,
      attachments:[
      {
        image_url: 'https://localhost:3000.'
        text: 'We would like to help you place your order.'
      }
    ]};
    res.json(data);
  } else {
    let data = {
      response_type: 'ephemeral', // private message
      text: 'How to use /imageorder command:',
      attachments:[
      {
        text: 'Type feedback after the command, e.g. `/imageorder Good! Better! Best!`',
      }
    ]};
    res.json(data);
  }
}


function gridArray(id, width, height, square){

	var gridData = randomData(width, height, square);
    console.log(gridData);
    console.log(width + " " + height);   

    var grid = d3.select("svg").append("svg")
                    .attr("width", width)
                    .attr("height", height)
                    .attr("class", "chart");
    var row = grid.selectAll("#row")
                  	.data(gridData)
                	.enter().append("svg:g")
                  	.attr("class", "row");

    var col = row.selectAll("#cell")
                 	.data(function (d) { return d; })
                	.enter().append("svg:rect")
                 	.attr("class", "cell")
                 	.attr("x", function(d) { return d.x; })
                 	.attr("y", function(d) { return d.y; })
                 	.attr("width", function(d) { return d.width; })
                 	.attr("height", function(d) { return d.height; })
                 	.on('mouseover', function() {
            d3.select(this)
                    .style('fill', '#fffccc');
                 	})
                 	.on('mouseout', function() {
            d3.select(this)
                    .style('fill', '#FFF');
                 	})
                 	.on('click', function() {
    console.log(d3.select(this));
                 	})
                 	.style("fill", '#fff')
                 	.style("stroke", '#555');
    //return gridData;
}


function randomData(gridWidth, gridHeight, square)
{
    var data = new Array();
    var gridItemWidth = gridWidth / 25;  // Previous: 24
    var gridItemHeight = (square) ? gridItemWidth : gridHeight / 7;

    	var changer;
    	if (square == true){
    		changer = gridItemWidth;
    	} else {
    		changer = gridHeight / 7;
    	}

    var startX = gridItemWidth / 2;
    var startY = gridItemHeight / 2;
    var stepX = gridItemWidth;
    var stepY = gridItemHeight;
    var xpos = startX;
    var ypos = startY;
    var newValue = 0;
    var count = 0;

    for (var index_a = 0; index_a < 10; index_a++)
    {
        data.push(new Array());
        for (var index_b = 0; index_b < 24; index_b++)
        {
            newValue = Math.round(Math.random() * (100 - 1) + 1);
            data[index_a].push({ 
                                time: index_b, 
                                value: newValue,
                                width: gridItemWidth,
                                height: gridItemHeight,
                                x: xpos,
                                y: ypos,
                                count: count
                            });
            xpos += stepX;
            count += 1;
        }
        xpos = startX;
        ypos += stepY;
    }
    console.log(newValue);
    return data;
}

