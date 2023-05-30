import * as THREE from '../../libs/three137/three.module.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { CQBConfig } from './CQBConfig.js';


class CQBHandler{
    constructor(game){
        this.game = game;
        this.camera = this.game.camera;
        this.npcs = this.game.npcHandler.npcs;
        this.user = this.game.user;
        this.config = new CQBConfig();
        this.scene = 'scene1';
        this.numbers = ['1st','2nd','3rd','4th'];
        this.number = '1st';
        this.showPoints();
    }

    atPosition(position){
        return this.user.position.distanceTo(position) < 0.5;
    }

    showPoints(){
        // const temparr = [];
        // this.positions = Object.values(this.config.missionPoints[this.scene][this.number]);
        // this.positions.forEach(point =>{
        //     temparr.push(point.x,point.y,point.z);
        // });
        // console.log(temparr);
        // const vertices = new Float32Array(temparr);
        // const geometry = new THREE.BufferGeometry();
        // geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
        // const material = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
        // const mesh = new THREE.Points( geometry, material );
        
        // this.game.scene.add(mesh);

        const geometry = new THREE.CircleGeometry( 0.5, 32 ); 
        const material = new THREE.MeshBasicMaterial( {color: 0x00ff00} ); 
        this.positions = Object.values(this.config.missionPoints[this.scene][this.number]);
        this.positions.forEach(point =>{
            let dot = new THREE.Mesh( geometry, material );
            dot.position.copy(point);
            dot.rotateX(-Math.PI/2);
            this.game.scene.add( dot );     
        });
        
    }

    update(dt){
        // 根据user position 判断是否到任务点，然后展示相应的文字提示
        this.positions = Object.values(this.config.missionPoints[this.scene][this.number]);
        // console.log(this.positions);
        this.positions.some(point =>{
            if(this.atPosition(point)){
                const text = this.config.text[this.scene][this.number][this.positions.indexOf(point)];
                console.log(this.positions.indexOf(point),text,point, this.user.position);
            }
        })

    }
}

export { CQBHandler };