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
    socket.userData = { x:21, y:0, z:0, heading:1*Math.PI };//Default values;

    console.log(`${socket.id} connected`);
    socket.emit('setId', { id:socket.id });

    socket.on('disconnect', function(){
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
        socket.userData.x = data.x;
        socket.userData.y = data.y;
        socket.userData.z = data.z;
        socket.userData.heading = data.h;
        //socket.userData.pb = data.pb,
        socket.userData.action = data.action;
    });
    //var time =0;
    // socket.on('chat message',  async function(data){
    //     console.log(`chat message:${data.id} ${data.message}`);
    //     io.to(data.id).emit('chat message', { id: socket.id, message: data.message });
    //     time +=10;
    //     await sleep(10000);
    //     time -=10;
    //     if(time ==0)
    //         io.to(data.id).emit('chat message', { id: socket.id, message: "" });
    // })
});

http.listen(8084, function(){
    console.log('listening on *:8084');
});

setInterval(function(){
    const nsp = io.of('/');
    let pack = [];

    for(let id in io.sockets.sockets){
        const socket = nsp.connected[id];
        //Only push sockets that have been initialised
        //if (socket.userData.model!==undefined){
            pack.push({
                id: socket.id,
                // model: socket.userData.model,
                // colour: socket.userData.colour,
                x: socket.userData.x,
                y: socket.userData.y,
                z: socket.userData.z,
                heading: socket.userData.heading,
                //pb: socket.userData.pb,
                action: socket.userData.action
            });
        //}
    }
    if (pack.length>0) io.emit('remoteData', pack);
}, 40);