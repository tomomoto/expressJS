function deleteEvent(event_id){
    var xHttp = new XMLHttpRequest();
    xHttp.onreadystatechange = function() {
        if (xHttp.readyState == 4 && xHttp.status == 200) {
            if(xHttp.response.length != 2 && xHttp.response=='true') {
                var element = document.getElementById("eventElement"+event_id);
                element.parentNode.removeChild(element);
            }
        }
    };
    xHttp.open("DELETE", "/event", true);
    xHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xHttp.send("event_id="+event_id, "user_id="+event_id);
}