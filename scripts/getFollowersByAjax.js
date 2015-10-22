function getFollowersByAjax(followersOwner){
    var limit = 5;
    var httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState == 4 && httpRequest.status == 200) {
            if(httpRequest.response.length != 2) {
                var parsedData = JSON.parse(httpRequest.response);
                attachFollowers(parsedData);
                getFollowersByAjaxClicks += 1;
            }
        }
    };
    httpRequest.open("GET", "/getAjaxUserFollowers?offset="+limit*getFollowersByAjaxClicks+"&owner="+followersOwner+"&limit="+limit,true);
    httpRequest.send();
}

function attachFollowers(parsedData){
    for (var i=0;i<parsedData.length;i++){
        var followerP = document.createElement('p');
        //eventDiv.className = "panel panel-success";
    //<a href="url">link text</a>
        followerP.innerHTML ='<a href=http://192.168.100.6/id'+parsedData[i].user_id+'>'+parsedData[i].surname+' '+parsedData[i].name+'</a>';
        /*+
            '<div class="panel-heading">'+parsedData[i].name+'</div>'+
            '<div class="panel-body">'+parsedData[i].description+'</div>'+
            '<button type="button" class="btn btn-warning btn-sm" data-toggle="modal" data-target="#event'+parsedData[i].event_id+'">Open</button> '+
            '<button type="button" class="btn btn-warning btn-sm">Edit</button> '+
            '<button type="button" class="btn btn-warning btn-sm">Delete</button>'+
            '<div class="modal fade" id="event'+parsedData[i].event_id+'" role="dialog">'+
            '<div class="modal-dialog" style="position: absolute;top: 25%;left: 50%;margin-left: -200px;">'+
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
            '</div>';*/
        document.getElementById('followersModalBody').appendChild(followerP);
        //var hr = document.createElement('hr');
        //document.getElementById('followersModalBody').appendChild(hr);
    }
}