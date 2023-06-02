import * as THREE from '../../libs/three137/three.module.js';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { CQBConfig } from './CQBConfig.js';


class CQBHandler{
    constructor(game){
        this.game = game;
        this.camera = this.game.camera;
        this.npcs = this.game.npcHandler.npcs;
        this.user = this.game.user;
        this.result = this.game.result;
        this.config = new CQBConfig();
        // 当前是CQB教学场景1还是场景2
        this.scene = this.game.currentScene;
        // 所有可能的回合（X号位）
        this.rounds = ['1st','2nd','3rd','4th'];
        // 当前是几号位
        this.round = '1st';
        // 下标指示变量
        this.pointIndex = 0;
        // 显示任务文字提示的锁
        this.CQBlock = false;
        // 显示任务点的objects（荧光绿圆形）的数组
        this.dots = [];
        // 当前场景（不是回合）任务是否已全部完成
        this.sceneEnd = false;
        // 当前任务点的任务是否完成
        this.missionFinished = false;
        // 是否已阅读当前任务的文字提示
        this.read = false;
        // 当前回合（x号位的流程）是否完成
        this.roundFinished = false;

        // 任务文字提示
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
        this.prompt = new CSS2DObject( this.promptDiv );
        this.camera.add( this.prompt );
        this.prompt.position.set( 0, 0, -1 );
        this.prompt.layers.set( 0 );
        this.prompt.visible = false;

        document.addEventListener('keydown', this.keyDown);

        this.showPoints();
    }

    addPath() {
        console.log("addPath"); // for debug
        const pathMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 , linewidth: 100});
        this.pathPoints = [...this.positions];
        console.log(this.pathPoints);

        this.pointsToUse = [this.game.user.position, this.pathPoints[0]];
        this.pathGeometry = new THREE.BufferGeometry().setFromPoints(this.pointsToUse);
        this.pathLine = new THREE.Line(this.pathGeometry, pathMaterial);
        this.game.scene.add(this.pathLine);
    
        this.currentWaypointIndex = 0;
        
    }
      
    

	updatePath() {
		if (this.currentWaypointIndex < this.pathPoints.length) {
		  const currentPoint = this.pathPoints[this.currentWaypointIndex];

		  if (this.missionFinished) {
			
			if (this.currentWaypointIndex == this.pathPoints.length - 1) {
			  console.log("你已经到达最后一个目标点，引导线取消"); // for debug
			  this.pathLine.geometry.dispose();
			  this.game.scene.remove(this.pathLine);
			  this.pathFinished = true;
			  return;
			}
			this.currentWaypointIndex++;
			console.log("下一个目标在数组中的序号" + this.currentWaypointIndex); // for debug
			this.pointsToUse = [this.user.position, this.pathPoints[this.currentWaypointIndex]];
			// 线的绘制更新在update()中进行
		  }
		} 
	}

    // 检测空格按键：按空格继续
    keyDown=(e)=>{
        if(e.keyCode == 32 && this.CQBlock){
            // press space to continue
            this.CQBlock = false;
            this.read = true;
        }
    }

    // 判断玩家位置是否在当前任务点
    atPosition(position){
        return this.user.position.distanceTo(position) < 0.5;
    }

    // 可视化任务点
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
            // 初始设置当前轮次所有点不可见
            dot.visible = false;
        });

        // 只显示任务点1
        this.dots[0].visible = true;
        // 添加引导线
        this.addPath(); 
    }

    // 更新回合，如1号位任务全部完成，则更新为2号位
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
            // 更新NPC状态
            this.npcs.forEach(npc =>{
                npc.dead = this.config.NPCstatus[this.scene][this.round][npc.name];
                if(npc.dead) npc.action = 'shot';
                else {
                    npc.action = 'idle';
                    npc.hp = 3;
                }
            });
            // 更新user位置
            this.user.position.copy(this.config.startPosition[this.scene]);
        }
        else{
            // 整个场景结束
            this.sceneEnd = true;
            // console.log('end');
        }
    }

    // 逐帧判断更新函数
    update(dt){
        this.pathLine.geometry.dispose();
		this.pathLine.geometry = new THREE.BufferGeometry().setFromPoints(this.pointsToUse);
        
        if(this.roundFinished && !this.sceneEnd){
            // 回合结束但场景未结束
            this.updateRound();
            this.roundFinished = false;
        }
        else if(!this.sceneEnd && this.positions.length > 0 && this.atPosition(this.positions[0]) && !this.CQBlock && !this.read){
            // 到达当前任务点，显示文字提示
            const text = this.config.text[this.scene][this.round][this.pointIndex];
            this.CQBlock = true;
            this.promptDiv.textContent = text;
        }
        else if(this.sceneEnd && this.positions.length == 0 && !this.CQBlock){
            // 整个场景的教学都结束，显示结束文字
            const text = this.config.text[this.scene]['end'];
            this.CQBlock = true;
            this.missionFinished = false;
            this.read = false;
            this.promptDiv.textContent = text;
            this.positions.push(1);

            if(this.result!==undefined){
                this.result({time:10, hitrate:82.73});
            }
        }
        else if(!this.CQBlock && !this.missionFinished && this.read && !this.sceneEnd){
            // 读取完任务点文字提示后，等待击杀对应目标
            let target = this.config.targets[this.scene][this.round][this.pointIndex];
            // if(target!=undefined) console.log(this.npcs[target].name);
            if(target!=undefined && this.npcs[target].dead){
                this.missionFinished = true;
            }
            else if(target == undefined){
                // 无目标，直接更新任务点
                this.missionFinished = true;
            }
        }

        // 完成了当前任务
        if(this.missionFinished){
            // 每完成一个任务点更新引导线
            this.updatePath();
            // delete according point and position
            this.game.scene.remove(this.dots[0]);
            this.dots.splice(0,1);
            // 删除当前走到的点位
            this.positions.splice(0,1);

            // 如果不是本轮最后一个任务，显示下一个任务点
            if(this.positions.length > 0 && !this.sceneEnd){
                this.dots[0].visible = true;
                this.pointIndex++;
            }
            else{
                // 回合完成
                this.roundFinished = true;
            }
            this.read = false;
            this.missionFinished = false;
        }
    }
}

export { CQBHandler };