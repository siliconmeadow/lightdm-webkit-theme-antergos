var DEBUG = false;
var selectedUser = null;

/**
 * UI Initialization.
 */
$(document).ready(function() {

    initialize_timer();
    get_hostname();
	// User list building
	var userList = document.getElementById('user-list');

	for (i in lightdm.users)
	{
		user = lightdm.users[i];
        var tux = [
            'img/tux/default.png',
            'img/tux/1.png',
            'img/tux/2.png',
            'img/tux/3.png',
            'img/tux/4.png',
            'img/tux/5.png',
            'img/tux/6.png'
        ];
		var imageSrc = user.image.length > 0 ? user.image : tux[i];
		var li = '<li id="' + user.name + '">' +
			'<a href="#' + user.name + '" onclick="startAuthentication(\'' + user.name + '\')">' +
			'<em><span>' + user.display_name + '</span></em>' + 
			'<img src="' + imageSrc + '" class="img-circle" alt="' + user.display_name + '" onerror="imgNotFound(this)"/> ' +
			'</a>' +
	   		'</li>';
		$(userList).append(li);
	}
	
	// Password key trigger registering
	$("#passwordField").keypress(function() {
		log("keypress(" + event.which + ")");
		if (event.which == 13) { // 'Enter' key
			submitPassword();
		}

	});
	$(document).keyup(function(e) {
		if (e.keyCode == 27) { // 'Escape' char
			cancelAuthentication();
		}
	});
	
	// Action buttons
	addActionLink("shutdown");
	addActionLink("hibernate");
	addActionLink("suspend");
	addActionLink("restart");

	// Logs ?
	if (DEBUG) {
		$("#logArea").show();
	}
});

function get_hostname() {
    var hostname = lightdm.hostname;
    var hostname_span = document.getElementById('hostname');
    $(hostname_span).append(hostname);
}

/**
 * Actions management.
 *
 *
 */

function update_time() {
    var time= document.getElementById("current_time");
    var date= new Date();

    var hh = date.getHours();
    var mm = date.getMinutes();
    var ss = date.getSeconds();
    var suffix= "AM";
    if (hh > 12) {
        hh= hh - 12;
        suffix= "PM";
    }
    if (mm < 10) {mm = "0"+mm;}
    if (ss < 10) {ss = "0"+ss;}
    time.innerHTML= hh+":"+mm + " " + suffix;
}

function initialize_timer() {
    update_time();
    setInterval(update_time, 1000);
}

function addActionLink(id) {
	if (eval("lightdm.can_" + id)) {
		var label = id.substr(0,1).toUpperCase() + id.substr(1,id.length-1); 
		$("#actionsArea").append('\n<button type="button" class="btn btn-default ' + id + '" title="' + label + '" onclick="handleAction(\'' + id + '\')"><i class="fa fa-' + id + '"></i></button>');
	}
}

function handleAction(id) {
	log("handleAction(" + id + ")");
	eval("lightdm." + id + "()");
}

function startAuthentication(userId) {
	log("startAuthentication(" + userId + ")");
	cancelAuthentication();
	selectedUser = userId;
	lightdm.start_authentication(selectedUser);
}

function cancelAuthentication() {
	log("cancelAuthentication()");
	$('#statusArea').hide();
	$('#timerArea').hide();
	if (selectedUser != null) {
		lightdm.cancel_authentication();
		log("authentication cancelled for " + selectedUser);
		selectedUser = null;
	}
	return true;
}

function submitPassword()
{
	log("provideSecret()");
	lightdm.provide_secret($('#passwordField').val());
	$('#passwordArea').hide();
	$('#timerArea').show();
	log("done");
}

/**
 * Image loading management.
 */

function imgNotFound(source){
	source.src = 'img/tux/default.png';
	source.onerror = "";
	return true;
}


/**
 * Lightdm Callbacks
 */
function show_prompt(text) {
	log("show_prompt(" + text + ")");
	$('#passwordField').val("");
	$('#passwordArea').show();
	$('#passwordField').focus();
}

function authentication_complete() {
	log("authentication_complete()");
	$('#timerArea').hide();
	if (lightdm.is_authenticated) {
		log("authenticated !");
		lightdm.login (lightdm.authentication_user, lightdm.default_session);
	}
	else {
		log("not authenticated !");
		$('#statusArea').show();
	}
}

/**
 * Logs.
 */
function log(text) {
	if (DEBUG) {
		$('#logArea').append(text);
		$('#logArea').append('<br/>');
	}
}
