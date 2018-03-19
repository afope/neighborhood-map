'use strict';

// declaring global variables
var map;

var locations = [{
    name:'Park Ave Penthouse',
    lat: 40.7713024,
    lng: -73.9632393,
    address: "432 Park Ave, New York, NY 10022, USA",
    details: "luxury condominium building is the tallest residential tower in the hemisphere. Immediate occupancy.",
    category: "park ave"
}, {
    name: 'Chelsea Loft',
    lat: 40.7444883,
    lng: -73.9949465,
    address: "450 W 17th St Ninth and Tenth Avenue",
    details: "Set in the Chelsea neighborhood, this air-conditioned apartment is 700 metres from Empire State Building",
    category: "chelsea"
}, {
    name: 'Union Square Open Floor Plan',
    lat: 40.7347062,
    lng: -73.9895759,
    address: "Management Suite, 12 First Level Mall, Union Square, Guild Square, Aberdeen AB11 5RG",
    details: "designed with comfort and convenience in mind, providing plenty of space to unwind, catch up on work or socialize",
    category: "union square"
}, {
    name: 'East Village Hip Studio',
    lat: 40.7281777,
    lng: -73.984377,
    address: "27 2nd Ave, New York, NY 10003, USA",
    details: "Boasting an inexhaustible grid of galleries, bookshops, cafes, and nightlife, the East Village is a laid-back haven in the center of New York City",
    category: "east village"
}, {
    name: 'TriBeCa Artsy Bachelor Pad',
    lat: 40.7195264,
    lng: -74.0089934,
    address: "51 Long street, Tribeca",
    details: "Perfect combo of sleek and artsy",
    category: "tribeca"
}, {
    name: 'Chinatown Homey Space',
    lat: 40.7180628,
    lng: -73.9961237,
    address: "Broome Street, New York",
    details: "the perfect homey space in china town for you",
    category: "chinatown"
}];

// create a styles array to use with the map.
var styles = [
  {
    featureType: 'water',
    stylers: [
      { color: '#19a0d8' }
    ]
  },{
    featureType: 'administrative',
    elementType: 'labels.text.stroke',
    stylers: [
      { color: '#ffffff' },
      { weight: 6 }
    ]
  },{
    featureType: 'administrative',
    elementType: 'labels.text.fill',
    stylers: [
      { color: '#e85113' }
    ]
  },{
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [
      { color: '#efe9e4' },
      { lightness: -40 }
    ]
  },{
    featureType: 'transit.station',
    stylers: [
      { weight: 9 },
      { hue: '#e85113' }
    ]
  },{
    featureType: 'road.highway',
    elementType: 'labels.icon',
    stylers: [
      { visibility: 'off' }
    ]
  },{
    featureType: 'water',
    elementType: 'labels.text.stroke',
    stylers: [
      { lightness: 100 }
    ]
  },{
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [
      { lightness: -100 }
    ]
  },{
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [
      { visibility: 'on' },
      { color: '#f0e4d3' }
    ]
  },{
    featureType: 'road.highway',
    elementType: 'geometry.fill',
    stylers: [
      { color: '#efe9e4' },
      { lightness: -25 }
    ]
  }
];

function AppViewModel() {
    var self = this;

    this.locationArray = ko.observableArray([]);
    this.searchItem = ko.observable("");
    this.wikiArray = ko.observableArray([]);
    this.wikiError  = ko.observable("");

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
            '<div class="details">' + self.details + "</div></div></div>";

        this.infoWindow = new google.maps.InfoWindow({
            content: self.string
        });

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

        this.marker.addListener('click', function() {


      	this.string = '<div class="info-window-content"><div class="title"><b>' + self.name + "</b></div>" +
              '<div class="address">' + self.address + "</div>" + '<div class="address">' + self.address + "</div>" + '<div class="details">' + self.details + "</div></div>";

            loadWikiData(self.category);

            self.infoWindow.setContent(self.string);

            self.infoWindow.open(map, this);

            self.marker.setAnimation(google.maps.Animation.BOUNCE);


            setTimeout(function() {
                self.marker.setAnimation(null);
            }, 2100);
        });

        this.bounce = function(space) {
            google.maps.event.trigger(self.marker, 'click');
        };
    };

    // load wikipedia data
    function loadWikiData (name) {
        console.log(name);
        var encodedName = encodeURIComponent(name);
        var wikiUrl = 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' + encodedName + '&format=json&callback=wikiCallback';
        console.log(wikiUrl);
        self.wikiArray.removeAll();

        var wikiRequestTimeout = setTimeout(function() {
          self.wikiError("failed to get Wikipedia resources");
        },8000);

        $.ajax({
          url: wikiUrl,
          dataType: "jsonp",
          success: function( response) {
            console.log(response, 'respose from wiki');
            var articleList = response[1];

            articleList.forEach(function(articleStr) {
                var url = 'http://wikipedia.org/wiki/' + articleStr;
                self.wikiArray.push({url: url, article: articleStr});
            });

            clearTimeout(wikiRequestTimeout);
          }
    });
    }


    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 13,
        center: {lat: 40.7413549, lng: -73.9980244},
        styles: styles
    });

    locations.forEach(function(locationItem) {
        self.locationArray.push(new Location(locationItem));
    });

    this.finalList = ko.computed(function() {
        console.log(this, 'this arg');
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

function initApp() {
    ko.applyBindings(new AppViewModel());
}

function mapError() {
    alert("Something happened :(. Please check your connection and try again.");
}
