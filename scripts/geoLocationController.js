function still_broken() {
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
}