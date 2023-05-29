import { AfterViewInit, Component, ElementRef, OnInit } from '@angular/core';
import { NgClass } from '@angular/common'
import * as THREE from 'three'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
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

	private game:Game[] = [];
	private lastSelect:number = -1;
	private lastSelectMap:number = -1;
	ngAfterViewInit() {    
		for(let i = 0; i < 6; i++) {
			// if(i > 1) break;
			const game = new Game(this.characters[i].name, i, this.el);
			this.game.push(game) 
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
			this.game[this.lastSelect].toggleAnimation();
		}
		this.lastSelect = index
		this.game[index].toggleAnimation();
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

interface Animations {
  'Idle'?: any;
  // 'Pointing Gesture'?: any;
}
class Game{
	container: any;
	player:any;
	animations:Animations;
	stats: any;
	controls: any;
	camera: any;
	scene: any;
	renderer: any;
	anims: string[];
	assetsPath: string;
	clock: THREE.Clock;
	skin:String;
	id:number;
	constructor(skin:String, id:number, el:any){
    
		this.container;
		this.player = { };
    	this.animations = { };
		this.stats;
		this.controls;
		this.camera;
		this.scene;
		this.renderer;
		this.skin = skin;
		this.id = id;
		let domID = 'scene-container-' + this.id ;
		// console.log(domID)
		// this.container = document.getElementsByClassName("sceene-containers")[id];
		this.container = el.nativeElement.querySelector('#'+domID)
		// console.log(this.container)
		const game = this;
		this.anims = ['Pointing Gesture'];
        
		this.assetsPath = '../../assets/';
		
		this.clock = new THREE.Clock();
        
    this.init();

		window.onerror = function(error){
			console.error(JSON.stringify(error));
		}
	}
	
	init() {

		this.camera = new THREE.PerspectiveCamera( 45, this.container.clientWidth/this.container.clientHeight, 1, 2000 );
		this.camera.position.set(112, 100, 600);
        this.camera.lookAt(0, 150, 0);
		this.scene = new THREE.Scene();
		this.scene.background = new THREE.Color( 0xa0a0a0 );
		this.scene.fog = new THREE.Fog( 0xa0a0a0, 700, 1800 );

		let light = new THREE.HemisphereLight( 0xffffff, 0x444444 );
		light.position.set( 0, 200, 0 );
		this.scene.add( light );

		let light2 = new THREE.DirectionalLight( 0xffffff );
		light2.position.set( 0, 200, 100 );
		light2.castShadow = true;
		light2.shadow.camera.top = 180;
		light2.shadow.camera.bottom = -100;
		light2.shadow.camera.left = -120;
		light2.shadow.camera.right = 120;
		this.scene.add( light2 );

		// // ground
		var mesh = new THREE.Mesh( new THREE.PlaneGeometry( 4000, 4000 ), new THREE.MeshPhongMaterial( { color: 0x999999, depthWrite: false } ) );
		mesh.rotation.x = - Math.PI / 2;
		//mesh.position.y = -100;
		mesh.receiveShadow = true;
		this.scene.add( mesh );

		// var grid:any = new THREE.GridHelper( 4000, 40, 0x000000, 0x000000 );
		// //grid.position.y = -100;
		// grid.material.opacity = 0.2;
		// grid.material.transparent = true;
		// this.scene.add( grid );

		// model
		const loader = new FBXLoader();
		const game = this;
		
		loader.load( `${this.assetsPath}fbx/people/${this.skin}.fbx`, function ( object:any ) {

			object.mixer = new THREE.AnimationMixer( object );
			game.player.mixer = object.mixer;
			game.player.root = object.mixer.getRoot();
			
			object.name = game.skin;
					
			object.traverse( function ( child:any ) {
				if ( child.isMesh ) {
					child.castShadow = true;
					child.receiveShadow = false;		
				}
			} );
			
			const tLoader = new THREE.TextureLoader();
			tLoader.load(`${game.assetsPath}images/SimplePeople_${game.skin}_White.png`, function(texture){
					object.traverse( function ( child:any ) {
						if ( child.isMesh ){
							child.material.map = texture;
						}
					} );
				});
            // object.position.set(0,0,0);
			// object.quaternion.set(0,0,0);
			game.scene.add(object);
			game.player.object = object;
			game.animations.Idle = object.animations[0];
            
      		game.loadNextAnim(loader);
		} );
		
		this.renderer = new THREE.WebGLRenderer( { antialias: true } );
		this.renderer.setPixelRatio( window.devicePixelRatio );
		this.renderer.setSize( this.container.clientWidth, this.container.clientHeight);
		this.renderer.shadowMap.enabled = true;
		this.container.appendChild( this.renderer.domElement );
        
        // this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        // this.controls.target.set(0, 150, 0);
        // this.controls.update();
			
		window.addEventListener( 'resize', function(){ game.onWindowResize(); }, false );
	}
	
  loadNextAnim(loader:any){
		let anim = this.anims.pop();
		const game = this;
		loader.load( `${this.assetsPath}fbx/anims/${anim}.fbx`, function( object:any ){
			if(anim != undefined) {
        game.animations[anim as keyof typeof game.animations] = object.animations[0];
      }
			if (game.anims.length>0){
				game.loadNextAnim(loader);
			}else{
				// delete game.anims;
				game.action = "Idle";
				game.animate();
			}
		});	
	}
    
	onWindowResize() {
		this.camera.aspect = this.container.clientWidth/this.container.clientHeight;
		this.camera.updateProjectionMatrix();

		this.renderer.setSize( this.container.clientWidth, this.container.clientHeight );

	}

  set action(name){
		const action = this.player.mixer.clipAction( this.animations[name as keyof typeof this.animations] );
    	action.time = 0;
		this.player.mixer.stopAllAction();
		this.player.action = name;
		this.player.actionTime = Date.now();
        this.player.actionName = name;
		
		action.fadeIn(0.5);	
		action.play();
	}
    
    get action(){
        if (this.player===undefined || this.player.actionName===undefined) return "";
        return this.player.actionName;
    }
    
  toggleAnimation(){
      if (this.action=="Idle"){
          this.action = "Pointing Gesture";
      }else{
          this.action = "Idle";
      }
  }
    
	animate() {
		const game = this;
		const dt = this.clock.getDelta();
		
		requestAnimationFrame( function(){ game.animate(); } );
		
		if (this.player.mixer!==undefined) this.player.mixer.update(dt);
		
		this.renderer.render( this.scene, this.camera );

	}
}
