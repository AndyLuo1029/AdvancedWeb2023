function include(file) {
  
	var script  = document.createElement('script');
	script.src  = file;
	script.type = 'text/javascript';
	script.defer = true;
	// console.log(1)
	document.getElementsByTagName('head').item(0).appendChild(script);
	
}
// include("https://code.jquery.com/jquery-1.11.1.js")
// include("https://cdnjs.cloudflare.com/ajax/libs/three.js/92/three.min.js")
// // include("/socket.io/socket.io.js")
// include("../../assets/libs/inflate.min.js")
// include("../../assets/libs/FBXLoader.js")
// include("../../assets/libs/Detector.js")
// include("../../assets/libs/toon3d.js")

export default class Game{
	constructor(socket){
		if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

		this.modes = Object.freeze({
			NONE:   Symbol("none"),
			PRELOAD: Symbol("preload"),
			INITIALISING:  Symbol("initialising"),
			CREATING_LEVEL: Symbol("creating_level"),
			ACTIVE: Symbol("active"),
			GAMEOVER: Symbol("gameover")
		});
		this.mode = this.modes.NONE;
		this.socket = socket
		this.domElement

		this.container;
		this.player;
		this.cameras;
		this.camera;
		this.scene;
		this.renderer;
		this.animations = {};
		this.assetsPath = '../assets/';
		
		this.remotePlayers = [];
		this.remoteColliders = [];
		this.initialisingPlayers = [];
		this.remoteData = [];
		
		this.messages = { 
			text:[ 
			"Welcome to Blockland",
			"GOOD LUCK!"
			],
			index:0
		}
		
		this.container = document.createElement( 'div' );
		this.container.style.height = '100%';
		document.body.appendChild( this.container );
		
		const sfxExt = SFX.supportsAudioType('mp3') ? 'mp3' : 'ogg';
        
		const game = this;
		this.anims = ['Walking', 'Walking Backwards', 'Turn', 'Running', 'Pointing', 'Talking', 'Pointing Gesture'];
		
		const options = {
			assets:[
				`${this.assetsPath}images/nx.jpg`,
				`${this.assetsPath}images/px.jpg`,
				`${this.assetsPath}images/ny.jpg`,
				`${this.assetsPath}images/py.jpg`,
				`${this.assetsPath}images/nz.jpg`,
				`${this.assetsPath}images/pz.jpg`
			],
			oncomplete: function(){
				game.init();
			}
		}
		
		this.anims.forEach( function(anim){ options.assets.push(`${game.assetsPath}fbx/anims/${anim}.fbx`)});
		options.assets.push(`${game.assetsPath}fbx/town.fbx`);
		
		this.mode = this.modes.PRELOAD;
		
		this.clock = new THREE.Clock();

		const preloader = new Preloader(options);
		
		window.onError = function(error){
			console.error(JSON.stringify(error));
		}
	}
	
	initSfx(){
		this.sfx = {};
		this.sfx.context = new (window.AudioContext || window.webkitAudioContext)();
		this.sfx.gliss = new SFX({
			context: this.sfx.context,
			src:{mp3:`${this.assetsPath}sfx/gliss.mp3`, ogg:`${this.assetsPath}sfx/gliss.ogg`},
			loop: false,
			volume: 0.3
		});
	}
	
	set activeCamera(object){
		if(object == this.cameras.first) {
			this.player.object.visible = false
		}
		else {
			this.player.object.visible = true
		}
		this.cameras.active = object;
	}
	
	init() {
		this.mode = this.modes.INITIALISING;

		this.camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 200000 );
		
		this.scene = new THREE.Scene();
		this.scene.background = new THREE.Color( 0x00a0f0 );

		const ambient = new THREE.AmbientLight( 0xaaaaaa );
        this.scene.add( ambient );

        const light = new THREE.DirectionalLight( 0xaaaaaa );
        light.position.set( 30, 100, 40 );
        light.target.position.set( 0, 0, 0 );

        light.castShadow = true;

		this.tmpVec = new THREE.Vector3();
		this.tmpVec3 = new THREE.Vector3();

		
        

	
		this.isLocked = false;

		
		const lightSize = 500;
        light.shadow.camera.near = 1;
        light.shadow.camera.far = 500;
		light.shadow.camera.left = light.shadow.camera.bottom = -lightSize;
		light.shadow.camera.right = light.shadow.camera.top = lightSize;

