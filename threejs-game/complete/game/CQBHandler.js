import * as THREE from '../../libs/three137/three.module.js';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { CQBConfig } from './CQBConfig.js';


class CQBHandler{
    constructor(game){
        this.game = game;
        this.camera = this.game.camera;
        this.npcs = this.game.npcHandler.npcs;
        this.user = this.game.user;
        this.config = new CQBConfig();
        this.scene = this.game.currentScene;
        this.rounds = ['1st','2nd','3rd','4th'];
        this.round = '1st';
        this.pointIndex = 0;
        this.CQBlock = false;
        this.dots = [];
        this.end = false;

        if(this.scene == 'scene1'){
            this.user.root.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), -Math.PI/2);
        }

        // add text prompt
		this.promptDiv = document.createElement( 'div' );
		this.promptDiv.style.backgroundColor = 'rgba(107, 122, 143, 0.5)';
		this.promptDiv.style.height = '25%';
		this.promptDiv.style.width = '80%';
        this.promptDiv.style.color = 'white';
		this.promptDiv.style.fontSize = '30px';
        this.promptDiv.style.marginTop = window.innerHeight * 0.35 + 'px';
        this.promptDiv.style.padding = '10px';
        this.promptDiv.style.borderRadius = '10px';
        this.promptDiv.style.borderWidth = '5px';
        this.promptDiv.style.borderStyle = 'solid';
        this.promptDiv.style.borderColor = 'rgba(14, 39, 102, 0.5)';
        // this.promptDiv.textContent = "Test prompts 233333 lalalalal 23233";
        this.prompt = new CSS2DObject( this.promptDiv );
        this.camera.add( this.prompt );
        this.prompt.position.set( 0, 0, -1 );
        this.prompt.layers.set( 0 );
        this.prompt.visible = false;

        document.addEventListener('keydown', this.keyDown.bind(this));

        this.showPoints();
    }

    keyDown(e){
        if(e.keyCode == 32 && this.CQBlock){
            // press space to continue
            this.CQBlock = false;
            // delete according point and position
            this.dots.some(dot =>{
                if(this.atPosition(dot.position)){
                    this.game.scene.remove(dot);
                    this.dots.splice(this.dots.indexOf(dot),1);
                }
            });
            // 删除当前走到的点位
            this.positions.some(point =>{
                if(this.atPosition(point)){
                    this.positions.splice(this.positions.indexOf(point),1);
                }
            });
        }
    }

    atPosition(position){
        return this.user.position.distanceTo(position) < 0.5;
    }

    // display mission point on the map
    showPoints(){
        const geometry = new THREE.CircleGeometry( 0.5, 32 ); 
        const material = new THREE.MeshBasicMaterial( {color: 0x00ff00} ); 
        this.positions = Object.values(this.config.missionPoints[this.scene][this.round]);
        this.positions.forEach(point =>{
            let dot = new THREE.Mesh( geometry, material );
            dot.position.copy(point);
            dot.rotateX(-Math.PI/2);
            this.game.scene.add( dot ); 
            this.dots.push(dot);    
        });
    }

    updateRound(){
        // 当前回合已结束，判断是否还有下一回合
        if(this.round != '4th'){
            let index = this.rounds.indexOf(this.round);
            // 更新round
            this.round = this.rounds[index+1];
            // 更新任务点数组
            this.pointIndex = 0;
            this.positions = Object.values(this.config.missionPoints[this.scene][this.round]);
            this.showPoints();
            // 更新user位置
            this.user.position.copy(this.config.startPosition[this.scene]);
        }
        else{
            // 整个场景结束
            this.end = true;
            console.log('end');
        }
    }

    update(dt){
        if(this.positions.length == 0 && !this.end){
            this.updateRound();
        }
        // 根据user position 判断是否到下一个任务点，然后展示相应的文字提示
        else if(!this.end && this.positions.length > 0 && this.atPosition(this.positions[0]) && !this.CQBlock){
            const text = this.config.text[this.scene][this.round][this.pointIndex];
            this.pointIndex++;
            // show prompt and lock the mouse
            this.CQBlock = true;
            this.promptDiv.textContent = text;
        }
        else if(this.end && this.positions.length == 0 && !this.CQBlock){
            console.log('end2');
            const text = this.config.text['end'];
            this.CQBlock = true;
            this.promptDiv.textContent = text;
            this.positions.push(1);
        }
    }
}

export { CQBHandler };