import * as THREE from '../../libs/three137/three.module.js';
import { GLTFLoader } from '../../libs/three137/GLTFLoader.js';
import { RGBELoader } from '../../libs/three137/RGBELoader.js';
import { NPCHandler } from './NPCHandler.js';
// import { NPCHandler } from '../NPCHandler.js';
import { LoadingBar } from '../../libs/LoadingBar.js';
import { Pathfinding } from '../../libs/pathfinding/Pathfinding.js';
import { User } from './User.js';
import { Controller } from './Controller.js';
import { BulletHandler } from './BulletHandler.js';
import { FrontSight} from './frontSight.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { CQBHandler } from './CQBHandler.js';


class Game{
	constructor(){
		// 根据前端传入的选择，切换场景
		this.currentScene = 'scene1';

		// 创建场景容器
		const container = document.createElement( 'div' );
		document.body.appendChild( container );

		this.clock = new THREE.Clock(); // 用于计算时间差

        this.loadingBar = new LoadingBar(); // 加载状态界面
        this.loadingBar.visible = false; // 初始不可见

		this.assetsPath = '../../assets/'; // 资源路径
        
		// 创建相机，并设置位置和旋转角度
		this.camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 0.1, 500 );
		// this.camera.position.set( -6, 1.8, 3 );
		this.camera.position.set( 21, 1.8, 5 );

		let col = 0x201510;
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

