import {NPC} from './NPC.js';
// import {NPC} from '../NPC.js';
import {GLTFLoader} from '../../libs/three137/GLTFLoader.js';
import {DRACOLoader} from '../../libs/three137/DRACOLoader.js';
import {Skeleton, Raycaster} from '../../libs/three137/three.module.js';
import * as THREE from '../../libs/three137/three.module.js';

class NPCHandler{
    constructor( game ){
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

		];
		this.npcs = [];
		this.load();
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
        dracoLoader.setDecoderPath( '../../libs/three137/draco/' );
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

		let currentNPCPosition, currentFunc;

		if (this.scene == "scene1"){
			currentNPCPosition = this.scene1Points;
		}
		else if(this.scene == "scene2"){
			currentNPCPosition = this.scene2Points;
		}
		else{
			// TODO: multi mode
		}

		// Load a GLTF resource
		for (let i=0; i<currentNPCPosition.length; i++){
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

	initScene2Npcs(){

	}
    
	// init npcs with paths
	initNPCs(gltf = this.gltf){
        
		const gltfs = [gltf];
			
		for(let i=0; i<3; i++) gltfs.push(this.cloneGLTF(gltf));

		let i = 0;
		
		gltfs.forEach(gltf => {
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
				name: 'swat-guy',
			};

			const npc = new NPC(options);

			npc.object.position.copy(this.randomWaypoint);
			// npc.object.position.copy(new THREE.Vector3(21.29, 0.18, -7.44));

			npc.newPath(this.randomWaypoint);
			
			this.npcs.push(npc);
			
		});

		this.loadingBar.visible = !this.loadingBar.loaded;
		this.ready = true;

		this.game.startRendering();
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
		return this.waypoints[index];
	}

    update(dt){
        if (this.npcs) this.npcs.forEach( npc => npc.update(dt) );
    }
}

export { NPCHandler };