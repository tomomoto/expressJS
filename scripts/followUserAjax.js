function followUserAjax(personToSubscribeId) {
    var xHttp = new XMLHttpRequest();
    xHttp.onreadystatechange = function() {
        if (xHttp.readyState == 4 && xHttp.status == 200) {
            if(xHttp.response.length != 2 && xHttp.response=='true') {
                var subscribeBtnHandler = document.getElementById('SubscribeBTN');
                subscribeBtnHandler.innerHTML  = '<span class="fa fa-check-square-o"></span> Subscribed';
                subscribeBtnHandler.setAttribute( "onClick", "UnFollowUserAjax("+personToSubscribeId+")");
            }
        }
    };
    xHttp.open("POST", "/follow", true);
    xHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xHttp.send("user_id="+personToSubscribeId);
}

function UnFollowUserAjax(personToUnSubscribeId) {
    var xHttp = new XMLHttpRequest();
    xHttp.onreadystatechange = function() {
        if (xHttp.readyState == 4 && xHttp.status == 200) {
            if(xHttp.response.length != 2 && xHttp.response=='true') {
                var subscribeBtnHandler = document.getElementById('SubscribeBTN');
                subscribeBtnHandler.innerHTML  = '<span class="fa fa-street-view"></span> Subscribe';
                subscribeBtnHandler.setAttribute( "onClick", "followUserAjax("+personToUnSubscribeId+")");
            }
        }
    };
    xHttp.open("DELETE", "/follow", true);
    xHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xHttp.send("user_id="+personToUnSubscribeId);
}