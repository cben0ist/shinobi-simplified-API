var express = require("express");
var favicon = require('serve-favicon');
var path = require('path');

const host = '127.0.0.1';
const port = 8990;

function callRequest(path, method, json, data, next) {
  const request = require('request');
  const options = {
    url: 'http://' + host + ':' + port + path,
    method: method,
    json: json,
    qs: {
      data: data
    }
  };
  //console.log(options);
  request(options, function(err, res, body) {
    if (err) {
      return console.log(err);
    }
    if (!err && res.statusCode == 200) {
      next(body);
    }
  });
}

function setMonitor(key, monitor, group, monitorJson, detectorValue) {
  // Set new value
  let details = JSON.parse(monitorJson.details);
  details.detector = detectorValue;
  monitorJson.details = JSON.stringify(details);

  // Remove extra keys
  delete monitorJson['currentlyWatching'];
  delete monitorJson['currentCpuUsage'];
  delete monitorJson['status'];
  delete monitorJson['snapshot'];
  delete monitorJson['streams'];
  delete monitorJson['streamsSortedByType'];

  // Configure Monitor
  console.log("Setting Monitor " + monitorJson.mid + ' detector to ' + detectorValue);
  var path = '/' + key + '/configureMonitor/' + group + '/' + monitor + '/';
  callRequest(path, 'GET', true, JSON.stringify(monitorJson), function(res) {
    console.log(res);
  });
}

function updateMonitor(key, monitor, group, detectorValue) {
  var path = '/' + key + '/monitor/' + group + '/' + monitor + '/';
  callRequest(path, 'GET', true, '', function(monitorJson) {
    try {
      let monitorDetailsJson = JSON.parse(monitorJson.details);
      console.log(monitorJson.mid + ' detector is => ' + monitorDetailsJson.detector);
      setMonitor(key, monitor, group, monitorJson, detectorValue);
    } catch (e) {
      console.error('Unable to get ' + monitor);
    }
  });
}

var app = express();
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.get("/detector", (req, res) => {
  var key = req.query.key;
  var monitor = req.query.monitor;
  var group = req.query.group;
  var detectorValue = req.query.detector;

  console.log(key + '/' + monitor + '/' + group + '/' + detectorValue);
  updateMonitor(key, monitor, group, detectorValue);

  res.json({
    result: 'OK'
  });
});

app.listen(8087, () => {
  console.log("Server running on port 8087");
});
