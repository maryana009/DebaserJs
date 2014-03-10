
var itemList = [],
    artistIndex,
    appVersion = "",
    appAuthor = "",
    appDescription = "Official Debaser app. To make a hybrid native.";

var DateItem = function (fromDate, toDate) {
    this.fromDate = fromDate;
    this.toDate = toDate;
};

function setloadRange(daysToLoad) {
    var date = new Date(); //current date
    var fromDate = new Date(date); //from date
    date.setDate(date.getDate() + daysToLoad); //To date
    var toDate = new Date(date);
    var dateItem = new DateItem(fromDate, toDate);
    return dateItem;
};

function updateLoadRange(lastDate, dateSpan) {
    var date = new Date(lastDate);
    date.setDate(date.getDate() + 1);
    var fromDate = new Date(date);
    date.setDate(date.getDate() + dateSpan); //Add index
    var toDate = new Date(date);
    var dateItem = new DateItem(fromDate, toDate);
    return dateItem;
}

function getDetailsFromIndex(index) {
    this.artistIndex = index;
    return itemList[index];
}

function getDate(date) {
    var temp = date;
    var dateStr = padStr(temp.getFullYear()) +
        padStr(1 + temp.getMonth()) +
        padStr(temp.getDate());
    return dateStr;
}

function padStr(i) {
    return (i < 10) ? "0" + i : "" + i;
}

function prettify(json) {
    var temp = JSON.stringify(json);
    temp = temp.replace(/&amp;/g, '&');
    temp = temp.replace(/&nbsp;/g, ' ');
    temp = temp.replace(/&quot;/g, '\"');
    temp = temp.replace(/<(?:.|\n)*?>/gm, '');
    return JSON.parse(temp);
}

function setColor(color) {
    changecss('.itemDate', 'color', color);
    changecss('.itemVenue', 'color', color);
}

function setBackground(color) {
    changecss('body', 'background-color', color);
    if (color == 'black')
        changecss('body', 'color', 'white');
    else
        changecss('body', 'color', 'black');
}

function navToAboutView(version, author) {
    this.appVersion = version;
    this.appAuthor = author;

    var scope = angular.element(['body']).scope(); //Get current scope
    scope.$apply(function () { //Update angular to run fn
        scope.$$childHead.navigate();
    });

    /*This is not currently redirecting
    var $injector = angular.element(['body']).injector(); //Get the applicatons injector
    var $location = $injector.get('$location'); //Extract the location object
    $location.path('about'); //Redirect
    */
}

function getJSObject(option) {
    var artist, param = "", homepagelink = "", ticketlink = "";
    switch (option) {
        case "main":
            param = "main";
            this.artistIndex = -1;
            break;
        case "detail":
            param = "detail";
            break;
        case "about":
            param = "about";
            this.artistIndex = -1;
            break;
    }
    if (this.artistIndex != -1) {
        artist = itemList[this.artistIndex];
        homepagelink = artist.EventUrl;
        ticketlink = artist.TicketUrl;
    } else {
        homepagelink = "";
        ticketlink = "";
    }
    window.external.notify(param + "," + homepagelink + "," + ticketlink);
}

(function () {
    "use strict";

    //App setup
    var app = angular.module('debaserApp', ['infinite-scroll', 'appCtrls', 'ngRoute']);

    //Controller setup in controller.js

    //Route setup
    app.config(['$routeProvider',
        function ($routeProvider) {
            $routeProvider.when('/', {
                templateUrl: 'partials/listview.html',
                controller: 'ListCtrl'
            }).when('/detail/:index', {
                templateUrl: 'partials/detailview.html',
                controller: 'DetailCtrl'
            }).when('/about', {
                templateUrl: 'partials/aboutview.html',
                controller: 'AboutCtrl'
            }).otherwise({
                redirectTo: '/'
            });
        }]);

    app.factory('AboutView', function () {
        var AboutView = function () {
            this.version = appVersion;
            this.description = appDescription;
            this.author = appAuthor;
        };
        return AboutView;
    });

    app.factory('DetailItem', function () {
        var DetailItem = function (index) {
            this.item = getDetailsFromIndex(index);
        };
        return DetailItem;
    });

    app.factory('LazyList', function ($http) {
        var LazyList = function () {
            this.list = [];
            this.busy = true;
            this.dateSpanToLoad = 14;
            this.dateRange = setloadRange(this.dateSpanToLoad);
            this.toDate = this.dateRange.toDate;
            this.loadInitData(this);
        };


        LazyList.prototype.loadInitData = function () {

            var url = "http://debaser.se/debaser/api/?method=getevents&from=" + getDate(this.dateRange.fromDate) + "&to=" + getDate(this.dateRange.toDate) + "&format=json&callback=JSON_CALLBACK";

            $http.jsonp(url).success(function (data) {
                data = prettify(data);
                for (var d in data) {
                    this.list.push(data[d]);
                }
                this.busy = false;
                itemList = this.list; //persist list
            }.bind(this)); //Context which fn should be evaluated in, in this case lazylist.
        };

        LazyList.prototype.loadMoreItems = function () {
            if (this.busy) return;
            this.busy = true;

            //Update dateSpan
            this.dateRange = updateLoadRange(this.toDate, this.dateSpanToLoad);
            this.toDate = this.dateRange.toDate;

            var url = "http://debaser.se/debaser/api/?method=getevents&from=" + getDate(this.dateRange.fromDate) + "&to=" + getDate(this.dateRange.toDate) + "&format=json&callback=JSON_CALLBACK";

            $http.jsonp(url).success(function (data) {
                data = prettify(data);
                for (var d in data) {
                    this.list.push(data[d]);
                }
                this.busy = false;
            }.bind(this))
                .error(function () {
                    this.busy = false;
                    if (this.dateSpanToLoad < 365) {
                        this.dateSpanToLoad = 365;
                        this.loadMoreItems();
                    }
                }.bind(this)); //Context which fn should be evaluated in, in this case lazylist.
        };
        return LazyList;
    });
})();
