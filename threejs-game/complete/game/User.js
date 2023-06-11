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
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

class User{
    constructor(game, pos, heading,id,name, model){

		this.role = game.userRole;
		if(model != undefined) this.role = model; // 远程用户选择不同模型
		this.colors = [0xffffff, 0xf57a3d, 0x00ccff];
        this.root = new Group();
        this.root.position.copy( pos );
        this.root.rotation.set( 0, heading, 0, 'XYZ' );

		this.shootCount = 0;
		this.hitCount = 0;

        this.game = game;

		if(id!=undefined){
			this.id = id;
			this.nameDiv = document.createElement('div');
			this.nameDiv.textContent = name;
			this.nameDiv.style.color = 'white';
			this.nameDiv.style.fontSize = '10px';
			this.nameDiv.style.textAlign = 'center';
			this.nameDiv.style.width = '100px';
			this.nameDiv.style.height = '100px';
			this.nameDiv.style.lineHeight = '100px';
			this.nameObject = new CSS2DObject(this.nameDiv);
		}

        this.camera = game.camera;
        this.raycaster = new Raycaster();

        game.scene.add(this.root);

        this.loadingBar = game.loadingBar;

        this.load();

        this.tmpVec = new Vector3();
        this.tmpQuat = new Quaternion();

		this.speed = 0;
		this.isFiring = false;
		this.isRun = false;
		this.ready = false;
		this.healthPoint = 100;
		this.object
        //this.initMouseHandler();
		this.initRifleDirection();
		this.hp = 5;


    }

	initRifleDirection(){
		if(this.role <3){
			this.rifleDirection = {};

			this.rifleDirection.idle = new Quaternion(-0.178, -0.694, 0.667, 0.203);
			this.rifleDirection.walk = new Quaternion( 0.044, -0.772, 0.626, -0.102);
			this.rifleDirection.firingwalk = new Quaternion(-0.034, -0.756, 0.632, -0.169);
			this.rifleDirection.fpsFiringwalk = new Quaternion(0.005, -0.789, 0.594, -0.085);
			this.rifleDirection.firing = new Quaternion( -0.054, -0.750, 0.633, -0.184);
			this.rifleDirection.fpsFiring = new Quaternion(0.005, -0.789, 0.594, -0.085);
			this.rifleDirection.run = new Quaternion( 0.015, -0.793, 0.595, -0.131);
			this.rifleDirection.shot = new Quaternion(-0.082, -0.789, 0.594, -0.138);
		}
	}

    set position(pos){
        this.root.position.copy( pos );
    }

	get position(){
		return this.root.position;
	}

	set firing(mode){
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
		this.perspective = this.game.controller.perspective;
		if (this.bulletHandler === undefined) {
			if(this==this.game.user)
				this.bulletHandler = this.game.bulletHandler;
			else {
				let user = this;
				this.game.remoteBulletHandlers.forEach(function(bh){
					if(bh.user===user){
						user.bulletHandler = bh;
					}

				});
			}
		}
		if(this.perspective == 3){
			this.root.getWorldPosition(this.tmpVec);
			this.tmpVec.y += 1.5;
		}
		else{
			this.root.getWorldPosition(this.tmpVec);
		}

		if(this==this.game.user){this.camera.getWorldQuaternion(this.tmpQuat);console.log("本地",this.tmpQuat)}
		else {
			console.log(this.tmpQuat)
		}
		this.bulletHandler.createBullet( this.tmpVec, this.tmpQuat );

		this.bulletTime = this.game.clock.getElapsedTime();
		this.shootCount++;
	}

    addSphere(){
        const geometry = new SphereGeometry( 0.1, 8, 8 );
        const material = new MeshBasicMaterial( { color: 0xFF0000 });
        const mesh = new Mesh( geometry, material );
        this.game.scene.add(mesh);
		this.hitPoint = mesh;
		this.hitPoint.visible = false;
    }

