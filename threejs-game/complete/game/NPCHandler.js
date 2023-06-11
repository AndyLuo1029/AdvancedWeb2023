import {NPC} from './NPC.js';
import {GLTFLoader} from '../../libs/three137/GLTFLoader.js';
import {DRACOLoader} from '../../libs/three137/DRACOLoader.js';
import {Skeleton, Raycaster, Vector3} from '../../libs/three137/three.module.js';
import * as THREE from '../../libs/three137/three.module.js';

class NPCHandler{
    constructor( game ){
		this.isMaster = true;
        this.game = game;
		this.loadingBar = this.game.loadingBar;
		this.ready = false;
		this.scene = this.game.currentScene;
		this.scene1Points = [
			new THREE.Vector3(27.03, 0.18, -2.40),	//A
			new THREE.Vector3(22.82, 0.18, 5.2),	//B
			new THREE.Vector3(21.29, 0.18, -6.44),	//C
			new THREE.Vector3(25.90, 0.1824, -6),	//D
			new THREE.Vector3(25.34, 0.18, 5.2), 	//E
		];
		this.scene1Names = [
			"A", "B", "C", "D", "E"
		];
		this.scene2Points = [
			new THREE.Vector3(-5.268219023616988, 0.18245120346546173, -23.93234793402682), //A
			new THREE.Vector3(-3.25240100457063, 0.18245120346546173, -27.181346753886903), //B
			new THREE.Vector3(-3.13490054474453, 0.18245120346546173, -19.197257355713894), //C
			new THREE.Vector3(1.271559098195823, 0.18245120346546173, -19.123218580787793), //D
		];
		this.scene2Names = [
			"A", "B", "C", "D"
		];
		this.npcs = [];
		//console.log(this.game.user)
		let self = this;
		this.game.user.socket.on('npcMessage',function(data){
			//console.log(this.isMaster)
			//console.log(data.id)
			//console.log(self.game.user.socket.id)
			if(data.id!==self.game.user.socket.id){
				self.isMaster=false;
				self.updateNpcs(data.npcsPos);
			}
		})
		this.load();
	}

	updateNpcs(npcsPos) {
		//console.log(this.npcs[0].object.position);
		//console.log(new Vector3(npcsPos[0].x,npcsPos[0].y,npcsPos[0].z))
		console.log(this.npcs[0].object.position)
		this.npcs[0].position =new Vector3(npcsPos[0].x,npcsPos[0].y,npcsPos[0].z)
		//console.log(this.npcs[0].object.position);
	}

	initMouseHandler(){
		const raycaster = new Raycaster();
    	this.game.renderer.domElement.addEventListener( 'click', raycast, false );
			
    	const self = this;
    	const mouse = { x:0, y:0 };
    	
    	function raycast(e){
    		
			mouse.x = ( e.clientX / window.innerWidth ) * 2 - 1;
			mouse.y = - ( e.clientY / window.innerHeight ) * 2 + 1;

			//2. set the picking ray from the camera position and mouse coordinates
			raycaster.setFromCamera( mouse, self.game.camera );    

			//3. compute intersections
			const intersects = raycaster.intersectObject( self.game.navmesh );
			
			if (intersects.length>0){
				const pt = intersects[0].point;
				console.log(pt);
				self.npcs[0].newPath(pt, true);
			}	
		}
    }

    load(){
        const loader = new GLTFLoader( ).setPath(`${this.game.assetsPath}factory/`);
		const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath( `${this.game.assetsPath}../libs/three137/draco/` );
        loader.setDRACOLoader( dracoLoader );
        this.loadingBar.visible = true;
		
		// // Load a GLTF resource
		// loader.load(
		// 	// resource URL
		// 	`swat-guy.glb`,
		// 	// called when the resource is loaded
		// 	gltf => {
		// 		if (this.game.pathfinder){
		// 			this.initNPCs(gltf);
		// 		}else{
		// 			this.gltf = gltf;
		// 		}
		// 	},
		// 	// called while loading is progressing
		// 	xhr => {

		// 		this.loadingBar.update( 'swat-guy', xhr.loaded, xhr.total );

		// 	},
		// 	// called when loading has errors
		// 	err => {

		// 		console.error( err );

		// 	}
		// );

		let currentNPCCounts;

		if (this.scene == "scene1"){
			currentNPCCounts = this.scene1Points.length;
		}
		else if(this.scene == "scene2"){
			currentNPCCounts = this.scene2Points.length;
		}
		else{
			// multi mode NPC nums
			currentNPCCounts = 4;
		}

		// Load a GLTF resource
		for (let i=0; i<currentNPCCounts; i++){
			loader.load(
				// resource URL
				`swat-guy.glb`,
				// called when the resource is loaded
				gltf => {
					if (this.scene == "scene1"){
						this.initScene1Npcs(gltf, i);
					}
					else if(this.scene == "scene2"){
						this.initScene2Npcs(gltf, i);
					}
					else{
						// TODO: multi mode
						this.initNPCs(gltf);
					}
					this.ready = true;
					this.game.startRendering();
				},
				// called while loading is progressing
				xhr => {
	
					this.loadingBar.update( 'swat-guy', xhr.loaded, xhr.total );
	
				},
				// called when loading has errors
				err => {
	
					console.error( err );
	
				}
			);
		}
	}