        light.shadow.bias = 0.0039;
        light.shadow.mapSize.width = 1024;
        light.shadow.mapSize.height = 1024;
		
		this.sun = light;
		this.scene.add(light);

		// model
		const loader = new THREE.FBXLoader();
		const game = this;
		
		this.player = new PlayerLocal(this);
		// this.yawObject.rotation.set(this.player.object.quaternion)
		this.loadEnvironment(loader);
		
		this.speechBubble = new SpeechBubble(this, "", 150);
		this.speechBubble.mesh.position.set(0, 350, 0);
		
		// this.joystick = new JoyStick({
		// 	onMove: this.playerControl,
		// 	game: this
		// });
		
		this.renderer = new THREE.WebGLRenderer( { antialias: true } );
		this.renderer.setPixelRatio( window.devicePixelRatio );
		this.renderer.setSize( window.innerWidth, window.innerHeight );
		this.renderer.shadowMap.enabled = true;
		this.container.appendChild( this.renderer.domElement );
		
		if ('ontouchstart' in window){
			window.addEventListener( 'touchdown', (event) => game.onMouseDown(event), false );
		}else{
			window.addEventListener( 'mousedown', (event) => game.onMouseDown(event), false );	
		}
		
		window.addEventListener( 'resize', () => game.onWindowResize(), false );

		this.keys = { 'w': false, 'a': false, 's': false, 'd': false };
		window.addEventListener('keydown', function(e) {
			if (e.key in game.keys) {
				game.keys[e.key] = true;
				game.move()
			}
			if (e.key == 't') {
				if(game.currentCamera == 'chat') return;
				if(game.currentCamera == 'back') {
					// console.log(game.yawObject.getWorldDirection())
					// console.log(game.player.object.getWorldDirection())
					// console.log(game.yawObject.getWorldDirection())
					// console.log(game.camera.getWorldDirection())
					// console.log(game.camera.getWorldDirection())
					game.currentCamera = 'first'
					game.pitchObject.rotation.x = 0
					game.activeCamera = game.cameras.first
					
					
					game.camera.rotation.set(0,0,0)
					game.camera.rotateY(Math.PI)
		
					// game.player.object.visible = false
					// clear transparent object 
					if (game.seethrough){
						game.seethrough.forEach( child => {
							child.material.transparent = false;
							child.material.opacity = 1;
							//child.visible = true;
						});
						delete game.seethrough;
					}
				}
				else if(game.currentCamera == 'first') {
					game.currentCamera = 'back'
					game.pitchObject.rotation.x = 0
					game.activeCamera = game.cameras.back
					// game.player.object.visible = true
				}
			}
		}, false)

		window.addEventListener('keyup', function(e) {
			if (e.key in game.keys) {
				game.keys[e.key] = false;
				game.move()
			}
		}, false)

