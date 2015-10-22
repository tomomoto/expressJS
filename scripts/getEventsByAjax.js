function getEventsByAjax(eventOwner) {
    var limit = 5;
    var xHttp = new XMLHttpRequest();
    xHttp.onreadystatechange = function() {
        if (xHttp.readyState == 4 && xHttp.status == 200) {
            if(xHttp.response.length != 2) {
                var parsedData = JSON.parse(xHttp.response);
                attachEvents(parsedData);
                getEventsByAjaxClicks += 1;
            }
        }
    };
    xHttp.open("GET", "/getAjaxUserEvent?offset="+limit*getEventsByAjaxClicks+"&owner="+eventOwner+"&limit="+limit, true);
    xHttp.send();
}

function attachEvents(parsedData){
    for (var i=0;i<parsedData.length;i++){

    //<div class="container-fluent" id="eventElement<%=events[i].event_id%>">
        var eventDiv = document.createElement('div');
        eventDiv.className = "container-fluent";
        eventDiv.id = "eventElement"+parsedData[i].event_id;
    //var eventDiv = document.createElement('div');
    //    eventDiv.className = "panel panel-success";
        eventDiv.innerHTML =
            '<div class="panel panel-success">'+
                '<div class="panel-heading">'+parsedData[i].name+'</div>'+
                '<div class="panel-body">'+parsedData[i].description+'</div>'+
                //'<button type="button" class="btn btn-warning btn-sm" data-toggle="modal" data-target="#event'+parsedData[i].event_id+'">Open</button> '+
                //'<button type="button" class="btn btn-warning btn-sm">Edit</button> '+
                //'<button type="button" class="btn btn-warning btn-sm">Delete</button>'+
                '<div class="modal fade" id="event'+parsedData[i].event_id+'" role="dialog">'+
                    '<div class="modal-dialog">'+
                        '<div class="modal-content">'+
                            '<div class="modal-header">'+
                                '<button type="button" class="close" data-dismiss="modal">&times;</button>'+
                                '<h4 class="modal-title" align="center">'+parsedData[i].name+'</h4>'+
                            '</div>'+
                            '<div class="modal-body">'+
                                '<p>Description: '+parsedData[i].description+'</p>'+
                                '<p>Place: '+parsedData[i].place+'</p>'+
                                '<p>Date: '+parsedData[i].date+'</p>'+
                                '<p>Starting: '+parsedData[i].starting+'</p>'+
                                '<p>Ending: '+parsedData[i].ending+'</p>'+
                                '<p>Geo: '+parsedData[i].geo+'</p>'+
                            '</div>'+
                            '<div class="modal-footer">'+
                                '<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>'+
                            '</div>'+
                        '</div>'+
                    '</div>'+
                '</div>'+
            '</div>'+
        '<button type="button" class="btn btn-warning btn-sm" data-toggle="modal" data-target="#event'+parsedData[i].event_id+'">Open</button> '+
        '<button type="button" class="btn btn-warning btn-sm">Edit</button> '+
        '<button type="button" class="btn btn-warning btn-sm" onclick="deleteEvent('+parsedData[i].event_id+')">Delete</button><hr>';
        //'<button type="button" class="btn btn-warning btn-sm">Delete</button> <hr>';
        document.getElementById('eventContainer').appendChild(eventDiv);
        //var hr = document.createElement('hr');
        //document.getElementById('eventContainer').appendChild(hr);
    }
}
