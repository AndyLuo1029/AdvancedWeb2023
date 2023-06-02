const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.use('/',express.static('../game/'));
app.use('/libs',express.static('../../libs/'));
app.use('/assets',express.static('../../assets/'));
// app.use(express.static('../../libs/pathfinding'));
// app.use(express.static('../../libs/three137'));
app.get('/',function(req, res) {
    res.sendFile(__dirname + '../game/index.html');
});


io.sockets.on('connection', function(socket){
    socket.userData = { x:-6, y:0.021, z:-2, heading:1*Math.PI ,action:"idle"};//Default values;
    //-6, 0.021, -2
    console.log(`${socket.id} connected`);
    socket.emit('setId', { id:socket.id });

    socket.on('disconnect', function(){
        console.log(`${socket.id} disconnected`)
        socket.broadcast.emit('deletePlayer', { id: socket.id });
    });

    // socket.on('init', function(data){
    //     // console.log(`socket.init ${data.model}`);
    //     // socket.userData.model = data.model;
    //     // socket.userData.colour = data.colour;
    //     socket.userData.x = data.x;
    //     socket.userData.y = data.y;
    //     socket.userData.z = data.z;
    //     socket.userData.heading = data.h;
    //     //socket.userData.pb = data.pb;
    //     socket.userData.action = "Idle";
    // });

    socket.on('update', function(data){
        //console.log(socket.id,data.x,data.y,data.z)
        socket.userData.x = data.x;
        socket.userData.y = data.y;
        socket.userData.z = data.z;
        socket.userData.rotate = data.rotate;
        socket.userData.action = data.action;
    });
    //var time =0;
    socket.on('chat message',  async function(data){
        console.log(`chat message:${data.id} ${data.message}`);
        //io.to(data.id).emit('chat message', { id: socket.id, message: data.message });
        io.emit('chat message', { id: data.id, message: data.message });
    })
});

http.listen(8084, function(){
    console.log('listening on *:8084');
});

setInterval(function(){

    const nsp = io.of('/');
    //console.log( io.sockets.sockets);
    //console.log(io.sockets.sockets)
    let pack = [];

    for(let cs of io.sockets.sockets){
        // console.log(id)
        // const socket = nsp.connected[id];
        const socket = cs[1];
        //Only push sockets that have been initialised
        //if (socket.userData.model!==undefined){
            pack.push({
                id: socket.id,
                // model: socket.userData.model,
                // colour: socket.userData.colour,
                x: socket.userData.x,
                y: socket.userData.y,
                z: socket.userData.z,
                rotate: socket.userData.rotate,
                //pb: socket.userData.pb,
                action: socket.userData.action
            });
        //}
    }


    if (pack.length>0) {
        io.emit('remoteData', pack);
    }
}, 40);