		this.domElement = document.body;
		// this.domElement.addEventListener('click', this.domElement.requestPointerLock);
		document.addEventListener( 'pointerlockchange', this.onPointerlockChange.bind(this), false );
        document.addEventListener( 'pointerlockerror', this.onPointerlockError.bind(this), false );
        document.addEventListener( 'mousemove', this.onMouseMove.bind(this), false);
		// console.log(game.yawObject.getWorldDirection())
					// console.log(game.camera.getWorldDirection())
		// console.log(game.yawObject)
	}
	
	loadEnvironment(loader){
		const game = this;
		loader.load(`${this.assetsPath}fbx/town.fbx`, function(object){
			game.environment = object;
			game.colliders = [];
			game.scene.add(object);
			object.traverse( function ( child ) {
				if ( child.isMesh ) {
					if (child.name.startsWith("proxy")){
						game.colliders.push(child);
						child.material.visible = false;
					}else{
						child.castShadow = true;
						child.receiveShadow = true;
					}
				}
			} );
			
			const tloader = new THREE.CubeTextureLoader();
			tloader.setPath( `${game.assetsPath}/images/` );

			var textureCube = tloader.load( [
				'px.jpg', 'nx.jpg',
				'py.jpg', 'ny.jpg',
				'pz.jpg', 'nz.jpg'
			] );

			game.scene.background = textureCube;
			
			game.loadNextAnim(loader);
		})
	}

	loadNextAnim(loader){
		let anim = this.anims.pop();
		const game = this;
		loader.load( `${this.assetsPath}fbx/anims/${anim}.fbx`, function( object ){
			game.player.animations[anim] = object.animations[0];
			if (game.anims.length>0){
				game.loadNextAnim(loader);
			}else{
				delete game.anims;
				game.action = "Idle";
				game.mode = game.modes.ACTIVE;
				game.animate();
			}
		});	
	}
	
	playerControl(forward, turn){
		turn = -turn;
		if (forward>0.3){
			if (this.player.action!='Walking' && this.player.action!='Running') this.player.action = 'Walking';
		}else if (forward<-0.3){
			if (this.player.action!='Walking Backwards') this.player.action = 'Walking Backwards';
		}else{
			forward = 0;
			if (Math.abs(turn)>0.1){
				if (this.player.action != 'Turn') this.player.action = 'Turn';
			}else if (this.player.action!="Idle"){
				this.player.action = 'Idle';
			}
		}
		
		if (forward==0 && turn==0){
			delete this.player.motion;
		}else{
			this.player.motion = { forward, turn }; 
		}
		
		this.player.updateSocket();
	}
	
	seeUser(pos){
		if (this.seethrough){
			this.seethrough.forEach( child => {
				child.material.transparent = false;
				child.material.opacity = 1;
				//child.visible = true;
			});
			delete this.seethrough;
		}
		const raycaster = new THREE.Raycaster()
		this.tmpVec3.copy(this.player.object.position).add(new THREE.Vector3(0,50,0)).sub(pos).normalize();
		
		raycaster.set(pos, this.tmpVec3);

		const intersects = raycaster.intersectObjects(this.environment.children, true);
		let userVisible = true;
		
		if (intersects.length>0){
			const dist = this.tmpVec3.copy(this.player.object.position).distanceTo(pos);
			this.seethrough = [];
			intersects.some( intersect => {
				if (intersect.distance < dist){
					this.seethrough.push(intersect.object);
					//intersect.object.visible = false;
					intersect.object.material.transparent = true;
					intersect.object.material.opacity = 0.3;
				}else{
					return true;
				}
			})
			
			
		}

		return userVisible;
	}

	createCameras(){
		const offset = new THREE.Vector3(0, 80, 0);
		const front = new THREE.Object3D();
		front.position.set(112, 100, 600);
		front.parent = this.player.object;
		const back = new THREE.Object3D();
		back.position.set(0, 300, -1050);
		back.parent = this.player.object;
		const chat = new THREE.Object3D();
		chat.position.set(0, 200, -450);
		chat.parent = this.player.object;
		const wide = new THREE.Object3D();
		wide.position.set(178, 139, 1665);
		wide.parent = this.player.object;
		const overhead = new THREE.Object3D();
		overhead.position.set(0, 400, 0);
		overhead.parent = this.player.object;
		const collect = new THREE.Object3D();
		collect.position.set(40, 82, 94);
		collect.parent = this.player.object;
		const first = new THREE.Object3D();
		first.position.set(0, 250, 0);
		first.parent = this.player.object;
		this.cameras = { front, back, wide, overhead, collect, chat, first};
		this.activeCamera = this.cameras.back;	
		this.currentCamera = 'back'

		// 将camera添加到pitchObject, 使camera沿水平轴做旋转
		this.pitchObject = new THREE.Object3D();
		this.pitchObject.add(this.camera);
		// this.camera.rotation.set(0, 0, Math.PI);
		this.camera.position.set(0, 0, 0);
		
		// 将pitObject添加到yawObject, 使camera沿竖直轴旋转
		this.yawObject = new THREE.Object3D();
		this.yawObject.add(this.pitchObject);
		this.pitchObject.rotation.set(0, 0, 0);
		this.pitchObject.position.set(0, 0, 0);
		
		this.yawObject.position.set(3122, 0, -173);
		this.camera.rotateY(Math.PI)
		// this.yawObject.rotation.set(0,-Math.PI/2,0);
		// this.yawObject.applyQuaternion(this.player.object.getWorldQuaternion());
		// console.log(this.player.object.getWorldDirection())
		// console.log(this.yawObject.getWorldDirection())
		
		// console.log(this.camera.getWorldDirection())
		this.scene.add(this.yawObject);
	}
	
	showMessage(msg, fontSize=20, onOK=null){
		const txt = document.getElementById('message_text');
		txt.innerHTML = msg;
		txt.style.fontSize = fontSize + 'px';
		const btn = document.getElementById('message_ok');
		const panel = document.getElementById('message');
		const game = this;
		if (onOK!=null){
			btn.onclick = function(){ 
				panel.style.display = 'none';
				onOK.call(game); 
			}
		}else{
			btn.onclick = function(){
				panel.style.display = 'none';
			}
		}
		panel.style.display = 'flex';
	}
	
	onWindowResize() {
		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();

		this.renderer.setSize( window.innerWidth, window.innerHeight );

	}
	
	updateRemotePlayers(dt){
		if (this.remoteData===undefined || this.remoteData.length == 0 || this.player===undefined || this.player.id===undefined) return;
		
		const newPlayers = [];
		const game = this;
		//Get all remotePlayers from remoteData array
		const remotePlayers = [];
		const remoteColliders = [];
		
		this.remoteData.forEach( function(data){
			if (game.player.id != data.id){
				//Is this player being initialised?
				let iplayer;
				game.initialisingPlayers.forEach( function(player){
					if (player.id == data.id) iplayer = player;
				});
				//If not being initialised check the remotePlayers array
				if (iplayer===undefined){
					let rplayer;
					game.remotePlayers.forEach( function(player){
						if (player.id == data.id) rplayer = player;
					});
					if (rplayer===undefined){
						//Initialise player
						game.initialisingPlayers.push( new Player( game, data ));
					}else{
						//Player exists
						remotePlayers.push(rplayer);
						remoteColliders.push(rplayer.collider);
					}
				}
			}
		});
		
		this.scene.children.forEach( function(object){
			if (object.userData.remotePlayer && game.getRemotePlayerById(object.userData.id)==undefined){
				game.scene.remove(object);
			}	
		});
		
		this.remotePlayers = remotePlayers;
		this.remoteColliders = remoteColliders;
		this.remotePlayers.forEach(function(player){ player.update( dt ); });	
	}
	
	onMouseDown( event ) {
		if (this.remoteColliders===undefined || this.remoteColliders.length==0 || this.speechBubble===undefined || this.speechBubble.mesh===undefined) {
			document.body.requestPointerLock();
			console.log("onMouseDown: pointerlock");
			return
			
		}
		// calculate mouse position in normalized device coordinates
		// (-1 to +1) for both components
		const mouse = new THREE.Vector2();
		mouse.x = ( event.clientX / this.renderer.domElement.clientWidth ) * 2 - 1;
		mouse.y = - ( event.clientY / this.renderer.domElement.clientHeight ) * 2 + 1;

		const raycaster = new THREE.Raycaster();
		raycaster.setFromCamera( mouse, this.camera );
		
		const intersects = raycaster.intersectObjects( this.remoteColliders );
		const chat = document.getElementById('chat');
		
		if (intersects.length>0){
			const object = intersects[0].object;
			const players = this.remotePlayers.filter( function(player){
				if (player.collider!==undefined && player.collider==object){
					return true;
				}
			});
			if (players.length>0){
				const player = players[0];
				console.log(`onMouseDown: player ${player.id}`);
				this.speechBubble.player = player;
				this.speechBubble.update('');
				this.scene.add(this.speechBubble.mesh);
				this.chatSocketId = player.id;
				chat.style.bottom = '0px';
				this.activeCamera = this.cameras.chat;
				this.currentCamera = 'chat'
				this.pitchObject.rotation.x = 0
					
				// this.player.object.visible = true
			}
		}else{
			//Is the chat panel visible?
			if (chat.style.bottom=='0px' && (window.innerHeight - event.clientY)>40){
				console.log("onMouseDown: No player found");
				if (this.speechBubble.mesh.parent!==null) this.speechBubble.mesh.parent.remove(this.speechBubble.mesh);
				delete this.speechBubble.player;
				delete this.chatSocketId;
				chat.style.bottom = '-50px';
				this.activeCamera = this.cameras.back;
				this.currentCamera = 'back'
			}else{
				if(chat.style.bottom=='0px' && (window.innerHeight - event.clientY)<= 40) {
					console.log("onMouseDown: typing");
				}
				else {
					document.body.requestPointerLock();
					console.log("onMouseDown: pointerlock");
				}
			}
		}
	}
	
	getRemotePlayerById(id){
		if (this.remotePlayers===undefined || this.remotePlayers.length==0) return;
		
		const players = this.remotePlayers.filter(function(player){
			if (player.id == id) return true;
		});	
		
		if (players.length==0) return;
		
		return players[0];
	}
	

	onPointerlockChange() {
        // console.log(this.domElement);
        this.isLocked = document.pointerLockElement === this.domElement;
    }

    onPointerlockError() {
        console.error( 'THREE.PointerLockControls: Unable to use Pointer Lock API' );
    }

    onMouseMove(event) {
        if (this.isLocked) {
            let movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
            let movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
			
            // Modify the virtual rotation instead of the real one
           
			this.player.object.rotateY(-movementX * 0.002);
			this.yawObject.rotateY(-movementX * 0.002);
			// this.yawObject.rotation.y -= movementX * 0.002;
           
            if(this.currentCamera == 'first') {
				
				this.pitchObject.rotation.x += movementY * 0.002;
          		this.pitchObject.rotation.x = Math.min( Math.PI / 2, Math.max( -Math.PI / 2, this.pitchObject.rotation.x ) );
			}
        }
    }

	move() {
		var forward = 0;
		var right = 0;
		if(this.keys['w']) {
			forward = 1;
		}
		if(this.keys['s']) {
			forward = -1;
		}
		if(this.keys['a']) {
			right = -1;
		}
		if(this.keys['d']) {
			right = 1;
		}
		this.playerControl(forward, right)
	}

	animate() {
		const game = this;
		const dt = this.clock.getDelta();
		// 		console.log(game.yawObject.getWorldDirection())
		// console.log(game.camera.getWorldDirection())
		requestAnimationFrame( function(){ game.animate(); } );
		
		this.updateRemotePlayers(dt);
		
		if (this.player.mixer!=undefined && this.mode==this.modes.ACTIVE) this.player.mixer.update(dt);
		
		if (this.player.action=='Walking'){
			const elapsedTime = Date.now() - this.player.actionTime;
			if (elapsedTime>1000 && this.player.motion.forward>0){
				this.player.action = 'Running';
			}
		}
		
		if (this.player.motion !== undefined) this.player.move(dt);
		
		if (this.cameras!=undefined && this.cameras.active!=undefined && this.player!==undefined && this.player.object!==undefined){

			this.camera.getWorldPosition(this.tmpVec);
			if(this.currentCamera != 'first') this.seeUser(this.tmpVec);
			this.yawObject.position.lerp(this.cameras.active.getWorldPosition(new THREE.Vector3()), 0.15);
			// this.camera.position.lerp(this.cameras.active.getWorldPosition(new THREE.Vector3()), 0.05);
			if(this.currentCamera == 'back') {
				const pos = this.player.object.position.clone();
				pos.y += 200;
				// game.controls.target.set(pos.x,pos.y,pos.z);
				// this.camera.lookAt(pos);
		
			}
			else if(this.currentCamera == 'chat')  {
				const pos = this.player.object.position.clone();
				pos.y += 300;
				// game.controls.target.set(pos.x,pos.y,pos.z);
				// this.camera.lookAt(pos);
				
			}
			// const pos = this.player.object.position.clone();
			// if (this.cameras.active==this.cameras.chat){
			// 	pos.y += 200;
			// }else{
			// 	pos.y += 300;
			// }
			// // console.log(pos)
			// this.camera.lookAt(pos);
		}
		
		if (this.sun !== undefined){
			this.sun.position.copy( this.camera.position );
			this.sun.position.y += 10;
		}
		
		if (this.speechBubble!==undefined) this.speechBubble.show(this.camera.position);
		
		this.renderer.render( this.scene, this.camera );
	}
}

