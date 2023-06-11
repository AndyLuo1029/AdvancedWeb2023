import * as THREE from '../../libs/three137/three.module.js';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

class NPC{
	constructor(options){
		const fps = options.fps || 30; //default fps
		this.name = options.name == undefined ? 'NPC' : options.name;
		this.hp = 3;
		// this.id = parseInt(Math.random()*(99-10+1)+10,10);

		// add name to npc when name is not default
		if (this.name != 'NPC'){
			this.nameDiv = document.createElement('div');
			this.nameDiv.textContent = this.name;
			this.nameDiv.style.color = 'rgb(255, 0, 0)';
			this.nameDiv.style.fontSize = '50px';
			this.nameDiv.style.textAlign = 'center';
			this.nameDiv.style.width = '100px';
			this.nameDiv.style.height = '100px';
			this.nameDiv.style.lineHeight = '100px';
			this.nameObject = new CSS2DObject(this.nameDiv);
			options.object.add(this.nameObject);
			this.nameObject.position.set(0, 2, 0);
			this.nameObject.layers.set(0);
		}

		this.blink = false;
		this.dt = 0;
		
		this.animations = {};	
		
		options.app.scene.add(options.object);
		
		this.object = options.object;
		this.pathLines = new THREE.Object3D();
		this.pathColor = new THREE.Color(0xFFFFFF);
		options.app.scene.add(this.pathLines);

		this.showPath = options.showPath | false;

        this.waypoints = options.waypoints;

        this.dead = false;
		
        this.speed = options.speed;
        this.app = options.app;

		this.visible = options.visible !== undefined ? options.visible : true; // 设置默认不可见

        
        if (options.app.pathfinder){
            this.pathfinder = options.app.pathfinder;
            this.ZONE = options.zone;
            this.navMeshGroup = this.pathfinder.getGroup(this.ZONE, this.object.position);	
        }
		
		const pt = this.object.position.clone();
		pt.z += 10;
		this.object.lookAt(pt);
        
        if (options.animations){
            //Use this option to set multiple animations directly
            this.mixer = new THREE.AnimationMixer(options.object);
            options.animations.forEach( (animation) => {
                this.animations[animation.name.toLowerCase()] = animation;
            })
        }
	}

    get randomWaypoint(){
		const index = Math.floor(Math.random()*this.waypoints.length);
		//const index = 0;
		return this.waypoints[index];
	}
	setTargetDirection(pt){
		const player = this.object;
		pt.y = player.position.y;
		const quaternion = player.quaternion.clone();
		player.lookAt(pt);
		this.quaternion = player.quaternion.clone();
		player.quaternion.copy(quaternion);
	}

	newPath(pt){
        const player = this.object;
        
        if (this.pathfinder===undefined){
            this.calculatedPath = [ pt.clone() ];
            //Calculate target direction
            this.setTargetDirection( pt.clone() );
            this.action = 'walking';
            return;
        }
        
		//console.log(`New path to ${pt.x.toFixed(1)}, ${pt.y.toFixed(2)}, ${pt.z.toFixed(2)}`);	

		const targetGroup = this.pathfinder.getGroup(this.ZONE, pt);
		const closestTargetNode = this.pathfinder.getClosestNode(pt, this.ZONE, targetGroup);
		
		// Calculate a path to the target and store it
		this.calculatedPath = this.pathfinder.findPath(player.position, pt, this.ZONE, this.navMeshGroup);
		//console.log(this.calculatedPath,player.position,pt,this.ZONE, this.navMeshGroup)
		if (this.calculatedPath && this.calculatedPath.length) {
			this.action = 'walking';
			
			this.setTargetDirection( this.calculatedPath[0].clone() );
			
			if (this.showPath){
				if (this.pathLines) this.app.scene.remove(this.pathLines);

				const material = new THREE.LineBasicMaterial({
					color: this.pathColor,
					linewidth: 2
				});

				const points = [player.position];
				
				// Draw debug lines
				this.calculatedPath.forEach( function(vertex){
					points.push(vertex.clone());
				});

				let geometry = new THREE.BufferGeometry().setFromPoints( points );

				this.pathLines = new THREE.Line( geometry, material );
				this.app.scene.add( this.pathLines );

				// Draw debug spheres except the last one. Also, add the player position.
				const debugPath = [player.position].concat(this.calculatedPath);

				debugPath.forEach(vertex => {
					geometry = new THREE.SphereGeometry( 0.2 );
					const material = new THREE.MeshBasicMaterial( {color: this.pathColor} );
					const node = new THREE.Mesh( geometry, material );
					node.position.copy(vertex);
					this.pathLines.add( node );
				});
			}
		} else {
			this.action = 'idle';
			
            if (this.pathfinder){
                const closestPlayerNode = this.pathfinder.getClosestNode(player.position, this.ZONE, this.navMeshGroup);
                const clamped = new THREE.Vector3();
                this.pathfinder.clampStep(
                    player.position, 
                    pt.clone(), 
                    closestPlayerNode, 
                    this.ZONE, 
                    this.navMeshGroup, 
                    clamped);
            }
            
			if (this.pathLines) this.app.scene.remove(this.pathLines);
		}
	}
	
	set action(name){
		if (this.actionName == name.toLowerCase()) return;
				
		const clip = this.animations[name.toLowerCase()];

		if (clip!==undefined){
			const action = this.mixer.clipAction( clip );
			if (name=='shot'){
				action.clampWhenFinished = true;
				action.setLoop( THREE.LoopOnce );
				this.dead = true;
				delete this.calculatedPath;
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
	}
	
	get position(){
		return this.object.position;
	}
	set position(x){
		this.object.position.add(x.sub(this.object.position));
	}
	update(dt,isMaster){
		console.log(this.actionName)
		//console.log(this.calculatedPath)
		if(this.nameObject != undefined){
			if(this.dead) this.nameObject.visible = false;
			else this.nameObject.visible = true;
		}
		const speed = this.speed;
		const player = this.object;
		
		if (this.mixer) this.mixer.update(dt);
		
        if (this.calculatedPath && this.calculatedPath.length&&isMaster) {
            const targetPosition = this.calculatedPath[0];

            const vel = targetPosition.clone().sub(player.position);
            
            let pathLegComplete = (vel.lengthSq()<0.01);
            
            if (!pathLegComplete) {
                //Get the distance to the target before moving
                const prevDistanceSq = player.position.distanceToSquared(targetPosition);
                vel.normalize();
                // Move player to target
                if (this.quaternion) player.quaternion.slerp(this.quaternion, 0.1);
                player.position.add(vel.multiplyScalar(dt * speed));
                //Get distance after moving, if greater then we've overshot and this leg is complete
                const newDistanceSq = player.position.distanceToSquared(targetPosition);
                pathLegComplete = (newDistanceSq > prevDistanceSq);
            } 
            
            if (pathLegComplete){
                // Remove node from the path we calculated
                this.calculatedPath.shift();
                if (this.calculatedPath.length==0){
                    if (this.waypoints!==undefined){
                        this.newPath(this.randomWaypoint);
                    }else{
                        player.position.copy( targetPosition );
                        this.action = 'idle';
                    }
                }else{
                    this.setTargetDirection( this.calculatedPath[0].clone() );
                }
            }
        }else{
            if (!this.dead && this.waypoints!==undefined&&isMaster) this.newPath(this.randomWaypoint);
        }
    }
}

export { NPC };