var Settings = require('settings');
var ajax = require('ajax');
var UI = require('ui');
var splashScreen = new UI.Card({ banner: 'images/domoticzbw144x144.png',fullscreen: true });
var domoticzurl = Settings.option('domoticzurl');
var username = Settings.option('username');
var password = Settings.option('password'); 
var showfavorites = Settings.option('showfavorites');
var showscenes = Settings.option('showscenes');
var showswitches = Settings.option('showswitches');
var showutilities = Settings.option('showutilities');
var showtemperature = Settings.option('showtemperature');
var showweather = Settings.option('showweather');

var menusections = [];
if(showscenes == '1'){menusections.push("Scenes");}
if(showswitches == '1'){menusections.push("Switches");}
if(showutilities == '1'){menusections.push("Utilities");}
if(showtemperature == '1'){menusections.push("Temperature");}
if(showweather == '1'){menusections.push("Weather");}

splashScreen.show();


var Base64 = {
    // private property
    _keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
    // public method for encoding
    encode : function (input) {
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;
        input = Base64._utf8_encode(input);
        while (i < input.length) {
            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);
            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;
            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }
            output = output +
            this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
            this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
        }
        return output;
    },
    // public method for decoding
    decode : function (input) {
        var output = "";
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;
        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
        while (i < input.length) {
            enc1 = this._keyStr.indexOf(input.charAt(i++));
            enc2 = this._keyStr.indexOf(input.charAt(i++));
            enc3 = this._keyStr.indexOf(input.charAt(i++));
            enc4 = this._keyStr.indexOf(input.charAt(i++));
            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;
            output = output + String.fromCharCode(chr1);
            if (enc3 != 64) {
                output = output + String.fromCharCode(chr2);
            }
            if (enc4 != 64) {
                output = output + String.fromCharCode(chr3);
            }
        }
        output = Base64._utf8_decode(output);
        return output;
    },
    // private method for UTF-8 encoding
    _utf8_encode : function (string) {
        string = string.replace(/\r\n/g,"\n");
        var utftext = "";
        for (var n = 0; n < string.length; n++) {
            var c = string.charCodeAt(n);
            if (c < 128) {
                utftext += String.fromCharCode(c);
            }
            else if((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            }
            else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }
        }
        return utftext;
    },
    // private method for UTF-8 decoding
    _utf8_decode : function (utftext) {
        var string = "";
        var i = 0;
        var c = 0;
//        var c1 = 0;
        var c2 = 0;
        var c3 = 0;
        while ( i < utftext.length ) {
            c = utftext.charCodeAt(i);
            if (c < 128) {
                string += String.fromCharCode(c);
                i++;
            }
            else if((c > 191) && (c < 224)) {
                c2 = utftext.charCodeAt(i+1);
                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                i += 2;
            }
            else {
                c2 = utftext.charCodeAt(i+1);
                c3 = utftext.charCodeAt(i+2);
                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }
        }
        return string;
    }
};

