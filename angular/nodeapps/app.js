const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, {
	cors: {   // 处理跨域问题
		origin: "http://localhost:4200",  // angular项目的启动端口，默认4200
	  }
});
const axios = require('axios');

// app.use('/',express.static('../game/'));
// app.use('/libs',express.static('../../libs/'));
// app.use('/assets',express.static('../../assets/'));
// app.get('/',function(req, res) {
//     res.sendFile(__dirname + '../game/index.html');
// });

const token = "sd0feiptty27h9gerdkrgnzkjtskuejf";

const gptdata1 = "{\"system\":\"你是一个小助手\",\"message\":[\"user:";
const gptdata2 = "\"],\"temperature\":\"0.9\"}";

const ai = async (message) => {
    let gptdata = gptdata1 + message + gptdata2;

    options = {
        method: 'POST',
        url: "https://eolink.o.apispace.com/ai-chatgpt/create",
        headers: {
          'content-type': 'application/json',
          "X-APISpace-Token":token,
          "Authorization-Type":"apikey",
        },
        data: gptdata,
        crossDomain: true
    };
    try {
        const response = await axios.request(options);
        console.log(response.data.result);
        return response.data.result;
    } catch (error) {
        console.error(error);
    }
};

let npcMasterId ;
let npcsPos;
let npcsQua;
io.sockets.on('connection', function(socket){

    //-6, 0.021, -2
    console.log(`${socket.id} connected`);
    socket.emit('setId', { id:socket.id });

    socket.on('init', function(model){
        socket.userData = { x:-6, y:0.021, z:-2, heading:1*Math.PI ,action:"idle", model:model};//Default values;
    });

    socket.on('disconnect', function(){
        if(socket.id===npcMasterId){
            npcMasterId = null;
        }
        console.log(`${socket.id} disconnected`)
        socket.broadcast.emit('deletePlayer', { id: socket.id });
    });

    socket.on('update', function(data){
        if(socket.userData != undefined){
            socket.userData.name = data.name;
            socket.userData.x = data.x;
            socket.userData.y = data.y;
            socket.userData.z = data.z;
            socket.userData.rotate = data.rotate;
            socket.userData.action = data.action;
            socket.userData.q = data.q;
        }
    });
    //var time =0;
    socket.on('chat message',  async function(data){
        console.log(`chat message:${data.name} ${data.message}`);
        io.emit('chat message', { id: data.id,name:data.name, message: data.message });
    })

    socket.on('updateNpc',function(data){
        if(npcMasterId ===null||npcMasterId===undefined||npcMasterId ===socket.id){
            npcMasterId = socket.id;
            npcsPos = data.npcsPos
            npcsQua = data.npcsQua
        }
    })

    socket.on('AImessage',async function(data){
        console.log("AImessage",data.message);
        // data.message就是要发送给GPT的input
        // 发送给GPT，获得回复
        ai(data.message).then((res)=>{
        // 单独回传这条回复
        socket.emit('AImessage', res);
        });
        // socket.emit('AImessage', 'Test reply.');
    });
});

http.listen(8084, function(){
    console.log('listening on *:8084');
});

setInterval(function(){

    const nsp = io.of('/');
    let pack = [];

    for(let cs of io.sockets.sockets){
        const socket = cs[1];
        //Only push sockets that have been initialised
        if (socket.userData!==undefined){
            pack.push({
                id: socket.id,
                name:socket.userData.name,
                // model: socket.userData.model,
                // colour: socket.userData.colour,
                x: socket.userData.x,
                y: socket.userData.y,
                z: socket.userData.z,
                rotate: socket.userData.rotate,
                //pb: socket.userData.pb,
                action: socket.userData.action,
                model: socket.userData.model,
                q:socket.userData.q
            });
        }
    }
    if (pack.length>0) {
        io.emit('remoteData', pack);
    }
    if(npcMasterId!==undefined)
    io.emit('npcMessage', { id: npcMasterId, npcsPos: npcsPos ,npcsQua:npcsQua});

}, 40);