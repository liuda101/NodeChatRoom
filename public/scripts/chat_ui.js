function divEscapedContentElement(message, cls){
	return $('<div class="' + cls + '"></div>').text(message);
}

function divSystemContentElement(message, cls){
	return $('<div class="' + cls + '"></div>').html('<i>' + message + '</i>');
}

function isChrome(){
	var a = navigator.userAgent.toLowerCase(), b = navigator.appVersion.toLowerCase(), c = -1 < a.indexOf("applewebkit"), b = c ? -1 != b.indexOf("qqbrowser") ? 1 : 0 : 0;
	return c && !b && -1 < a.indexOf("chrome") && 0 > a.indexOf("se 2.x metasr 1.0")
}


$('#openNotification').click(function(){
	if(isChrome()){
		var notificationCenter = window.webkitNotifications;
		if(notificationCenter.checkPermission() == 1){
			notificationCenter.requestPermission(function(){
			});
		}
	}
});

function generateNotification(obj){
	if(isChrome()){
		var notificationCenter = window.webkitNotifications;
		if(notificationCenter.checkPermission() == 0){
			var notification = notificationCenter.createNotification('/images/notificationIcon.png', obj.title, obj.content);
			if(notification){
				notification.show();
				setTimeout(function(){
					notification.close();
				},3 * 1000);
			}
		}
	}
}

// !
function parseMessage(tag){
	if(tag){
		if(tag.indexOf('!') == 0){
			return '<img src="' + tag.substring(1) + '" />';
		} else {
			return tag;
		}
	} else {
		return '';
	}
}

function processUserInput(chatApp, socket){
	var message = $('#send-message').val();
	var systemMessage;
	if(message.charAt(0) == '/'){
		systemMessage = chatApp.processCommand(message);
		if(systemMessage){
			$('#messages').append(divSystemContentElement(systemMessage, 'sys'));
		}
	} else {
		chatApp.sendMessage($('#room').text(), message);
	}

	$('#messages').scrollTop($('#messages').prop('scrollHeight'));

	$('#send-message').val('');
}

var socket = io.connect();
var chatApp = new Chat(socket);

socket.on('nameResult', function(result){
	var message;
	if(result.success){
		message = 'You are now known as ' + result.name + '.';
	} else {
		message = result.message;
	}

	$('#messages').append(divSystemContentElement(message, 'sys'));
	$('#messages').scrollTop($('#messages').prop('scrollHeight'));
});

socket.on('joinResult', function(result){
	$('#room').text(result.room);
	$('#messages').append(divSystemContentElement('Room changed.', 'sys'));
	$('#messages').scrollTop($('#messages').prop('scrollHeight'));
});

socket.on('message', function(message){
	console.log(message);
	switch(message.type){
		case 1:
			var newElement = $('<div class="others"></div>').text(message.text);
			$('#messages').append(newElement);
			$('#messages').scrollTop($('#messages').prop('scrollHeight'));
		break;
		case 2:
			var newElement = $('<div class="others"></div>').text(message.nickname + ':' + parseMessage(message.message));
			$('#messages').append(newElement);
			$('#messages').scrollTop($('#messages').prop('scrollHeight'));
			generateNotification({
				title: message.nickname,
				content: message.message
			});
		break;
		case 3:
			var newElement = $('<div class="image"></div>').html(message.nickname + ':' + message.imgElement);
			$('#messages').append(newElement);
			$('#messages').scrollTop($('#messages').prop('scrollHeight'));
		break;
		case 4:
			var cls = message.cls;
			$('#messages').addClass(cls);
			setTimeout(function(){
				$('#messages').removeClass(cls);
			},500);
		break;
	}
});

socket.on('rooms', function(rooms){
	$('#room-list').empty();

	for(var room in rooms){
		room = room.substring(1, room.length);
		if(room != ''){
			$('#room-list').append(divEscapedContentElement(room));
		}
	}
});

setInterval(function(){
	socket.emit('rooms');
}, 1000);

$('#send-form').submit(function(){
	processUserInput(chatApp, socket);
	return false;
});