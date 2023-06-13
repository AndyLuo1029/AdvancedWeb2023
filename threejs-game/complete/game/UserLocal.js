import {User} from "./User.js";
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { Group,
    Object3D,
    Vector3,
    Quaternion,
    Raycaster,
    AnimationMixer,
    SphereGeometry,
    MeshBasicMaterial,
    Mesh,
    BufferGeometry,
    Line
} from '../../libs/three137/three.module.js';

class UserLocal extends User{
    constructor(game, pos, heading,username) {
        super(game, pos, heading);
        this.name = username;

        const user = this;
        const socket = io.connect();
        // const socket = game.socket;
        socket.on('setId', function(data){
            user.id = data.id;
            // console.log(user.id);
            socket.emit('chat message',{id:user.id,message:`connected`});
            socket.emit('init', game.userRole);
        });
        socket.on('remoteData', function(data){
            //console.log(data);
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
                    //
                    // let object = users[0].object;
                    // // sb的 ID删不掉，就在这
                    // for ( let children of object.children ) {
                    //     object.remove( children );
                    // }
                    // console.log(root.children);
                    // console.log(root.children[0]);
                    // console.log(root.children[1]);
                    for ( let croot of root.children){
                        //console.log(croot)
                        if(croot instanceof Group)
                        {
                            //console.log(croot)
                            continue;}
                         root.remove(croot);
                    }
            
                    //game.scene.remove(users[0].object);
                    game.scene.remove(users[0].root);
                    socket.emit('chat message',{id:data.id,message:`disconnected`});
                }
            }else{
                // index = game.initialisingPlayers.indexOf(data.id);
                // if (index!=-1){
                //     const player = game.initialisingPlayers[index];
                //     player.deleted = true;
                //     game.initialisingPlayers.splice(index, 1);
                // }
            }
        });

        socket.on('chat message', function(data){
            // console.log(data.id,data.message)

            let pre_message=document.getElementById("pre_message")
            let message_container = document.createElement("div")
            message_container.className = "message_container";
            let messageElement = document.createElement("div")
            messageElement.className = "message";
            if(data.name===undefined){
                messageElement.innerText =`${data.id}:${data.message}`;
            }
            else messageElement.innerText =`${data.name}:${data.message}`;
            //console.log(messageElement,message_container,pre_message)
            message_container.appendChild(messageElement);
            pre_message.appendChild(message_container);
            pre_message.scrollTop =pre_message.scrollHeight;
        });


        // $('#msg-form').submit(function(e){
        //     socket.emit('chat message', { id:game.chatSocketId, message:$('#m').val() });
        //     $('#m').val('');
        //     return false;
        // });

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
            //console.log(`PlayerLocal.updateSocket - rotation(${this.object.rotation.x.toFixed(1)},${this.object.rotation.y.toFixed(1)},${this.object.rotation.z.toFixed(1)})`);
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
        //onsole.log(this.root.rotation)
        this.updateSocket();

    }

}
export { UserLocal };