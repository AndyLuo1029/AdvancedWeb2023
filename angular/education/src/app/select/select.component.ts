import { AfterViewInit, Component, ElementRef, OnInit } from '@angular/core';
import { NgClass } from '@angular/common'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import { GridHelper } from 'three';
import { animation } from '@angular/animations';
import { Router } from '@angular/router';
import { Global } from '../global';
import { color } from 'echarts';
@Component({
  selector: 'app-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.css'],
  
})
export class SelectComponent implements AfterViewInit {

	constructor(private el: ElementRef, public router:Router) {
		// this.resources = new Set();
		for(let i = 0; i < 6; i++) {
			this.loading[i] = true;
		}
	}

	private users:User[] = [];
	private lastSelect:number = -1;
	private lastSelectMap:number = -1;
	public loading:boolean[] = [];
	private finish = (i:number) => {
		this.loading[i] = false;
	}
	ngAfterViewInit() {    
		for(let i = 0; i < 6; i++) {
			// if(i > 1) break;
			const user = new User(i, this.el,this.finish);
			this.users.push(user) 
		}

	}

	ngOnDestroy() {
		for(let i = 0; i < 6; i++) {
			this.users[i].renderer.setAnimationLoop(null);
			this.users[i].renderer.clear();
			this.users[i].renderer.dispose();
			//@ts-ignore
			this.users[i].renderer = null;
			this.users[i].dispose_();
			// console.log(this.users[i].scene)
		}
		
	}
	characters = [
		{id:1, selected:false, name:"猎狐者Foxhunter", para:0},
		{id:2, selected:false, name:"复仇女神Nemesis", para:1},
		{id:3, selected:false, name:"审判者Inquisitor", para:2},
		{id:4, selected:false, name:"斯沃特Swart", para:3},
		{id:5, selected:false, name:"飞虎队Flying Tiger", para:4},
		{id:6, selected:false, name:"赛斯Sise", para:5},
	]
	maps = [
		{id:1, selected:false, name:"CQB场景1",para:0},
		{id:2, selected:false, name:"CQB场景2",para:1},
		{id:3, selected:false, name:"PVE多人",para:2},
	]
	onSelect(index:any) {
		for( let ch of this.characters) {
			ch.selected = false;
		}
		if(this.lastSelect != -1) {
			this.users[this.lastSelect].toggleAnimation();
		}
		// this.clearThree(this.users[index].scene);
		this.lastSelect = index
		this.users[index].toggleAnimation();
		this.characters[index].selected = true;
		// console.log(index)
		// console.log(this.characters)
	}
	onSelectMap(index:any) {
		for( let map of this.maps) {
			map.selected = false;
		}
		this.lastSelectMap = index;
		this.maps[index].selected = true;
	}

	enter() {
		if(this.lastSelect == -1 || this.lastSelectMap == -1) {
			window.alert("请完成人物和地图选择")
			return
		}
		//check the user 
		const status = localStorage.getItem("inGame");
		// if(status == '1' || status == undefined) {
		// 	window.alert("已在学习中")
		// 	return
		// }
		localStorage.setItem("inGame", '1');
		Global.skin_choice = this.characters[this.lastSelect].para;
		Global.map_choice = this.maps[this.lastSelectMap].para;
		this.router.navigate(['/three']);
	}
}

interface RifleDirection {
	'idle'?: any;
	'walk'?: any;
	'firingwalk'?: any;
	'fpsFiringwalk'?: any;
	'firing'?: any;
	'fpsFiring'?: any;
	'run'?: any;
	'shot'?: any;
	// 'Pointing Gesture'?: any;
}