class Player{
	constructor(game, options){
		this.local = true;
		let model, colour;
		
		const colours = ['Black', 'Brown', 'White'];
		colour = colours[Math.floor(Math.random()*colours.length)];
									
		if (options===undefined){
			const people = ['BeachBabe', 'BusinessMan', 'Doctor', 'FireFighter', 'Housewife', 'Policeman', 'Prostitute', 'Punk', 'RiotCop', 'Roadworker', 'Robber', 'Sheriff', 'Streetman', 'Waitress'];
			model = people[Math.floor(Math.random()*people.length)];
		}else if (typeof options =='object'){
			this.local = false;
			this.options = options;
			this.id = options.id;
			model = options.model;
			colour = options.colour;
		}else{
			model = options;
		}
		this.model = model;
		this.colour = colour;
		this.game = game;
		this.animations = this.game.animations;
		
		const loader = new THREE.FBXLoader();
		const player = this;
		
		loader.load( `${game.assetsPath}fbx/people/${model}.fbx`, function ( object ) {

			object.mixer = new THREE.AnimationMixer( object );
			player.root = object;
			player.mixer = object.mixer;
			
			object.name = "Person";
					
			object.traverse( function ( child ) {
				if ( child.isMesh ) {
					child.castShadow = true;
					child.receiveShadow = true;		
				}
			} );
			
			
			const textureLoader = new THREE.TextureLoader();
			
			textureLoader.load(`${game.assetsPath}images/SimplePeople_${model}_${colour}.png`, function(texture){
				object.traverse( function ( child ) {
					if ( child.isMesh ){
						child.material.map = texture;
					}
				} );
			});
			
			player.object = new THREE.Object3D();
			player.object.position.set(3122, 0, -173);
			// player.object.rotation.set(0, 2.6, 0);
			
			player.object.add(object);
			if (player.deleted===undefined) game.scene.add(player.object);
			
			if (player.local){
				game.createCameras();
				game.sun.target = game.player.object;
				game.animations.Idle = object.animations[0];
				if (player.initSocket!==undefined) player.initSocket();
			}else{
				const geometry = new THREE.BoxGeometry(100,300,100);
				const material = new THREE.MeshBasicMaterial({visible:false});
				const box = new THREE.Mesh(geometry, material);
				box.name = "Collider";
				box.position.set(0, 150, 0);
				player.object.add(box);
				player.collider = box;
				player.object.userData.id = player.id;
				player.object.userData.remotePlayer = true;
				const players = game.initialisingPlayers.splice(game.initialisingPlayers.indexOf(this), 1);
				game.remotePlayers.push(players[0]);
			}
			
			if (game.animations.Idle!==undefined) player.action = "Idle";
		} );
	}
	
