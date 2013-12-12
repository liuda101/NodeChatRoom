function divEscapedContentElement(message, cls){
	return $('<div class="' + cls + '"></div>').text(message);
}

function divSystemContentElement(message, cls){
	return $('<div class="' + cls + '"></div>').html('<i>' + message + '</i>');
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
		$('#messages').append(divEscapedContentElement(message, 'mine'));
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
	var newElement = $('<div class="others"></div>').text(message.text);
	$('#messages').append(newElement);
	$('#messages').scrollTop($('#messages').prop('scrollHeight'));
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