interface Animations {
	'firing'?: THREE.AnimationClip;
	// 'Pointing Gesture'?: any;
}
class User{
	finish: (i: number) => void;
	track(resource:any) {
		if (!resource) {
			return resource;
		}
  
		// handle children and when material is an array of materials or
		// uniform is array of textures
		if (Array.isArray(resource)) {
			resource.forEach(resource => this.track(resource));
			return resource;
		}
  
		if (resource.dispose || resource instanceof THREE.Object3D) {
			this.resources.add(resource);
		}
		if (resource instanceof THREE.Object3D) {
			//@ts-ignore
			this.track(resource.geometry);
			//@ts-ignore
			this.track(resource.material);
			this.track(resource.children);
		} else if (resource instanceof THREE.Material) {
			// We have to check if there are any textures on the material
			for (const value of Object.values(resource)) {
				if (value instanceof THREE.Texture) {
					this.track(value);
				}
			}
			// We also have to check if any uniforms reference textures or arrays of textures
			//@ts-ignore
			if (resource.uniforms) {
				//@ts-ignore
				for (const value of Object.values(resource.uniforms)) {
					if (value) {
						//@ts-ignore
						const uniformValue = value.value;
						if (uniformValue instanceof THREE.Texture ||
							Array.isArray(uniformValue)) {
							this.track(uniformValue);
						}
					}
				}
			}
		}
		return resource;
	}
	untrack(resource:any) {
		this.resources.delete(resource);
	}
	dispose_() {
		for (const resource of this.resources) {
			if (resource instanceof THREE.Object3D) {
				if (resource.parent) {
					resource.parent.remove(resource);
				}
			}
			if (resource.dispose) {
				resource.dispose();
			}
		}
		this.resources.clear();
	}
	resources: Set<any>;
	camera: THREE.PerspectiveCamera;
	scene: THREE.Scene;
	light: THREE.DirectionalLight;
	renderer: THREE.WebGLRenderer;
	root: any;
	game: any;
	raycaster: any;
	loadingBar: any;
	tmpVec: any;
	tmpQuat: any;
	speed: number;
	isFiring: boolean;
	isRun: boolean;
	ready: boolean;
	object: any;
	rifleDirection!: RifleDirection;
	bulletTime: any;
	bulletHandler: undefined;
	hitPoint: any;
	anim: any;
	rifle: any;
	aim: any;
	muzzle: any;
	animations!: Animations;
	mixer: any;
	actionName: any;
	curAction: any;

	rotateRifle!: { start: any; end: any; time: number; };
	assetsPath: string;
	clock: THREE.Clock;
	id: number;
	skin: string;
	female: boolean;
	color: number[];
    constructor(id:number, el:any, finish: (i: number) => void){
		this.resources = new Set();
		this.finish = finish;
		this.color = [0xffffff,0xf57a3d,0x00ccff,0xffffff,0xf57a3d,0x00ccff]
		this.female = id < 3
		if(this.female) {
			this.skin = "eve2.glb"
		}
		else {
			this.skin = "swat-guy2.glb"
		}
		this.id = id
		const pos = this.track(new THREE.Vector3( 0, 0, 0));
		const heading = 1*Math.PI;
		let domID = 'scene-container-' + id ;
		const container = el.nativeElement.querySelector('#'+domID);
		
		this.assetsPath = '../../assets/threejs-game/assets/';

		this.clock = this.track(new THREE.Clock()); // 用于计算时间差
		// 创建相机，并设置位置和旋转角度
		this.camera = this.track(new THREE.PerspectiveCamera( 40, container.clientWidth/container.clientHeight, 0.1, 500 ));
		// this.camera.position.set( -6, 1.8, 3 );
		this.camera.position.set( -1, 1.4, -3 );
		const target = this.track(new THREE.Vector3( 0, 0.8, 0));
		this.camera.lookAt(target);
		let col = 0x7592af;
		this.scene =this.track( new THREE.Scene()); // 创建场景
		this.scene.background = this.track(new THREE.Color( col )); // 设置背景颜色
		this.scene.fog = this.track(new THREE.Fog( col, 100, 200 )); // 添加雾效

		const ambient = this.track(new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1)); // 创建环境光
		this.scene.add(ambient);

		const light = this.track(new THREE.DirectionalLight()); // 创建平行光
		light.position.set( 10, 20, -20 );
		light.target.position.set(0, 0, 0);
		light.castShadow = true; // 开启阴影

		// 设置灯光的阴影属性
		light.shadow.mapSize.width = 1024;
		light.shadow.mapSize.height = 512;
		light.shadow.camera.near = 0.5;
		light.shadow.camera.far = 50;
		const d = 30;
		light.shadow.camera.left = -d;
		light.shadow.camera.bottom = -d*0.25;
		light.shadow.camera.right = light.shadow.camera.top = d;

		this.scene.add(light); // 将灯光添加到场景中
		this.light = light;
		// ground

		var mesh = this.track(new THREE.Mesh( new THREE.PlaneGeometry( 200, 20 ), new THREE.MeshPhongMaterial( { color: 0x999999, depthWrite: false } ) ));
		mesh.rotation.x = - Math.PI / 2;
		//mesh.position.y = -100;
		mesh.receiveShadow = true;
		this.scene.add( mesh );

		this.renderer = this.track(new THREE.WebGLRenderer({ antialias: true, alpha: true } )); // 创建渲染器
		this.renderer.shadowMap.enabled = true; // 开启阴影
		this.renderer.setPixelRatio( window.devicePixelRatio );
		this.renderer.setSize( container.clientWidth, container.clientHeight);
		// this.renderer.outputEncoding = THREE.sRGBEncoding; // 设置颜色编码格式
		container.appendChild( this.renderer.domElement );

		//USER
        this.root = this.track(new THREE.Group());
        this.root.position.copy( pos );
        this.root.rotation.set( 0, heading, 0, 'XYZ' );
        this.game = this;
        this.raycaster = this.track(new THREE.Raycaster());