	set action(name){
		//Make a copy of the clip if this is a remote player
		if (this.actionName == name) return;
		const clip = (this.local) ? this.animations[name] : THREE.AnimationClip.parse(THREE.AnimationClip.toJSON(this.animations[name])); 
		const action = this.mixer.clipAction( clip );
        action.time = 0;
		this.mixer.stopAllAction();
		this.actionName = name;
		this.actionTime = Date.now();
		
		action.fadeIn(0.5);	
		action.play();
	}
	
	get action(){
		return this.actionName;
	}
	
	update(dt){
		this.mixer.update(dt);
		
		if (this.game.remoteData.length>0){
			let found = false;
			for(let data of this.game.remoteData){
				if (data.id != this.id) continue;
				//Found the player
				this.object.position.set( data.x, data.y, data.z );
				const euler = new THREE.Euler(data.pb, data.heading, data.pb);
				this.object.quaternion.setFromEuler( euler );
				this.action = data.action;
				found = true;
			}
			if (!found) this.game.removePlayer(this);
		}
	}
}

class PlayerLocal extends Player{
	constructor(game, model){
		super(game, model);
		
		const player = this;
		const socket = game.socket;
		socket.on('setId', function(data){
			player.id = data.id;
		});
		socket.on('remoteData', function(data){
			game.remoteData = data;
		});
		socket.on('deletePlayer', function(data){
			const players = game.remotePlayers.filter(function(player){
				if (player.id == data.id){
					return player;
				}
			});
			if (players.length>0){
				let index = game.remotePlayers.indexOf(players[0]);
				if (index!=-1){
					game.remotePlayers.splice( index, 1 );
					game.scene.remove(players[0].object);
				}
            }else{
                index = game.initialisingPlayers.indexOf(data.id);
                if (index!=-1){
                    const player = game.initialisingPlayers[index];
                    player.deleted = true;
                    game.initialisingPlayers.splice(index, 1);
                }
			}
		});
        
		socket.on('chat message', function(data){
			document.getElementById('chat').style.bottom = '0px';
			const player = game.getRemotePlayerById(data.id);
			game.speechBubble.player = player;
			game.chatSocketId = player.id;
			game.activeCamera = game.cameras.chat;
			game.currentCamera = 'chat';
			game.speechBubble.update(data.message);
		});
        
		$('#msg-form').submit(function(e){
			socket.emit('chat message', { id:game.chatSocketId, message:$('#m').val() });
			$('#m').val('');
			return false;
		});
		
		this.socket = socket;
	}
	
