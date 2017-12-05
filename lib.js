(function(window) {

  var hashCode = function(str) {
    var hash = 0;
    if (str.length == 0) {
      return hash;
    }
    for (var i = 0; i < str.length; i++) {
      char = str.charCodeAt(i);
      hash = ((hash<<5)-hash)+char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
  }

  var linkCSS = function(url) {
    var urlHash = 'css-' + hashCode(url);
    if (!document.getElementById(urlHash)) {
      var head = document.getElementsByTagName('head')[0];
      var link = document.createElement('link');
      link.id = urlHash;
      link.rel = 'stylesheet';
      link.type = 'text/css';
      link.href = url;
      link.media = 'all';
      head.appendChild(link);
    }
  }

  var queryYQL = function(query, cb) {
    var xhr = new XMLHttpRequest();
    xhr.addEventListener("load", function() {
      cb(this.response);
    });
    xhr.open("GET", "https://query.yahooapis.com/v1/public/yql?format=json&q=" + encodeURIComponent(query));
    xhr.responseType = 'json';
    xhr.send();
  }

  var createUpdater = function(inst) {
    var self = this
    self.curTimeoutID = null;
    var updater = function(nextUpdate) {
      self.curTimeoutID = setTimeout(function() {
        inst.update(updater);
      }, nextUpdate);
    }
    inst.update(updater);
    return function() {
      if (self.curTimeoutID !== null) {
        clearTimeout(self.curTimeoutID);
      }
    }
  }

  var yahooWeatherConditionClasses = {
    "0": "tornado",
    "1": "day-storm-showers",
    "2": "hurricane",
    "3": "thunderstorm",
    "4": "thunderstorm",
    "5": "rain-mix",
    "6": "rain-mix",
    "7": "rain-mix",
    "8": "hail",
    "9": "showers",
    "10": "hail",
    "11": "showers",
    "12": "showers",
    "13": "snow",
    "14": "day-snow",
    "15": "snow-wind",
    "16": "snow",
    "17": "hail",
    "18": "rain-mix",
    "19": "dust",
    "20": "fog",
    "21": "windy",
    "22": "smoke",
    "23": "strong-wind",
    "24": "strong-wind",
    "25": "snowflake-cold",
    "26": "cloudy",
    "27": "night-cloudy",
    "28": "day-cloudy",
    "29": "night-cloudy",
    "30": "day-cloudy",
    "31": "night-clear",
    "32": "day-sunny",
    "33": "night-partly-cloudy",
    "34": "day-sunny-overcast",
    "35": "rain-mix",
    "36": "hot",
    "37": "day-storm-showers",
    "38": "day-storm-showers",
    "39": "day-storm-showers",
    "40": "showers",
    "41": "snow-wind",
    "42": "snow",
    "43": "snow-wind",
    "44": "day-sunny-overcast",
    "45": "day-storm-showers",
    "46": "snow",
    "47": "day-storm-showers",
    "3200": "stars",
  };

  function getIconClass(conditionCode) {
    return 'wi wi-' + yahooWeatherConditionClasses[conditionCode];
  };

  var Widget = function(selectors, location, options) {
    this.containerElement = document.querySelector(selectors);
    this.location = location;
    linkCSS('https://cdnjs.cloudflare.com/ajax/libs/weather-icons/2.0.10/css/weather-icons.min.css');
    this.cancelUpdater = createUpdater(this);
  };

  Widget.prototype.update = function(cb) {
    var self = this;
    queryYQL('SELECT units.temperature, item.condition.temp, item.condition.code, ttl FROM weather.forecast WHERE woeid IN (SELECT woeid FROM geo.places(1) WHERE text="' + this.location + '")', function(response) {
      var channel = response.query.results.channel;
      var nextUpdate = parseInt(channel.ttl, 10) * 60 * 1000;
      var temp = channel.item.condition.temp;
      var conditionCode = channel.item.condition.code;
      var tempUnit = channel.units.temperature;
      self.render({
        temp: temp,
        tempUnit: tempUnit,
        conditionCode: conditionCode,
      });
      cb(nextUpdate);
    });
  }

  Widget.prototype.render = function(state) {
    var res = '';
    res += '<i class="' + getIconClass(state.conditionCode) + '"></i>';
    res += '<span class="micro-weather-temp">' + state.temp + '</span>';
    res += '<span class="micro-weather-degree">°</span>'
    res += '<span class="micro-weather-temp-unit">' + state.tempUnit + '</span>';
    this.containerElement.innerHTML = res;
  };

  Widget.prototype.remove = function() {
    this.containerElement.innerHTML = '';
    this.cancelUpdater();
  };

  window.MicroWeatherWidget = {
    create: function(selectors, location) {
      return new Widget(selectors, location);
    }
  };

})(window);