var domoticz = {
  _data : {},
  _request : function (path) {

                  ajax(
                  {
                    url: domoticzurl + path,
                  type: 'json',
                  async: false,
                  headers:{
                      Authorization: "Basic " + Base64.encode(username + ":" + password),
                      },
                  },
                      function(data) {
                        domoticz._data = data;
                        console.log(JSON.stringify(data));
                        

                      },
                      function(error) {
                          console.log('The ajax request failed: ' + error);
                          console.log(domoticzurl);
                      }
                  );
                  return domoticz._data;
  },
  getDevices : function () {
        return this._request('/json.htm?type=devices&used=true&order=Name');
    },
  getScenes : function () {
    return this._request('/json.htm?type=scenes');
    },
  getSwitches : function () {
    return this._request('/json.htm?type=devices&used=true&order=Name&filter=light');
    },
  getUtilities : function () {
    return this._request('/json.htm?type=devices&used=true&order=Name&filter=utility');
    },
  getTemperature : function () {
    return this._request('/json.htm?type=devices&used=true&order=Name&filter=temp');
    },
  getWeather : function () {
    return this._request('/json.htm?type=devices&used=true&order=Name&filter=weather');
  },
  getDevice : function (idx) {
    return this._request('/json.htm?type=devices&rid=' + idx);
  },
  getScene : function (idx) {
    return this._request('/json.htm?type=scenes&rid=' + idx);
  },
  On : function (idx) {
    return this._request('/json.htm?type=command&param=switchlight&idx='+ idx +'&switchcmd=On&level=0');
  },
  Off : function (idx) {
    return this._request('/json.htm?type=command&param=switchlight&idx='+ idx +'&switchcmd=Off&level=0');
  },
  setLevel : function (idx,level) {
    return this._request('/json.htm?type=command&param=switchlight&idx='+ idx +'&switchcmd=Set%20Level&level=' + level);
  },
  sceneOn : function (idx) {
    return this._request('/json.htm?type=command&param=switchscene&idx='+ idx +'&switchcmd=On');
  },
  sceneOff : function (idx) {
    return this._request('/json.htm?type=command&param=switchscene&idx='+ idx +'&switchcmd=Off');
  },
  toggleDevice : function (idx){
    var device = this.getDevice(idx);
        if(device.result[0].Status == "Off"){this.On(idx);}
    else if(device.result[0].Type == "P1 Smart Meter"){return device.result[0].CounterToday;}
    else {this.Off(idx);}
    device = this.getDevice(idx);
    return device.result[0].Status;
  },
  toggleDevice2 : function (idx){
    var device = this.getDevice(idx);
        if(device.result[0].Status == "Off"){this.On(idx);}
    else {this.Off(idx);}
    },
};

Settings.config({
  url: 'https://www.vanderrijt.nl/pebble/config.html?settings=' + encodeURIComponent(JSON.stringify(Settings.option())) },
  function(e) {console.log('opening configurable');},
  function(e) {console.log('closed configurable');if (e.failed) {console.log(e.response);}}
               );

var menu = new UI.Menu();
for (var x = 0; x < menusections.length; x++ ) {
  menu.section(x, { title:  menusections[x]});
}

var scenes = domoticz.getScenes();
var switches = domoticz.getSwitches();
var utilities = domoticz.getUtilities();
var temperature = domoticz.getTemperature();
var weather = domoticz.getWeather();
var q = 0;
//scenes 
if(showscenes == '1')
  {
    if(q=='0') { q = '0';} 
    for(var i=0,m=0; i < scenes.result.length; i++) {
      if(showfavorites == '1'){  if(scenes.result[i].Favorite == 1) {
      menu.item(q, m, { title: scenes.result[i].Name, idx: scenes.result[i].idx, type: 'Scene' });
      m++;
      }} else {
        menu.item(q, m, { title: scenes.result[i].Name, idx: scenes.result[i].idx, type: 'Scene' });
        m++; }} q++;
  }
//switches
if(showswitches == '1')
  {
   if(q=='0') { q = '0';}
   for(var i=0,m=0; i<switches.result.length; i++) {
     if(showfavorites == '1'){ if(switches.result[i].Favorite == 1) {
      menu.item(q, m, { title: switches.result[i].Name, idx: switches.result[i].idx, type: 'Switch'});
      m++;
     }} else {
      menu.item(q, m, { title: switches.result[i].Name, idx: switches.result[i].idx, type: 'Switch'});
      m++;
    } } 
     q++;
  }
//utilities
if(showutilities == '1')
  {
   if(q=='0') { q = '0';}
  for(var i=0,m=0; i<utilities.result.length; i++) {
    if(showfavorites == '1'){ if(utilities.result[i].Favorite == 1){
      menu.item(q, m, { title: utilities.result[i].Name, idx: utilities.result[i].idx, type: 'Utility', status: utilities.result[i].CounterToday });
      m++;
    }} else {
      menu.item(q, m, { title: utilities.result[i].Name, idx: utilities.result[i].idx, type: 'Utility', status: utilities.result[i].CounterToday });
      m++;
    }}
    q++;
  }