		this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true } ); // 创建渲染器
		this.renderer.shadowMap.enabled = true; // 开启阴影
		this.renderer.setPixelRatio( window.devicePixelRatio );
		this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.renderer.outputEncoding = THREE.sRGBEncoding; // 设置颜色编码格式
		container.appendChild( this.renderer.domElement );

		// add text renderer
		this.labelRenderer = new CSS2DRenderer();
		this.labelRenderer.setSize( window.innerWidth, window.innerHeight );
		this.labelRenderer.domElement.style.position = 'absolute';
		this.labelRenderer.domElement.style.top = '0px';
		container.appendChild( this.labelRenderer.domElement );

        this.setEnvironment(); // 设置环境贴图

		this.load(); // 加载模型和角色

		// add frontSight to camera
		const frontSight = new FrontSight(THREE);
		this.camera.add(frontSight.frontSight);
		this.camera.add(frontSight.frontSightRing);
		this.scene.add(this.camera); // 将相机添加到场景中

		this.raycaster = new THREE.Raycaster(); // 创建射线投射器
		this.tmpVec = new THREE.Vector3(); // 创建临时向量

		window.addEventListener( 'resize', this.resize.bind(this) ); // 监听调整窗口大小事件
	}

	/*
	该函数会计算从 NPC 位置到用户位置的射线，并检测射线与场景中其他物体的相交情况。
	如果存在遮挡物，则需要对这些遮挡物进行透视处理，以便 NPC 正确地判断用户是否可见。
	最终，函数返回一个布尔值，表示用户是否可见。
	 */
	seeUser(pos, seethrough=false){
		// 如果之前进行了透视处理，则撤销操作
		if (this.seethrough){
			this.seethrough.forEach( child => {
				child.material.transparent = false;
				child.material.opacity = 1;
			});
			delete this.seethrough;
		}
	
		// 计算射线方向并设置射线
		this.tmpVec.copy(this.user.position).sub(pos).normalize();
		this.raycaster.set(pos, this.tmpVec);
	
		// 获取与射线相交的物体
		const intersects = this.raycaster.intersectObjects(this.factory.children, true);
		let userVisible = true;
	
		if (intersects.length>0){
			const dist = this.tmpVec.copy(this.user.position).distanceTo(pos);
			
			// 如果需要透视处理
			if (seethrough){
				this.seethrough = [];
				// 找到最近的遮挡物（距离小于目标点和用户之间的距离），并将其添加到待透视处理列表
				intersects.some( intersect => {
					if (intersect.distance < dist){
						this.seethrough.push(intersect.object);
						intersect.object.material.transparent = true;
						intersect.object.material.opacity = 0.3;
					}else{
						return true;
					}
				})
			}else{
				// 用户是否可见取决于是否有物体阻挡了射线路径
				userVisible = (intersects[0].distance > dist);
			}
			
		}
	
		return userVisible;
	}
	
	/*
	用于初始化寻路系统。
	它将传入的 navmesh 转换成 Pathfinding 库可用的 zone 数据，并设置 NPC 行动路径中的关键点。
	*/
	initPathfinding(navmesh){
		this.waypoints = [
			new THREE.Vector3(17.73372016326552, 0.39953298254866443, -0.7466724607286782),
			new THREE.Vector3(20.649478054772402, 0.04232912113775987, -18.282935518174437),
			new THREE.Vector3(11.7688416798274, 0.11264635905666916, -23.23102176233945),
			new THREE.Vector3(-3.111551689570482, 0.18245423057147991, -22.687392486867505),
			new THREE.Vector3(-13.772447796604245, 0.1260277454451636, -23.12237117145656),
			new THREE.Vector3(-20.53385139415452, 0.0904175187063471, -12.467546107992108),
			new THREE.Vector3(-18.195950790753532, 0.17323640676321908, -0.9593366354062719),
			new THREE.Vector3(-6.603208729295872, 0.015786387893574227, -12.265553884212125)
		];
		this.pathfinder = new Pathfinding();
        this.pathfinder.setZoneData('factory', Pathfinding.createZone(navmesh.geometry, 0.02));
		if (this.npcHandler.gltf !== undefined) this.npcHandler.initNPCs();
	}
	
	// 在窗口大小发生变化时被调用，用于更新渲染器和相机的参数以适应新的大小
    resize(){
        this.camera.aspect = window.innerWidth / window.innerHeight;
    	this.camera.updateProjectionMatrix();
    	this.renderer.setSize( window.innerWidth, window.innerHeight ); 
		this.labelRenderer.setSize(window.innerWidth, window.innerHeight );
    }
    
	// 用于加载环境贴图，并设置场景的环境光照和背景色。
    setEnvironment(){
        const loader = new RGBELoader().setPath(this.assetsPath);
        const pmremGenerator = new THREE.PMREMGenerator( this.renderer );
        pmremGenerator.compileEquirectangularShader();
        
        loader.load( 'hdr/factory.hdr', 
		texture => {
          const envMap = pmremGenerator.fromEquirectangular( texture ).texture;
          pmremGenerator.dispose();

          this.scene.environment = envMap;

		  this.loadingBar.visible = !this.loadingBar.loaded;
        }, 
		xhr => {
			this.loadingBar.update( 'envmap', xhr.loaded, xhr.total );
		},
		err => {
            console.error( err.message );
        } );

		// add text prompt
		this.clickDiv = document.createElement( 'div' );
		this.clickDiv.className = 'label';
		this.clickDiv.textContent = 'Click to Start';
		this.clickDiv.style.backgroundColor = 'rgba(61, 61, 61,0.75)';
		this.clickDiv.style.height = '100%';
		this.clickDiv.style.width = '100%';
		this.clickDiv.style.textAlign = 'center';
		this.clickDiv.style.lineHeight = window.innerHeight + 'px';
		this.clickDiv.style.color = '#ffffff';
		this.clickDiv.style.fontSize = '60px';

		this.clickLabel = new CSS2DObject( this.clickDiv );
		this.camera.add( this.clickLabel );
		this.clickLabel.position.set( 0, 0, -2 );
		this.clickLabel.layers.set( 0 );
    }
    
	// 加载游戏资源，包括环境、NPC 和用户等。
	load(){
        this.loadEnvironment();
		this.npcHandler = new NPCHandler(this);
		// this.user = new User(this, new THREE.Vector3( -6, 0.021, -2), 1*Math.PI);
		this.user = new User(this, new THREE.Vector3( 21, 0.186, 0), 1*Math.PI);
		// rotate an angle
    }

	// 加载环境模型及其子对象，并设置导航网格和阴影等属性。
    loadEnvironment(){
    	const loader = new GLTFLoader( ).setPath(`${this.assetsPath}factory/`);
        
        this.loadingBar.visible = true;
		
		// Load a glTF resource
		loader.load(
			// resource URL
			'factory2.glb',
			// called when the resource is loaded
			gltf => {

				this.scene.add( gltf.scene );
                this.factory = gltf.scene;
				this.fans = [];

				const mergeObjects = {elements2:[], elements5:[], terrain:[]};

				gltf.scene.traverse( child => {
					if (child.isMesh){
						if (child.name == 'NavMesh'){
							this.navmesh = child;
							this.navmesh.geometry.rotateX( Math.PI/2 );
							this.navmesh.quaternion.identity();
							this.navmesh.position.set(0,0,0);
							child.material.visible = false;
						}else if (child.name.includes('fan')){
							this.fans.push( child );
						}else if (child.material.name.includes('elements2')){
							mergeObjects.elements2.push(child);
							child.castShadow = true;
						}else if (child.material.name.includes('elements5')){
							mergeObjects.elements5.push(child);
							child.castShadow = true;
						}else if (child.material.name.includes('terrain')){
							mergeObjects.terrain.push(child);
							child.castShadow = true;
						}else if (child.material.name.includes('sand')){
							child.receiveShadow = true;
						}else if ( child.material.name.includes('elements1')){
							child.castShadow = true;
							child.receiveShadow = true;
						}else if (child.parent.name.includes('main')){
							child.castShadow = true;
						}
					}
				});

				this.scene.add(this.navmesh);

				for(let prop in mergeObjects){
					const array = mergeObjects[prop];
					let material;
					array.forEach( object => {
						if (material == undefined){
							material = object.material;
						}else{
							object.material = material;
						}
					});
				}

				this.initPathfinding(this.navmesh);

				this.loadingBar.visible = !this.loadingBar.loaded;
			},
			// called while loading is progressing
			xhr => {

				this.loadingBar.update('environment', xhr.loaded, xhr.total);
				
			},
			// called when loading has errors
			err => {

				console.error( err );

			}
		);
	}			
    
	// 在所有必要的资源都已加载完成后开始渲染游戏场景。
	startRendering(){
		if (this.npcHandler.ready && this.user.ready && this.bulletHandler == undefined){
			this.controller = new Controller(this);
			this.controller.connect();
			this.bulletHandler = new BulletHandler(this);
			this.CQBHandler = new CQBHandler(this);
			this.renderer.setAnimationLoop( this.render.bind(this) );
		}
	}

	/* 该函数在每一帧被调用，用于更新游戏中的各个对象并进行渲染。
	具体而言，它会计算时间差值 dt，并分别调用 NPC、用户、控制器和子弹管理器的 update 函数来更新它们的状态。
	然后，它会调用渲染器的 render 函数，将场景渲染到屏幕上。
	*/
	render() {
		const dt = this.clock.getDelta();
		if(this.controller === undefined || this.controller.isLocked === false){
			// print hints
			this.clickLabel.visible = true;
		}
		else if(this.CQBHandler.CQBlock){
			// print CQB hints
			if(this.CQBHandler.prompt) this.CQBHandler.prompt.visible = true;
		}
		else{
			if(this.CQBHandler.prompt) this.CQBHandler.prompt.visible = false;
			this.clickLabel.visible = false;
			if (this.controller !== undefined) this.controller.update(dt);	
			if (this.user !== undefined ) this.user.update(dt);
			if (this.npcHandler !== undefined ) this.npcHandler.update(dt);
			if (this.bulletHandler !== undefined) this.bulletHandler.update(dt);
		}
		if (this.CQBHandler !== undefined) this.CQBHandler.update(dt);
		this.renderer.render( this.scene, this.camera );
		this.labelRenderer.render(this.scene, this.camera);
    }
}

export { Game };