        this.scene.add(this.root);
	    this.load();

        this.tmpVec = this.track(new THREE.Vector3());
        this.tmpQuat = this.track(new THREE.Quaternion());

		this.speed = 0;
		this.isFiring = false;
		this.isRun = false;
		this.ready = false;
		// this.object
        //this.initMouseHandler();
		if(this.female) {
			this.initRifleDirection();
		}
		// this.loading[id] = false;
    }

	initRifleDirection() {
		this.rifleDirection = {};

		this.rifleDirection.idle =this.track( new THREE.Quaternion(-0.178, -0.694, 0.667, 0.203));
		this.rifleDirection.walk =this.track( new THREE.Quaternion( 0.044, -0.772, 0.626, -0.102));
		this.rifleDirection.firingwalk = this.track(new THREE.Quaternion(-0.034, -0.756, 0.632, -0.169));
		this.rifleDirection.fpsFiringwalk =this.track( new THREE.Quaternion(0.005, -0.789, 0.594, -0.085));
		this.rifleDirection.firing = this.track(new THREE.Quaternion( -0.054, -0.750, 0.633, -0.184));
		this.rifleDirection.fpsFiring = this.track(new THREE.Quaternion(0.005, -0.789, 0.594, -0.085));
		this.rifleDirection.run = this.track(new THREE.Quaternion( 0.015, -0.793, 0.595, -0.131));
		this.rifleDirection.shot =this.track(new THREE.Quaternion(-0.082, -0.789, 0.594, -0.138));
	}

    set position(pos){
        this.root.position.copy( pos );
    }

	get position(){
		return this.root.position;
	}

	// set firing(mode:any){
	// 	this.isFiring = mode;
	// 	if (mode){
	// 		//console.log(this.speed)
	// 		this.action =  (Math.abs(this.speed) === 0 ) ? "firing" : "firingwalk";
	// 		//console.log(this.action)
	// 		this.bulletTime = this.game.clock.getElapsedTime();
	// 	}else{
	// 		this.action = 'idle';
	// 	}
	// 	//console.log(this.action)
	// }
	// shoot(){
	// 	if (this.bulletHandler === undefined) this.bulletHandler = this.game.bulletHandler;
	// 	// this.aim.getWorldPosition(this.tmpVec);
	// 	// this.aim.getWorldQuaternion(this.tmpQuat);
	// 	this.camera.getWorldPosition(this.tmpVec);
	// 	// this.root.getWorldPosition(this.tmpVec);
	// 	// let tempVec = new Vector3();
	// 	// this.camera.getWorldPosition(tempVec);
	// 	// this.tmpVec.y = tempVec.y;
	// 	// this.tmpVec.y = this.camera.position.y;
	// 	this.camera.getWorldQuaternion(this.tmpQuat);
	// 	// this.tmpQuat.set(1,0,-1,0);
	// }

    // addSphere(){
    //     const geometry = new SphereGeometry( 0.1, 8, 8 );
    //     const material = new MeshBasicMaterial( { color: 0xFF0000 });
    //     const mesh = new Mesh( geometry, material );
    //     this.game.scene.add(mesh);
	// 	this.hitPoint = mesh;
	// 	this.hitPoint.visible = false;
    // }

    load(){
    	const loader = this.track(new GLTFLoader( ).setPath(`${this.game.assetsPath}factory/`));
		const dracoLoader =this.track( new DRACOLoader());
        dracoLoader.setDecoderPath( `${this.game.assetsPath}../libs/three137/draco/` );
        loader.setDRACOLoader( dracoLoader );
		const user = this;

		loader.load( 'Idle.glb', function( object:any ){
			user.anim=	object.animations[0]
		});
		// console.log(this.animations);

        //Load a glTF resource
		loader.load(
			// resource URL
			this.skin,
			(gltf: { scene: THREE.Object3D<THREE.Event> | THREE.AnimationObjectGroup; animations: any[]; }) => {
				this.root.add( gltf.scene );
                this.object = gltf.scene;
				this.object.frustumCulled = false;

				let scale = 1;
                if(this.female) {
					scale = 1.2;
				}
                this.object.scale.set(scale, scale, scale);
				// console.log(this.object)
                this.object.traverse( (child: { isMesh: any; castShadow: boolean; name: string | string[]; material: any }) => {
                    if ( child.isMesh){
						
                        child.castShadow = true;
						if (child.name.includes('Rifle')) this.rifle = child;
                    }
					if( child.name == "Mesh") {
						child.material.color.set(this.color[this.id]);
					}
                });
				// if (this.rifle){
				// 	const geometry = new THREE.BufferGeometry().setFromPoints( [ new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 7, 0, 0 ) ] );
					
        		// 	const line = new THREE.Line( geometry );
        		// 	line.name = 'aim';

				// 	this.rifle.add(line);
				// 	line.position.set(0, 0, 0.5);
				// 	this.aim = line;
				// 	line.visible = false;
					// const muzzleloader = new GLTFLoader( ).setPath(`${this.game.assetsPath}weapons/`);
					// muzzleloader.load(
					// 	'muzzle_flash.glb',
					// 	gltf => {
					// 		this.muzzle = gltf.scene;
					// 		this.aim.add( this.muzzle);
					// 		this.muzzle.rotateY(-Math.PI/2);
					// 		this.muzzle.position.set(7, 0, 0);
					// 		this.muzzle.scale.set(0.9, 0.9, 0.9);		
					// 	}
					// );
				// }
				// user.object.add(this.object);

                this.animations = {};

                gltf.animations.forEach( animation => {
					// console.log(animation)
                    this.animations[animation.name.toLowerCase() as keyof typeof this.animations] = animation;
					// console.log(this.animations);
					//console.log(animation.name.toLowerCase())
                })
				//this.animations['idle']=user.anim;
				//console.log(this.animations)
                this.mixer = new THREE.AnimationMixer(gltf.scene);

                this.action = 'idle';

				this.ready = true;

				// this.game.startRendering();
				this.renderer.setAnimationLoop( this.render.bind(this) );
				this.finish(this.id);
    		},
			// called while loading is progressing
			// xhr => {
			// 	// this.loadingBar.update( 'user', xhr.loaded, xhr.total );
			// },
			// // called when loading has errors
			// err => {
			// 	console.error( err );
			// }
		);
	
	}

    set action(name:any){
		if (this.actionName == name.toLowerCase()) return;    
		
		//console.log(`User action:${name}`);
		if(name.toLowerCase()==="run"){
			this.isRun =true;
		}
		else{
			this.isRun = false;
		}

		const clip = this.animations[name.toLowerCase() as keyof typeof this.animations];

		//console.log(clip)
		if (clip!==undefined){
			const action = this.mixer.clipAction( clip );
			if (name=='shot'){
				action.clampWhenFinished = true;
				action.setLoop( THREE.LoopOnce );
			}
			action.reset();
			const nofade = this.actionName == 'shot';
			this.actionName = name.toLowerCase();
			action.play();
			if (this.curAction){
				if (nofade){
					this.curAction.enabled = false;
				}else{
					this.curAction.crossFadeTo(action, 0.5);
				}
			}
			this.curAction = action;
		}
		if (this.rifle && this.rifleDirection){
			// console.log(this.perspective,name);
			let q = undefined;
			q = this.rifleDirection[name.toLowerCase() as keyof typeof this.rifleDirection];
			

			if (q!==undefined){
				const start = this.track(new THREE.Quaternion());
				start.copy(this.rifle.quaternion);
				this.rifle.quaternion.copy(q);
				this.rifle.rotateX(1.57);
				const end = this.track(new THREE.Quaternion());
				end.copy(this.rifle.quaternion);
				this.rotateRifle = { start, end, time:0 };
				this.rifle.quaternion.copy( start );
			}
		}
	}
	render() {
		const dt = this.clock.getDelta();
		
		if(this != undefined) this.update(dt);
		this.renderer.render( this.scene, this.camera );
    }
	update(dt:any){
		if (this.mixer) this.mixer.update(dt);
		if (this.rotateRifle !== undefined){
			this.rotateRifle.time += dt;
			if (this.rotateRifle.time > 0.5){
				this.rifle.quaternion.copy( this.rotateRifle.end );
				// delete this.rotateRifle;
			}else{
				this.rifle.quaternion.slerpQuaternions(this.rotateRifle.start, this.rotateRifle.end, this.rotateRifle.time * 2);
			}
		}
		// if (this.isFiring){
		// 	this.aim.visible = false;
		// 	if(this.speed===0)this.action ="firing";
		// 	const elapsedTime = this.game.clock.getElapsedTime() - this.bulletTime;
		// 	if (elapsedTime > 0.6) {
		// 		this.shoot();
		// 		this.aim.rotateX(Math.random() * Math.PI);
		// 		this.aim.visible = true;
		// 		if(this.healthPoint>0)this.healthPoint-=20;//开枪自残
		// 	}
		// }
		// else{
		// 	this.aim.visible = false;
		// }
		// if(this.healthPoint<=0){
		// 	// console.log("gameover")
		// 	this.healthPoint = 100;
		// }
	}
	
	toggleAnimation() {
		const actions_play = ["run", "walk", "firing", "firingwalk", "shot", "walking"]
		if(this.actionName =='idle') {
			
			this.action = actions_play[this.id]
		}
		else {
			this.action = 'idle'
		}
	}
}
