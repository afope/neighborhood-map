(function () {
   'use strict';
   // this function is strict...
}());

// declaring global variables
var map;
var google;
var ko;

// declaring app data
var locations = [{
    name:"Park Ave Penthouse",
    lat: 40.7713024,
    lng: -73.9632393,
    address: "432 Park Ave, New York, NY 10022, USA",
    category: "park ave"
}, {
    name: "Chelsea Loft",
    lat: 40.7444883,
    lng: -73.9949465,
    address: "450 W 17th St Ninth and Tenth Avenue",
    category: "chelsea"
}, {
    name: "Union Square Open Floor Plan",
    lat: 40.7347062,
    lng: -73.9895759,
    address: "Management Suite, 12 First Level Mall",
    category: "union square"
}, {
    name: "East Village Hip Studio",
    lat: 40.7281777,
    lng: -73.984377,
    address: "27 2nd Ave, New York, NY 10003, USA",
    category: "east village"
}, {
    name: "TriBeCa Artsy Bachelor Pad",
    lat: 40.7195264,
    lng: -74.0089934,
    address: "51 Long street, Tribeca",
    category: "tribeca"
}, {
    name: "Chinatown Homey Space",
    lat: 40.7180628,
    lng: -73.9961237,
    address: "Broome Street, New York",
    category: "chinatown"
}];

// create a styles array to use with the map.
var styles = [
  {
    featureType: "water",
    stylers: [
      { color: "#19a0d8" }
    ]
  },{
    featureType: "administrative",
    elementType: "labels.text.stroke",
    stylers: [
      { color: "#ffffff" },
      { weight: 6 }
    ]
  },{
    featureType: "administrative",
    elementType: "labels.text.fill",
    stylers: [
      { color: "#e85113" }
    ]
  },{
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [
      { color: "#efe9e4" },
      { lightness: -40 }
    ]
  },{
    featureType: "transit.station",
    stylers: [
      { weight: 9 },
      { hue: "#e85113" }
    ]
  },{
    featureType: "road.highway",
    elementType: "labels.icon",
    stylers: [
      { visibility: "off" }
    ]
  },{
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [
      { lightness: 100 }
    ]
  },{
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [
      { lightness: -100 }
    ]
  },{
    featureType: "poi",
    elementType: "geometry",
    stylers: [
      { visibility: "on" },
      { color: "#f0e4d3" }
    ]
  },{
    featureType: "road.highway",
    elementType: "geometry.fill",
    stylers: [
      { color: "#efe9e4" },
      { lightness: -25 }
    ]
  }
];


// the main view model for entire app
function AppViewModel() {
    var self = this;

    this.locationArray = ko.observableArray([]);
    this.searchItem = ko.observable("");
    this.wikiArray = ko.observableArray([]);
    this.wikiError  = ko.observable("");

    //creates a function that holds the data
    var Location = function(data) {
        var self = this;

        this.name = data.name;
        this.lat = data.lat;
        this.lng = data.lng;
        this.address = data.address;
        this.details = data.details;
        this.category = data.category;
        this.url = "";

        this.visible = ko.observable(true);

        self.string = '<div class="info-window-content"><div class="title"><b>' + self.name + "</b></div>" +
            '<div class="address">' + self.address + "</div>" +
            '<div class="details">' + self.category + "</div></div></div>";


        //creates infowindow
        this.infoWindow = new google.maps.InfoWindow({
            content: self.string
        });


        //creates the marker
        this.marker = new google.maps.Marker({
            position: new google.maps.LatLng(data.lat, data.lng),
            map: map,
            title: data.name,
            styles: styles
        });

        this.showMarker = ko.computed(function() {
            if (this.visible() === true) {
                this.marker.setMap(map);
            } else {
                this.marker.setMap(null);
            }
            return true;
        }, this);

        this.marker.addListener("click", function() {


        this.string = '<div class="info-window-content"><div class="title"><b>' + self.name + "</b></div>" +
                    '<div class="address">' + self.address + "</div>" + '<div class="address">' + self.address + "</div>" + '<div class="details">' + self.category + "</div></div>";

            loadWikiData(self.category);

            self.infoWindow.setContent(self.string);

            self.infoWindow.open(map, this);

            self.marker.setAnimation(google.maps.Animation.BOUNCE);


            setTimeout(function() {
                self.marker.setAnimation(null);
            }, 2100);
        });

        this.bounce = function(space) {
            google.maps.event.trigger(self.marker, "click");
        };
    };

    // load wikipedia data
    function loadWikiData (name) {
        var encodedName = encodeURIComponent(name);
        var wikiUrl = "http://en.wikipedia.org/w/api.php?action=opensearch&search=" + encodedName + "&format=json&callback=wikiCallback";

        self.wikiArray.removeAll();

        const request = $.ajax({
          url: wikiUrl,
          dataType: "jsonp",
        });

        const onSuccess = (response) => {
          var articleList = response[1];

          articleList.forEach(function(articleStr) {
              var url = "http://wikipedia.org/wiki/" + articleStr;
              self.wikiArray.push({url: url, article: articleStr});
          });
        };

        const onError = (error) => {
          console.log("error in ajax call to wikipedia's api");
          alert( "Wiki articles not loading, please try again!");
        };

        request.fail(onError);
        request.done(onSuccess);
      }


    // show google maps
    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 13,
        center: {lat: 40.7413549, lng: -73.9980244},
        styles: styles
    });

    locations.forEach(function(locationItem) {
        self.locationArray.push(new Location(locationItem));
    });

    this.finalList = ko.computed(function() {
        var filter = this.searchItem().toLowerCase();
        if (!filter) {
            this.locationArray().forEach(function(locationItem) {
                locationItem.visible(true);
            });
            return this.locationArray();
        } else {
            return ko.utils.arrayFilter(this.locationArray(), function(locationItem) {
                var string = locationItem.name.toLowerCase();
                var result = (string.search(filter) >= 0);
                locationItem.visible(result);
                return result;
            });
        }
    }, self);

}

//to run the entire app
function initApp() {
    ko.applyBindings(new AppViewModel());
}
