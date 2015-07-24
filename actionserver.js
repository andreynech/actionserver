var WebSocketServer = require('ws').Server
  , wss = new WebSocketServer({port: 8080});

// States and state transition table for simple
// forward-backward-stop sequence
var stop_state = new Object();
stop_state.id = 1;
stop_state.action = {};
stop_state.action.speed = 128;
stop_state.action.turn = 128;
stop_state.action.encoder1 = 0;
stop_state.action.encoder2 = 0;

var drive_forward_state = new Object();
drive_forward_state.id = 2;
drive_forward_state.action = {}
drive_forward_state.action.speed = 128 + 30;
drive_forward_state.action.turn = 128;
drive_forward_state.action.encoder1 = 100;
drive_forward_state.action.encoder2 = 100;

var drive_backward_state = new Object();
drive_backward_state.id = 3;
drive_backward_state.action = {};
drive_backward_state.action.speed = 128 - 30;
drive_backward_state.action.turn = 128;
drive_backward_state.action.encoder1 = 50;
drive_backward_state.action.encoder2 = 50;

var done_state = new Object();
done_state.id = 1;
done_state.action = {};
done_state.action.speed = 128;
done_state.action.turn = 128;
done_state.action.encoder1 = 0;
done_state.action.encoder2 = 0;


var state_trasnsitions = {};
state_trasnsitions[drive_forward_state.id] = drive_backward_state;
state_trasnsitions[drive_backward_state.id] = stop_state;
state_trasnsitions[stop_state.id] = done_state;


function send_current_state(ws)
{
    var msg = new Object();
    msg.speed = ws.current_state.action.speed;
    msg.turn = ws.current_state.action.turn;
    msg.encoder1 = ws.current_state.action.encoder1;
    msg.encoder2 = ws.current_state.action.encoder2;

    ws.send(JSON.stringify(msg), {mask: true});
}


function update_state(signal, ws)
{
    if(signal == 'OK')
    {
        ws.current_state = state_trasnsitions[ws.current_state.id];
    }
    else
    {
        ws.current_state = stop_state;
    }

    if(ws.current_state != done_state)
        send_current_state(ws);
}


wss.on('connection', function(ws) 
       {
           ws.on('message', function(message) 
                 {
                     //console.log('Received ' + message);
                     update_state(message, ws);
                 });

           ws.current_state = drive_forward_state;
           send_current_state(ws);
       }
      );