	initSocket(){
		//console.log("PlayerLocal.initSocket");
		this.socket.emit('init', { 
			model:this.model, 
			colour: this.colour,
			x: this.object.position.x,
			y: this.object.position.y,
			z: this.object.position.z,
			h: this.object.rotation.y,
			pb: this.object.rotation.x
		});
	}
	
	updateSocket(){
		if (this.socket !== undefined){
			//console.log(`PlayerLocal.updateSocket - rotation(${this.object.rotation.x.toFixed(1)},${this.object.rotation.y.toFixed(1)},${this.object.rotation.z.toFixed(1)})`);
			this.socket.emit('update', {
				x: this.object.position.x,
				y: this.object.position.y,
				z: this.object.position.z,
				h: this.object.rotation.y,
				pb: this.object.rotation.x,
				action: this.action
			})
		}
	}


	move(dt){
		const pos = this.object.position.clone();
		pos.y += 60;
		let dir = new THREE.Vector3(0,0,0);
		let dirT = new THREE.Vector3(0,0,0);
		if (this.motion.forward!=0) {
			this.object.getWorldDirection(dir);
			if (this.motion.forward<0) dir.negate();
		}
		if (this.motion.turn!=0) {
			this.object.getWorldDirection(dirT);
			dirT.applyAxisAngle(new THREE.Vector3(0,1,0), Math.PI/2);
			// dirT.set(1,0,0);
			// dirT.applyMatrix4(this.object.matrix);
			if (this.motion.turn<0) dirT.negate();
			dirT.normalize();
		}

		dir.add(dirT);

		dir.normalize();
	
		let raycaster = new THREE.Raycaster(pos, dir);
		let blocked = false;
		const colliders = this.game.colliders;
	
		if (colliders!==undefined){ 
			const intersect = raycaster.intersectObjects(colliders);
			if (intersect.length>0){
				if (intersect[0].distance<50) blocked = true;
			}
		}
		
		if (!blocked){
			
			if (this.motion.forward>0){
				const speed = (this.action=='Running') ? 400 : 150;
				this.object.translateZ(dt*speed);
			
	
				// this.controls.target.add(dt*speed)
			}else{
				if(this.motion.forward < 0) {
					this.object.translateZ(-dt*130);
					
				}
			}
			if (this.motion.turn > 0){
				const speed = (this.action=='Running') ? 400 : 150;
				this.object.translateX(dt*speed);
				
			}else{
				if(this.motion.turn < 0) {
					const speed = (this.action=='Running') ? 400 : 150;
					this.object.translateX(-dt*speed);
					
				}
			}
		}
		
		if (colliders!==undefined){
			//cast left
			// dir.set(-1,0,0);
			// dir.applyMatrix4(this.object.matrix);
			// dir.normalize();
			// raycaster = new THREE.Raycaster(pos, dir);

			// let intersect = raycaster.intersectObjects(colliders);
			// if (intersect.length>0){
			// 	if (intersect[0].distance<50) this.object.translateX(100-intersect[0].distance);
			// }
			
			// //cast right
			// dir.set(1,0,0);
			// dir.applyMatrix4(this.object.matrix);
			// dir.normalize();
			// raycaster = new THREE.Raycaster(pos, dir);

			// intersect = raycaster.intersectObjects(colliders);
			// if (intersect.length>0){
			// 	if (intersect[0].distance<50) this.object.translateX(intersect[0].distance-100);
			// }
			
			//cast down
			dir.set(0,-1,0);
			pos.y += 200;
			raycaster = new THREE.Raycaster(pos, dir);
			const gravity = 30;

			let intersect = raycaster.intersectObjects(colliders);
			if (intersect.length>0){
				const targetY = pos.y - intersect[0].distance;
				if (targetY > this.object.position.y){
					//Going up
					this.object.position.y = 0.8 * this.object.position.y + 0.2 * targetY;
					this.velocityY = 0;
				}else if (targetY < this.object.position.y){
					//Falling
					if (this.velocityY==undefined) this.velocityY = 0;
					this.velocityY += dt * gravity;
					this.object.position.y -= this.velocityY;
					if (this.object.position.y < targetY){
						this.velocityY = 0;
						this.object.position.y = targetY;
					}
				}
			}
		}
		
		// this.object.rotateY(this.motion.turn*dt);
		
		this.updateSocket();
	}
}

