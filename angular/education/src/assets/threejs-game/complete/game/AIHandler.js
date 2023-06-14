import * as THREE from '../../libs/three137/three.module.js';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

class AIHandler{
    constructor(game){
        this.game = game;
        this.scene = game.currentScene;
        this.camera = this.game.camera;
        this.user = this.game.user;
        this.socket = this.user.socket;
        this.socket.on('AImessage', function(data){
            let pre_message=document.getElementById("pre_message")
            let message_container = document.createElement("div")
            message_container.className = "message_container";
            message_container.style.color = "green";
            let messageElement = document.createElement("div")
            messageElement.className = "message";
            messageElement.innerText =`ChatGPT:${data}`;
            message_container.appendChild(messageElement);
            pre_message.appendChild(message_container);
            pre_message.scrollTop =pre_message.scrollHeight;
        });
        this.topMenu = true;
        this.container = document.getElementById('container');
        this.message = document.getElementById('message');
        this.enter = false;
        this.input = false;
        this.NPCposition = {
            'scene1': new THREE.Vector3(29.453994556290464, 0.3293970718169019, -0.06141265617835044),
            'scene2':new THREE.Vector3(-11.743049174498342, 0.18245120346546173, -20.016773701094795),
            'multiplayer':new THREE.Vector3(-7.771464307242652, 0.7657846808433533, 5.886116888246366)
        };

        this.generalChatMessage = "近身距离作战（Close-Quarters Battle，CQB），指室内近距离战斗，是一种遭遇战的形式。CQB是特种警察部队及特种部队的必须学习的内容之一，在城镇战中是最重要的技能之一，特别是在当小部队的士兵于城镇环境或者是建筑物内时，这种技巧往往能够达到其原先预设的目标──即最小化伤亡数目。";
        this.returnMessage = "\n\n按'4'：退出向导\t\t按'5'：返回上一步";

        this.sceneChatMessage = {
            'scene1': "本场景的教学战术为强壁法，这是一种对战术小组成员的战斗经验与配合要求较低的初级CQB战术。通常情况下，一支战术小队由4名成员组成，分别为1、2、3、4号位，您将在接下来的教学中完整体验所有位置成员的职责与行动。下面请跟随引导线和任务提示完成本战术的学习。",
            'scene2': "本场景的教学战术为反角法，该战术要求战术小组成员作战经验丰富、配合默契，属于进阶CQB战术。通常情况下，一支战术小队由4名成员组成，分别为1、2、3、4号位，您将在接下来的教学中完整体验所有位置成员的职责与行动。下面请跟随引导线和任务提示完成本战术的学习。",
            'multiplayer': "本场景为多人合作模式，您将与其他玩家一起完成战术任务。请注意，您的队友也是真实玩家，他们的行为不受游戏引导的控制，因此请您与队友进行有效的沟通，以完成战术任务。"
        };

        this.talking = false;
        this.AIlock = false;
        document.addEventListener('keydown', this.keyDown);

         // 文字提示
		this.promptDiv = document.createElement( 'div' );
		this.promptDiv.style.backgroundColor = 'rgba(107, 122, 143, 0.5)';
		this.promptDiv.style.height = '25%';
		this.promptDiv.style.width = '60%';
        this.promptDiv.style.color = 'white';
		this.promptDiv.style.fontSize = '30px';
        this.promptDiv.style.lineHeight = 'normal';
        this.promptDiv.style.marginTop = window.innerHeight * 0.35 + 'px';
        this.promptDiv.style.padding = '10px';
        this.promptDiv.style.borderRadius = '10px';
        this.promptDiv.style.borderWidth = '5px';
        this.promptDiv.style.borderStyle = 'solid';
        this.promptDiv.style.borderColor = 'rgba(14, 39, 102, 0.5)';
        this.promptDiv.style.whiteSpace = 'pre-wrap';
        this.prompt = new CSS2DObject( this.promptDiv );
        this.camera.add( this.prompt );
        this.prompt.position.set( 0, 0, -1 );
        this.prompt.layers.set( 0 );
        this.prompt.visible = false;
    }

    // 按键控制
    keyDown=(e)=>{
        if(this.AIlock){
            if(e.keyCode ===13 && this.input){
                this.enter = !this.enter;
                // send ajax socket and get return message
                if(this.enter){
                    this.message.removeAttribute('disabled');
                    this.message.focus();
                }
                else{
                    if(message.value!=="") {
                        let pre_message=document.getElementById("pre_message")
                        let message_container = document.createElement("div")
                        message_container.className = "message_container";
                        let messageElement = document.createElement("div")
                        messageElement.className = "message";
                        messageElement.innerText =`User:${message.value}`;
                        message_container.appendChild(messageElement);
                        pre_message.appendChild(message_container);
                        pre_message.scrollTop =pre_message.scrollHeight;
                        this.socket.emit('AImessage',{id:this.id,message:`${message.value}`});
                    }
                    this.message.value = "";
                    this.message.setAttribute('disabled','disabled');
                }
            }
            if(this.enter && this.input) return;

            if(this.topMenu){
                switch(e.keyCode){
                    case 49: //1, print general chat message
                        this.promptDiv.textContent = this.generalChatMessage + this.returnMessage;
                        this.topMenu = false;
                        this.disableMessage();
                        break;
                    case 50: //2, print scene chat message
                        this.promptDiv.textContent = this.sceneChatMessage[this.scene] + this.returnMessage;
                        this.topMenu = false;
                        this.disableMessage();
                        break;
                    case 51: //3, show AI chat box
                        this.promptDiv.textContent = "按回车输入您想说的话，再按回车发送：" + this.returnMessage;
                        this.topMenu = false;
                        this.input = true;
                        this.container.style.display = 'block';
                        this.message.removeAttribute('disabled');
                        break;
                    case 52: //4, quit chat
                        this.AIlock = false;
                        this.topMenu = true;
                        this.disableMessage();
                        break;
                }
            }
            else{
                switch(e.keyCode){
                    case 52: //4, quit chat
                        this.AIlock = false;
                        this.topMenu = true;
                        this.disableMessage();
                        break;
                    case 53: //5, go back to top menu
                        this.topMenu = true;
                        this.disableMessage();
                        break;
                }
            }
        }
    }

    disableMessage(){
        this.message.value = "";
        this.message.setAttribute('disabled','disabled');
        if(this.scene !== 'multiplayer') this.container.style.display = 'none';
        this.input = false;
    }

    atPosition(position){
        return this.user.position.distanceTo(position) < 1;
    }


    update(){
        if(this.topMenu) this.promptDiv.textContent = "您好，欢迎来到CQB战术训练场。我是您的AI向导，您可以随时靠近我以触发对话。请根据您的需求进行操作:\n\n按'1'：什么是CQB？\t\t按'2'：我现在在哪？\n按'3'：与ChatGPT对话\t\t按'4'：退出向导";
        
        // 计算如果玩家在AI位置，触发对话. 如果已经在对话中，不再触发
        if(this.atPosition(this.NPCposition[this.scene]) && !this.talking){
            this.talking = true;
            this.AIlock = true;
        }
        else if(this.user.position.distanceTo(this.NPCposition[this.scene]) > 1){
            // 远离一定距离后更新状态
            this.talking = false;
        }

    }

}

export {AIHandler};