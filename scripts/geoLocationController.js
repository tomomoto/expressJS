window.onload = function initializeWithGeoLocation() {
    var buttonHandler = document.getElementById("currentLocation");
   // window.onload = function () {
        if (!navigator.geolocation) buttonHandler.disabled = "disabled";
   // };
    var geoLocationDiv = document.getElementById("geoloc");
    buttonHandler.onclick = function getLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                geoLocationDiv.value = position.coords.latitude + " " + position.coords.longitude;
            });
        }
    };
    var buttonDateTodayHandler = document.getElementById("dateToday");
    buttonDateTodayHandler.onclick = function getDateToday() {
        var dateTimeDiv = document.getElementById("dateTime");
        var now = new Date();
        var year = now.getFullYear();
        var mounth = now.getMonth();
        var date = now.getDate();
        dateTimeDiv.value = (year.toString() + '-' + (mounth + 1).toString() + '-' + date.toString());
    };
};

/*function still_broken() {
 alert('Подключён, начинаю работу!');
 var buttonHandler = document.getElementById("currentLocation");
 window.onload = function () {
 if (!navigator.geolocation) buttonHandler.disabled = "disabled";
 };
 var geoLocationDiv = document.getElementById("geoloc");
 buttonHandler.onclick = function getLocation() {
 if (navigator.geolocation) {
 navigator.geolocation.getCurrentPosition(function (position) {
 geoLocationDiv.value = position.coords.latitude + " " + position.coords.longitude
 });
 }
 };
 }*/