//Temperature
if(showtemperature == '1')
  {
     if(q=='0') { q = '0';}
     for(var i=0,m=0; i<temperature.result.length; i++) {
       if(showfavorites == '1'){ if(temperature.result[i].Favorite == 1){
         menu.item(q, m, { title: temperature.result[i].Name, idx :temperature.result[i].idx, type: 'Temp', status: temperature.result[i].Temp});
         m++;
    }} else {
        menu.item(q, m, { title: utilities.result[i].Name, idx: utilities.result[i].idx, type: 'Utility', status: utilities.result[i].CounterToday });
        m++;
    }}
    q++;
  }
//weather
if(showweather == '1')
  {
     if(q=='0') { q = '0';}
    for(var i=0,m=0; i<weather.result.length; i++) {
    if(showfavorites == '1'){ if(weather.result[i].Favorite == 1){
      menu.item(q, m, { title: weather.result[i].Name, idx: weather.result[i].idx, type: 'Weather', status: weather.result[i].Data});
      m++;
    }} else {
      menu.item(q, m, { title: weather.result[i].Name, idx: weather.result[i].idx, type: 'Weather', status: weather.result[i].Data});
      m++;
    }}
    q++;
  }

menu.on('select', function(e) {
  var device = '';
  var idx = '';
  if(e.item.Type =="Group") {
    device = domoticz.getScene(e.item.idx);
    idx = e.item.idx;
} else {
  
 device = domoticz.getDevice(e.item.idx);
 idx = e.item.idx;
}
menu.on('longSelect', function(e) {
  device = domoticz.getDevice(e.item.idx);
  idx = e.item.idx;
  domoticz.toggleDevice2(idx);
});

var bodyvalue = ''; 
if(device.result[0].Type == "P1 Smart Meter")
{
  var Usage = '';
  var Unit = '';
  if(device.result[0].SubType == "Gas") { Unit = ' m3';}
  
  if(device.result[0].SubType == "Energy") { Unit = ' kWh'; Usage = '\nCurrent:\n' + device.result[0].Usage;} 
  bodyvalue =  'Today:\n' + device.result[0].CounterToday + Usage +'\nTotal:\n' + device.result[0].Counter + Unit;
} else if(device.result[0].Type == "Temp + Humidity + Baro")
  {
    var data = device.result[0].Data.split(", ");
    bodyvalue = 'Temp:\n' + data[0] + '\nHumidity\n' + data[1] + '\nBaro:\n' + data[2];  
  }
  else if(device.result[0].Type == "Wind")
  {
    bodyvalue = 'Direction:\n' + device.result[0].DirectionStr + '\nSpeed:\n' + device.result[0].Speed + device.WindSign + '\nGust:\n' + device.result[0].Gust + device.WindSign;
  }
  else if(device.result[0].Type == "UV")
  {
    bodyvalue = 'UV:\n' + device.result[0].Data;   
  } 
  else if(device.result[0].Type == "Rain")
  {
    bodyvalue = 'Rain:\n' + device.result[0].Rain + ' mm\nRate:\n' + device.result[0].RainRate + ' mm';
  } 
  else if(device.result[0].Type == "General")
  {
    var visibility = '';
    if(device.result[0].SubType == "Visibility"){ visibility = 'Visibility:\n'; } else { visibility = '' ;}
  bodyvalue = visibility + device.result[0].Data;
  } 
  else if(device.result[0].Type == "Temp")
  {
    bodyvalue = 'Temp:\n' + device.result[0].Data;
  } 
  else {
  bodyvalue = device.result[0].Status;
}
var card = new UI.Card({
  scrollable: true,
  style: 'large',
  title: device.result[0].Name,
  body: bodyvalue
                       });

  card.on('click', function(e) {
  card.body(domoticz.toggleDevice(idx));
});

card.show();
});

splashScreen.hide();
menu.show();