    load(){


    	const loader = new GLTFLoader( ).setPath(`${this.game.assetsPath}factory/`);
		const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath( `${this.game.assetsPath}../libs/three137/draco/` );
        loader.setDRACOLoader( dracoLoader );
		const user = this;

		loader.load( 'Idle.glb', function( object ){
			user.anim=	object.animations[0]
		});
		// console.log(this.animations);
		let url, color, avatarScale;
		if(this.role < 3){
			url = 'eve2.glb';
			avatarScale = 1.1;
		}
		else {
			url ='swat-guy2.glb';
			avatarScale = 0.9;
		}

		switch(this.role){
			case 0:
				color = this.colors[0];
				break;
			case 1:
				color = this.colors[1];
				break;
			case 2:
				color = this.colors[2];
				break;
			case 3:
				color = this.colors[0];
				break;
			case 4:
				color = this.colors[1];
				break;
			case 5:
				color = this.colors[2];
				break;
		}

        //Load a glTF resource
		loader.load(
			// resource URL
			url,
			// called when the resource is loaded
			gltf => {
				this.root.add( gltf.scene );
                this.object = gltf.scene;
				this.object.frustumCulled = false;

                this.object.scale.set(avatarScale, avatarScale, avatarScale);

                this.object.traverse( child => {
                    if ( child.isMesh){
						child.material.color.set(color);
                        child.castShadow = true;
						if (child.name.includes('Rifle')) this.rifle = child;
                    }
                });
				if (this.rifle){
					const geometry = new BufferGeometry().setFromPoints( [ new Vector3( 0, 0, 0 ), new Vector3( 7, 0, 0 ) ] );
					
        			const line = new Line( geometry );
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

				if(this.nameObject!=undefined){
					//this.object.add(this.nameObject);
					this.root.add(this.nameObject);
					this.nameObject.position.set(0, 1.8, 0);
					this.nameObject.layers.set(0);
				}

                this.animations = {};

                gltf.animations.forEach( animation => {
					if(animation.name.toLowerCase()=='walking')this.animations['walk']=animation;
                    else this.animations[animation.name.toLowerCase()] = animation;

					// console.log(this.animations);
					//console.log(animation.name.toLowerCase())
                })
				//this.animations['idle']=user.anim;
				//console.log(this.animations)
                this.mixer = new AnimationMixer(gltf.scene);

                this.action = 'idle';

				this.ready = true;

				this.game.startRendering();

    		},
			// called while loading is progressing
			xhr => {
				this.loadingBar.update( 'user', xhr.loaded, xhr.total );
			},
			// called when loading has errors
			err => {
				console.error( err );
			}

		);
	}

    set action(name){
		this.setAction(name);
	}
	setAction(name){
		if (this.actionName == name.toLowerCase()) return;

		// console.log(`User action:${this.id}${name}`);
		if(name.toLowerCase()==="run"){
			this.isRun =true;
		}
		else{
			this.isRun = false;
		}

		const clip = this.animations[name.toLowerCase()];

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
			if(this.perspective == 1){
				if(name == 'firingwalk'){
					q = this.rifleDirection['fpsFiringwalk'];
					// console.log("fpsFiringwalk");
				}
				else if(name == 'firing'){
					q = this.rifleDirection['fpsFiring'];
					// console.log("fpsFiring");
				}
			}
			else{
				q = this.rifleDirection[name.toLowerCase()];
			}

			if (q!==undefined){
				const start = new Quaternion();
				start.copy(this.rifle.quaternion);
				this.rifle.quaternion.copy(q);
				this.rifle.rotateX(1.57);
				const end = new Quaternion();
				end.copy(this.rifle.quaternion);
				this.rotateRifle = { start, end, time:0 };
				this.rifle.quaternion.copy( start );
			}
		}
	}
	getHit(bullet){
		//判断子弹是否与自己相交（hitbox相交）若相交则
		//this.healthPoint-=bullet.damage;
	}
	update(dt){


		this.perspective = this.game.controller.perspective;
		if (this.mixer) this.mixer.update(dt);
		if (this.rotateRifle !== undefined){
			this.rotateRifle.time += dt;
			if (this.rotateRifle.time > 0.5){
				this.rifle.quaternion.copy( this.rotateRifle.end );
				delete this.rotateRifle;
			}else{
				this.rifle.quaternion.slerpQuaternions(this.rotateRifle.start, this.rotateRifle.end, this.rotateRifle.time * 2);
			}
		}
		if (this.isFiring){
			this.aim.visible = false;
			if(this.speed===0)this.action ="firing";
			const elapsedTime = this.game.clock.getElapsedTime() - this.bulletTime;
			//console.log(this.game.clock.getElapsedTime())
			//console.log(this.bulletTime)
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

		if (this.game.remoteData.length>0&&this.game.user!==this&&this.ready){
			//let found = false;
			for(let data of this.game.remoteData){
				if (data.id != this.id) continue;
				//Found the player
				//console.log(data.id)
				//const dy =this.root.rotation.y-data.heading;
				this.root.position.set( data.x, data.y, data.z );

				//console.log(data.rotate)
				//this.root.rotation = data.rotate
				// console.log(data.heading)
				// console.log(dy)
				//this.root.rotation.y = data.heading;
				//console.log(this.root)
				if(data.hasOwnProperty('rotate')&&data.rotate.hasOwnProperty('x'))
				 	this.root.rotation.set( data.rotate.x, data.rotate.y, data.rotate.z, 'XYZ' );
				//console.log(data.q);
				if(data.q!==undefined)
					this.tmpQuat =new Quaternion(data.q._x,data.q._y,data.q._z,data.q._w)
				//this.root.rotateOnWorldAxis(new Vector3(0, 1, 0), dy);
				//const euler = new THREE.Euler(0, data.heading, 0);
				//this.object.quaternion.setFromEuler( euler );
				//this.actionName = data.action;
				this.setAction(data.action);
				if(this.actionName=="firing"||this.actionName=="firewalk"){
					this.isFiring = true;
					if(this.bulletTime===0||this.bulletTime===undefined)this.bulletTime = this.game.clock.getElapsedTime();
				}
				else {this.isFiring=false;this.bulletTime=0;}
				//console.log(this.actionName)
				//found = true;
			}
		}
	}
}


export { User };