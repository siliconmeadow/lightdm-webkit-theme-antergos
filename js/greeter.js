var DEBUG = true;
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
        var tux = 'img/antergos-logo-user.png';
		var imageSrc = user.image.length > 0 ? user.image : tux;
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

    var twelveHr= [
            'sq-AL.UTF-8',
            'zh-CN.UTF-8',
            'zh-TW.UTF-8',
            'en-AU.UTF-8',
            'en-BZ.UTF-8',
            'en-CA.UTF-8',
            'en-CB.UTF-8',
            'en-JM.UTF-8',
            'en-NG.UTF-8',
            'en-NZ.UTF-8',
            'en-PH.UTF-8',
            'en-US.UTF-8',
            'en-TT.UTF-8',
            'en-ZW.UTF-8',
            'es-US.UTF-8',
            'es-MX.UTF-8'];
var userLang = navigator.language || navigator.userLanguage;
var a = twelveHr.indexOf(userLang) ;

    var hh = date.getHours();
    var mm = date.getMinutes();
    var ss = date.getSeconds();
    var suffix= "AM";
    if (hh > 12) {
    	if(a !== -1){
    		hh = hh - 12;
    	}
        suffix= "PM";
    }
    if (mm < 10) {mm = "0"+mm;}
    if (ss < 10) {ss = "0"+ss;}
    if ((hh === 0)&& (a !== -1)) {hh = "12";}
    time.innerHTML = hh + ":" + mm + " " + suffix;
}

function initialize_timer() {
    update_time();
    setInterval(update_time, 1000);
}

function addActionLink(id) {
	if (eval("lightdm.can_" + id)) {
		var label = id.substr(0,1).toUpperCase() + id.substr(1,id.length-1);
        var id2;
        if (id == "shutdown") {id2 = "power-off"}
        if (id == "hibernate") {id2 = "asterisk"}
        if (id == "suspend") {id2 = "arrow-down"}
        if (id == "restart") {id2 = "refresh"}
		$("#actionsArea").append('\n<button type="button" class="btn btn-default ' + id + '" title="' + label + '" onclick="handleAction(\'' + id + '\')"><i class="fa fa-' + id2 + '"></i></button>');
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
	source.src = 'img/antergos-logo-user.png';
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
