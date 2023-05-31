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
import { GLTFLoader } from '../../libs/three137/GLTFLoader.js';
import { DRACOLoader } from '../../libs/three137/DRACOLoader.js';
import * as THREE from '../../libs/three137/three.module.js';
import {User} from "./User.js";

class UserLocal extends User{
    constructor(game, pos, heading) {
        super(game, pos, heading);
        this.id;
        const user = this;
        const socket = io.connect();
        socket.on('setId', function(data){
            user.id = data.id;
            console.log(user.id);
        });
        socket.on('remoteData', function(data){
            game.remoteData = data;
        });
        // socket.on('deletePlayer', function(data){
        //     const players = game.remotePlayers.filter(function(player){
        //         if (player.id == data.id){
        //             return player;
        //         }
        //     });
        //     if (players.length>0){
        //         let index = game.remotePlayers.indexOf(players[0]);
        //         if (index!=-1){
        //             game.remotePlayers.splice( index, 1 );
        //             game.scene.remove(players[0].object);
        //         }
        //     }else{
        //         index = game.initialisingPlayers.indexOf(data.id);
        //         if (index!=-1){
        //             const player = game.initialisingPlayers[index];
        //             player.deleted = true;
        //             game.initialisingPlayers.splice(index, 1);
        //         }
        //     }
        // });

        socket.on('chat message', function(data){
            console.log(data.id,data.message)
            // document.getElementById('chat').style.bottom = '0px';
            // const player = game.getRemotePlayerById(data.id);
            // //game.speechBubble.player = player;
            //
            // //game.speechBubble.update(data.message);
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
            // message.removeAttribute('disabled')
            // message.focus();
        }
        else {
            this.socket.emit('chat message',{id:this.id,message:`${message.value}`});
            //message.setAttribute('disabled','disabled');
        }


    }
    updateSocket(){
        if (this.socket !== undefined){
            //console.log(`PlayerLocal.updateSocket - rotation(${this.object.rotation.x.toFixed(1)},${this.object.rotation.y.toFixed(1)},${this.object.rotation.z.toFixed(1)})`);


            this.socket.emit('update', {
                x: this.root.position.x,
                y: this.root.position.y,
                z: this.root.position.z,
                h: this.root.rotation.y,
                //pb: this.object.rotation.x,
                action: this.action
            })
        }
    }
    update(dt){
        super.update(dt);
        this.updateSocket();

    }

}
export { UserLocal };