class SpeechBubble{
	constructor(game, msg, size=1){
		this.config = { font:'Calibri', size:24, padding:10, colour:'#222', width:256, height:256 };
		
		const planeGeometry = new THREE.PlaneGeometry(size, size);
		const planeMaterial = new THREE.MeshBasicMaterial()
		this.mesh = new THREE.Mesh(planeGeometry, planeMaterial);
		game.scene.add(this.mesh);
		
		const self = this;
		const loader = new THREE.TextureLoader();
		loader.load(
			// resource URL
			`${game.assetsPath}images/speech.png`,

			// onLoad callback
			function ( texture ) {
				// in this example we create the material when the texture is loaded
				self.img = texture.image;
				self.mesh.material.map = texture;
				self.mesh.material.transparent = true;
				self.mesh.material.needsUpdate = true;
				if (msg!==undefined) self.update(msg);
			},

			// onProgress callback currently not supported
			undefined,

			// onError callback
			function ( err ) {
				console.error( 'An error happened.' );
			}
		);
	}
	
	update(msg){
		if (this.mesh===undefined) return;
		
		let context = this.context;
		
		if (this.mesh.userData.context===undefined){
			const canvas = this.createOffscreenCanvas(this.config.width, this.config.height);
			this.context = canvas.getContext('2d');
			context = this.context;
			context.font = `${this.config.size}pt ${this.config.font}`;
			context.fillStyle = this.config.colour;
			context.textAlign = 'center';
			this.mesh.material.map = new THREE.CanvasTexture(canvas);
		}
		
		const bg = this.img;
		context.clearRect(0, 0, this.config.width, this.config.height);
		context.drawImage(bg, 0, 0, bg.width, bg.height, 0, 0, this.config.width, this.config.height);
		this.wrapText(msg, context);
		
		this.mesh.material.map.needsUpdate = true;
	}
	
	createOffscreenCanvas(w, h) {
		const canvas = document.createElement('canvas');
		canvas.width = w;
		canvas.height = h;
		return canvas;
	}
	
	wrapText(text, context){
		const words = text.split(' ');
        let line = '';
		const lines = [];
		const maxWidth = this.config.width - 2*this.config.padding;
		const lineHeight = this.config.size + 8;
		
		words.forEach( function(word){
			const testLine = `${line}${word} `;
        	const metrics = context.measureText(testLine);
        	const testWidth = metrics.width;
			if (testWidth > maxWidth) {
				lines.push(line);
				line = `${word} `;
			}else {
				line = testLine;
			}
		});
		
		if (line != '') lines.push(line);
		
		let y = (this.config.height - lines.length * lineHeight)/2;
		
		lines.forEach( function(line){
			context.fillText(line, 128, y);
			y += lineHeight;
		});
	}
	
	show(pos){
		if (this.mesh!==undefined && this.player!==undefined){
			this.mesh.position.set(this.player.object.position.x, this.player.object.position.y + 380, this.player.object.position.z);
			this.mesh.lookAt(pos);
		}
	}
}