function fetchNavigationBar(user_id, doToActiveMenuElementId){
    var navBarContainerHTML = document.createElement('div');
    navBarContainerHTML.className = "container-fluid";
    var navBarContainerString =
        '<div class="navbar-header">'+
            '<button type="button" class="navbar-toggle" data-toggle="collapse" data-target="#myNavbar">'+
                '<span class="icon-bar"></span>'+
                '<span class="icon-bar"></span>'+
                '<span class="icon-bar"></span>'+
            '</button>'+
        '<a class="navbar-brand" href="/">Eventer</a>'+
        '</div>'+
            '<div class="collapse navbar-collapse" id="myNavbar">'+
                '<ul class="nav navbar-nav">'+
                    '<li id="menuHome"><a href="/">Home</a></li>'+
                    '<li id="menuEvents" class="dropdown">'+
                    '<a class="dropdown-toggle" data-toggle="dropdown" href="#">Events <span class="caret"></span></a>'+
                        '<ul class="dropdown-menu">'+
                            '<li id="menuCreated"><a href="/events">Created</a></li>'+
                            '<li id="menuNewEvent"><a href="/newEvent">New event</a></li>'+
                            '<li><a href="#">Page 1-3</a></li>'+
                        '</ul>'+
                    '</li>'+
                    '<li><a href="/">Bar</a></li>'+
                    '<li><a href="/events">foo</a></li>'+
                '</ul>'+
                '<ul class="nav navbar-nav navbar-right">';
                if (user_id > 0) {
                    navBarContainerString+=
                        '<li><a href="/"><span class="glyphicon glyphicon-user"></span>'+'id'+user_id+'</a></li>' +
                        '<li><a href="/logout"><span class="glyphicon glyphicon-log-in"></span> Logout</a></li>';
                }
                else {
                    navBarContainerString+='<li><a href="/join"><span class="glyphicon glyphicon-user"></span> Sign Up</a></li>'+
                        '<li><a href="/login"><span class="glyphicon glyphicon-log-in"></span> Login</a></li>';
                }
    navBarContainerString+=
        '</ul>'+
        '</div>';
    navBarContainerHTML.innerHTML=navBarContainerString;
    document.getElementById('navBar').appendChild(navBarContainerHTML);
    if (doToActiveMenuElementId){
        var MenuElementById = document.getElementById(doToActiveMenuElementId);
        MenuElementById.className+=" active";
    }
}