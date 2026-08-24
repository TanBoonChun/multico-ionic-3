/*var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

//var W = canvas.width = window.innerWidth;
//var H = canvas.height = window.innerHeight;

var TO_RADIANS = Math.PI / 180;

var img = new Image();
img.src = 'http://modelgayarambut.com/wp-content/uploads/2014/07/Model-rambut-sedang.jpg';

ctx.save();
ctx.translate(0, 0);

var half_width = img.width / 2;
var half_height = img.height / 2;

ctx.translate(half_width, half_height);
//ctx.scale(1,1);
ctx.rotate(90 * Math.PI / 180);
ctx.drawImage(img, -half_width, -half_height);
ctx.restore();*/

angular.module('ionicApp', ['ionic'])

.factory('ClockSrv', function($interval) {
  'use strict';
  var service = {
    clock: addClock,
    cancelClock: removeClock
  };

  var clockElts = [];
  var clockTimer = null;
  var cpt = 0;

  function addClock(fn) {
    var elt = {
      id: cpt++,
      fn: fn
    };
    clockElts.push(elt);
    if (clockElts.length === 1) {
      startClock();
    }
    return elt.id;
  }

  function removeClock(id) {
    for (var i in clockElts) {
      if (clockElts[i].id === id) {
        clockElts.splice(i, 1);
      }
    }
    if (clockElts.length === 0) {
      stopClock();
    }
  }

  function startClock() {
    if (clockTimer === null) {
      clockTimer = $interval(function() {
        for (var i in clockElts) {
          clockElts[i].fn();
        }
      }, 1000);
    }
  }

  function stopClock() {
    if (clockTimer !== null) {
      $interval.cancel(clockTimer);
      clockTimer = null;
    }
  }

  return service;
})

.run(function($rootScope, $filter, ClockSrv) {
  ClockSrv.clock(function() {
    // console.log($filter('date')(Date.now(), 'yyyy-MM-dd HH:mm:ss')); 
    $rootScope.clock = $filter('date')(Date.now(), 'dd/MM/yyyy HH:mm:ss');
  });
                 
})

.controller('MyCtrl', function($scope, $timeout, $filter, ClockSrv) {
  $scope.myTitle = 'Clock';
  // $scope.clock = ClockSrv.clock();

  /*$scope.data = {
    tgl: "Memuat jam..."
  }
  var tickInterval = 1000; //ms

  var tick = function() {
    $scope.data.tgl = $filter('date')(Date.now(), 'yyyy-MM-dd HH:mm:ss'); // get the current time
    $timeout(tick, tickInterval); // reset the timer
  }

  // Start the timer
  $timeout(tick, tickInterval);*/

});