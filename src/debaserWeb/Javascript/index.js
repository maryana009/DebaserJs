
//Objects
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
    var result = JSON.parse(temp);
    return result;
}

(function () {
    "use strict";

    //Init
    var app = angular.module('debaserApp', ['infinite-scroll'])
        .controller('ListCtrl', function ($scope, $http, LazyList) {
            $scope.lazyList = new LazyList();
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
