import {User} from "./User.js";
import { Group,Quaternion} from '../../libs/three137/three.module.js';

class UserLocal extends User{
    constructor(game, pos, heading,username) {
        super(game, pos, heading);
        this.name = username;

        const user = this;
        const socket = io.connect();
        // const socket = game.socket;
        socket.on('setId', function(data){
            user.id = data.id;
            socket.emit('chat message',{id:user.id,message:`connected`});
            socket.emit('init', game.userRole);
        });
        socket.on('remoteData', function(data){
            game.remoteData = data;
        });
        socket.on('deletePlayer', function(data){
            const users = game.remoteUsers.filter(function(user){
                if (user.id == data.id){
                    return user;
                }
            });

            if (users.length>0){
                let index = game.remoteUsers.indexOf(users[0]);
                if (index!=-1){
                    
                    game.remoteUsers.splice( index, 1 );


                    let root = users[0].root;
                    for ( let croot of root.children){
                        if(croot instanceof Group)
                        {continue;}
                         root.remove(croot);
                    }
                    game.scene.remove(users[0].root);
                    socket.emit('chat message',{id:data.id,message:`disconnected`});
                }
            }
        });

        socket.on('chat message', function(data){
            let pre_message=document.getElementById("pre_message")
            let message_container = document.createElement("div")
            message_container.className = "message_container";
            let messageElement = document.createElement("div")
            messageElement.className = "message";
            if(data.name===undefined){
                messageElement.innerText =`${data.id}:${data.message}`;
            }
            else messageElement.innerText =`${data.name}:${data.message}`;
            message_container.appendChild(messageElement);
            pre_message.appendChild(message_container);
            pre_message.scrollTop =pre_message.scrollHeight;
        });

        this.socket = socket;
    }

    sendMessage(flag){
        const message = document.getElementById('message');
        if(flag){
            message.removeAttribute('disabled')
            message.focus();
        }
        else {
            let self = this;
            console.log(self.name)
            if(message.value!=="")
                this.socket.emit('chat message',{id:this.id,name:self.name,message:`${message.value}`});
            message.value="";
            message.setAttribute('disabled','disabled');
        }
    }
    updateSocket(){
        if (this.socket !== undefined){
            let tmpQuat = new Quaternion();
            this.camera.getWorldQuaternion(tmpQuat);
            let self = this;
            this.socket.emit('update', {
                name:self.name,
                x: this.root.position.x,
                y: this.root.position.y,
                z: this.root.position.z,
                rotate: {x:this.root.rotation.x,y:this.root.rotation.y,z:this.root.rotation.z},
                action: this.actionName,
                q:tmpQuat,

            })
        }
    }
    update(dt){
        super.update(dt);
        this.updateSocket();
    }

}
export { UserLocal };