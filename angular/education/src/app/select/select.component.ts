import { AfterViewInit, Component, ElementRef, OnInit } from '@angular/core';
import { NgClass } from '@angular/common'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import { GridHelper } from 'three';
import { animation } from '@angular/animations';
import { Router } from '@angular/router';
@Component({
  selector: 'app-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.css']
})
export class SelectComponent implements AfterViewInit {

	constructor(private el: ElementRef, public router:Router) {}

	private users:User[] = [];
	private lastSelect:number = -1;
	private lastSelectMap:number = -1;
	ngAfterViewInit() {    
		for(let i = 0; i < 6; i++) {
			// if(i > 1) break;
			const user = new User(this.characters[i].name, i, this.el);
			this.users.push(user) 
		}

	}
	ngOnDestroy() {
		for(let i = 0; i < 6; i++) {
			this.users[i].renderer.setAnimationLoop(null );
		}
		
	}
	characters = [
		{id:1, selected:false, name:"BeachBabe"},
		{id:2, selected:false, name:"BusinessMan"},
		{id:3, selected:false, name:"Doctor"},
		{id:4, selected:false, name:"Policeman"},
		{id:5, selected:false, name:"Robber"},
		{id:6, selected:false, name:"BeachBabe"},
	]
	maps = [
		{id:1, selected:false, name:"CQB"},
		{id:2, selected:false, name:"PVE"},
	]
	onSelect(index:any) {
		for( let ch of this.characters) {
			ch.selected = false;
		}
		if(this.lastSelect != -1) {
			this.users[this.lastSelect].toggleAnimation();
		}
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
	healthPoint: number;
	object: any;
	hp: number;
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
    constructor(skin:String, id:number, el:any){
		this.id = id
		const pos = new THREE.Vector3( -6, 0.021, -2);
		const heading = 1*Math.PI;
		let domID = 'scene-container-' + id ;
		const container = el.nativeElement.querySelector('#'+domID);
		
		this.assetsPath = '../../assets/threejs-game/assets/';

		this.clock = new THREE.Clock(); // 用于计算时间差
		// 创建相机，并设置位置和旋转角度
		this.camera = new THREE.PerspectiveCamera( 40, container.clientWidth/container.clientHeight, 0.1, 500 );
		// this.camera.position.set( -6, 1.8, 3 );
		this.camera.position.set( -7, 1.4, -4.5 );
		const target = new THREE.Vector3( -6, 0.8, -2);
		this.camera.lookAt(target);
		let col = 0xada1a1;
		this.scene = new THREE.Scene(); // 创建场景
		this.scene.background = new THREE.Color( col ); // 设置背景颜色
		this.scene.fog = new THREE.Fog( col, 100, 200 ); // 添加雾效

		const ambient = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1); // 创建环境光
		this.scene.add(ambient);

		const light = new THREE.DirectionalLight(); // 创建平行光
		light.position.set( 4, 20, 20 );
		light.target.position.set(-2, 0, 0);
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

		var mesh = new THREE.Mesh( new THREE.PlaneGeometry( 100, 100 ), new THREE.MeshPhongMaterial( { color: 0x999999, depthWrite: false } ) );
		mesh.rotation.x = - Math.PI / 2;
		//mesh.position.y = -100;
		mesh.receiveShadow = true;
		this.scene.add( mesh );

		this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true } ); // 创建渲染器
		this.renderer.shadowMap.enabled = true; // 开启阴影
		this.renderer.setPixelRatio( window.devicePixelRatio );
		this.renderer.setSize( container.clientWidth, container.clientHeight);
		this.renderer.outputEncoding = THREE.sRGBEncoding; // 设置颜色编码格式
		container.appendChild( this.renderer.domElement );

		//USER
        this.root = new THREE.Group();
        this.root.position.copy( pos );
        this.root.rotation.set( 0, heading, 0, 'XYZ' );
        this.game = this;
        this.raycaster = new THREE.Raycaster();

        this.scene.add(this.root);
	    this.load();

        this.tmpVec = new THREE.Vector3();
        this.tmpQuat = new THREE.Quaternion();

		this.speed = 0;
		this.isFiring = false;
		this.isRun = false;
		this.ready = false;
		this.healthPoint = 100;
		// this.object
        //this.initMouseHandler();
		this.initRifleDirection();
		this.hp = 5;
    }

	initRifleDirection(){
		this.rifleDirection = {};

		this.rifleDirection.idle = new THREE.Quaternion(-0.178, -0.694, 0.667, 0.203);
		this.rifleDirection.walk = new THREE.Quaternion( 0.044, -0.772, 0.626, -0.102);
		this.rifleDirection.firingwalk = new THREE.Quaternion(-0.034, -0.756, 0.632, -0.169);
		this.rifleDirection.fpsFiringwalk = new THREE.Quaternion(0.005, -0.789, 0.594, -0.085);
		this.rifleDirection.firing = new THREE.Quaternion( -0.054, -0.750, 0.633, -0.184);
		this.rifleDirection.fpsFiring = new THREE.Quaternion(0.005, -0.789, 0.594, -0.085);
		this.rifleDirection.run = new THREE.Quaternion( 0.015, -0.793, 0.595, -0.131);
		this.rifleDirection.shot = new THREE.Quaternion(-0.082, -0.789, 0.594, -0.138);
	}

    set position(pos){
        this.root.position.copy( pos );
    }

	get position(){
		return this.root.position;
	}

	set firing(mode:any){
		this.isFiring = mode;
		if (mode){
			//console.log(this.speed)
			this.action =  (Math.abs(this.speed) === 0 ) ? "firing" : "firingwalk";
			//console.log(this.action)
			this.bulletTime = this.game.clock.getElapsedTime();
		}else{
			this.action = 'idle';
		}
		//console.log(this.action)
	}
	shoot(){
		if (this.bulletHandler === undefined) this.bulletHandler = this.game.bulletHandler;
		// this.aim.getWorldPosition(this.tmpVec);
		// this.aim.getWorldQuaternion(this.tmpQuat);
		this.camera.getWorldPosition(this.tmpVec);
		// this.root.getWorldPosition(this.tmpVec);
		// let tempVec = new Vector3();
		// this.camera.getWorldPosition(tempVec);
		// this.tmpVec.y = tempVec.y;
		// this.tmpVec.y = this.camera.position.y;
		this.camera.getWorldQuaternion(this.tmpQuat);
		// this.tmpQuat.set(1,0,-1,0);
	}

    // addSphere(){
    //     const geometry = new SphereGeometry( 0.1, 8, 8 );
    //     const material = new MeshBasicMaterial( { color: 0xFF0000 });
    //     const mesh = new Mesh( geometry, material );
    //     this.game.scene.add(mesh);
	// 	this.hitPoint = mesh;
	// 	this.hitPoint.visible = false;
    // }

    load(){
    	const loader = new GLTFLoader( ).setPath(`${this.game.assetsPath}factory/`);
		const dracoLoader = new DRACOLoader();
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
			'eve2.glb',
			// called when the resource is loaded
			gltf => {
				this.root.add( gltf.scene );
                this.object = gltf.scene;
				this.object.frustumCulled = false;

                const scale = 1.2;
                this.object.scale.set(scale, scale, scale);

                this.object.traverse( (child: { isMesh: any; castShadow: boolean; name: string | string[]; }) => {
                    if ( child.isMesh){
                        child.castShadow = true;
						if (child.name.includes('Rifle')) this.rifle = child;
                    }
                });
				if (this.rifle){
					const geometry = new THREE.BufferGeometry().setFromPoints( [ new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 7, 0, 0 ) ] );
					
        			const line = new THREE.Line( geometry );
        			line.name = 'aim';

					this.rifle.add(line);
					line.position.set(0, 0, 0.5);
					this.aim = line;
					line.visible = false;
					const muzzleloader = new GLTFLoader( ).setPath(`${this.game.assetsPath}weapons/`);
					muzzleloader.load(
						'muzzle_flash.glb',
						gltf => {
							this.muzzle = gltf.scene;
							this.aim.add( this.muzzle);
							this.muzzle.rotateY(-Math.PI/2);
							this.muzzle.position.set(7, 0, 0);
							this.muzzle.scale.set(0.9, 0.9, 0.9);		
						}
					);
				}
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
    		},
			// called while loading is progressing
			xhr => {
				// this.loadingBar.update( 'user', xhr.loaded, xhr.total );
			},
			// called when loading has errors
			err => {
				console.error( err );
			}
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
				const start = new THREE.Quaternion();
				start.copy(this.rifle.quaternion);
				this.rifle.quaternion.copy(q);
				this.rifle.rotateX(1.57);
				const end = new THREE.Quaternion();
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
		if (this.isFiring){
			this.aim.visible = false;
			if(this.speed===0)this.action ="firing";
			const elapsedTime = this.game.clock.getElapsedTime() - this.bulletTime;
			if (elapsedTime > 0.6) {
				this.shoot();
				this.aim.rotateX(Math.random() * Math.PI);
				this.aim.visible = true;
				if(this.healthPoint>0)this.healthPoint-=20;//开枪自残
			}
		}
		else{
			this.aim.visible = false;
		}
		if(this.healthPoint<=0){
			// console.log("gameover")
			this.healthPoint = 100;
		}
	}
	
	toggleAnimation() {
		const actions_play = ["run", "walk", "firing", "firingwalk", "shot", "run"]
		if(this.actionName =='idle') {
			
			this.action = actions_play[this.id]
		}
		else {
			this.action = 'idle'
		}
	}
}