	initScene1Npcs(gltf = this.gltf, i){

		const object = gltf.scene;

		object.traverse(function(child){
			if (child.isMesh){
				child.castShadow = true;
				child.frustumCulled = false;
				child.visible = true; 
			}
		});

		const options = {
			object: object,
			speed: 0.8,
			animations: gltf.animations,
			waypoints: this.waypoints,
			app: this.game,
			showPath: false,
			zone: 'factory',
			name: this.scene1Names[i],
		};

		const npc = new NPC(options);

		npc.object.position.copy(this.scene1Points[i]);

		const player = npc.object;

		if(i == 0){
			// A: rotate 90
			player.rotation.y = -Math.PI/2;	
		}
		else if(i == 1 || i == 4){
			// B and E : rotate 180
			player.rotation.y = Math.PI;
		}
		else if(i == 3){
			// D : rotate 45
			player.rotation.y = -Math.PI/4;
		}

		// set action
		npc.action = 'idle';
		
		this.npcs.push(npc)

		this.loadingBar.visible = !this.loadingBar.loaded;
	}

	initScene2Npcs(gltf = this.gltf, i){

		const object = gltf.scene;

		object.traverse(function(child){
			if (child.isMesh){
				child.castShadow = true;
				child.frustumCulled = false;
				child.visible = true; 
			}
		});

		const options = {
			object: object,
			speed: 0.8,
			animations: gltf.animations,
			waypoints: this.waypoints,
			app: this.game,
			showPath: false,
			zone: 'factory',
			name: this.scene2Names[i],
		};

		const npc = new NPC(options);

		npc.object.position.copy(this.scene2Points[i]);

		const player = npc.object;

		player.rotation.y = -Math.PI/2;	

		// set action
		npc.action = 'idle';
		
		this.npcs.push(npc)

		this.loadingBar.visible = !this.loadingBar.loaded;

	}
    
	// init npcs with paths
	initNPCs(gltf = this.gltf){
		this.waypoints = this.game.waypoints;
		
		const object = gltf.scene;

		object.traverse(function(child){
			if (child.isMesh){
				child.castShadow = true;
				child.frustumCulled = false;
				child.visible = true; // Add this line to hide the NPC mesh
			}
		});

		const options = {
			object: object,
			speed: 0.8,
			animations: gltf.animations,
			waypoints: this.waypoints,
			app: this.game,
			showPath: false,
			zone: 'factory',
		};

		const npc = new NPC(options);


		//重要
		this.pos = this.randomWaypoint;
		npc.object.position.copy(this.pos);
		this.path = this.randomWaypoint;
		//console.log(this.path)
		npc.newPath(this.path);


		this.npcs.push(npc);

		this.loadingBar.visible = !this.loadingBar.loaded;
	}

	cloneGLTF(gltf){
	
		const clone = {
			animations: gltf.animations,
			scene: gltf.scene.clone(true)
		  };
		
		const skinnedMeshes = {};
		
		gltf.scene.traverse(node => {
			if (node.isSkinnedMesh) {
			  skinnedMeshes[node.name] = node;
			}
		});
		
		const cloneBones = {};
		const cloneSkinnedMeshes = {};
		
		clone.scene.traverse(node => {
			if (node.isBone) {
			  cloneBones[node.name] = node;
			}
			if (node.isSkinnedMesh) {
			  cloneSkinnedMeshes[node.name] = node;
			}
		});
		
		for (let name in skinnedMeshes) {
			const skinnedMesh = skinnedMeshes[name];
			const skeleton = skinnedMesh.skeleton;
			const cloneSkinnedMesh = cloneSkinnedMeshes[name];
			const orderedCloneBones = [];
			for (let i = 0; i < skeleton.bones.length; ++i) {
				const cloneBone = cloneBones[skeleton.bones[i].name];
				orderedCloneBones.push(cloneBone);
			}
			cloneSkinnedMesh.bind(
				new Skeleton(orderedCloneBones, skeleton.boneInverses),
				cloneSkinnedMesh.matrixWorld);
		}
		
		return clone;

	}
    
    get randomWaypoint(){
		const index = Math.floor(Math.random()*this.waypoints.length);
		//const index = 0;
		return this.waypoints[index];
	}

    update(dt){
        if (this.npcs) {
			if(this.isMaster){
				this.npcs.forEach( npc => npc.update(dt) );
				let temP=[];
				this.npcs.forEach(function(npc){
					temP.push(npc.object.position)
				})
				this.npcP = temP;
			}
		}
		if(this.isMaster){

			this.game.user.socket.emit('updateNpc',{
				npcsPos:this.npcP
			})
		}


    }
}

export { NPCHandler };