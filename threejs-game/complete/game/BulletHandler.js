import { 
        Mesh, 
        CylinderGeometry, 
        MeshBasicMaterial, 
        Raycaster, 
        Vector3, 
        Quaternion
    } from '../../libs/three137/three.module.js';
import { sphereIntersectsCylinder } from '../../libs/Collisions.js';
import * as THREE from '../../libs/three137/three.module.js';

/*
子弹处理类 BulletHandler，用于处理游戏中的子弹对象。

constructor(game)：
    构造函数，接收一个 game 参数，代表游戏实例，初始化一些成员变量，并创建一个基本的圆柱形体几何体和材质，用于创建子弹对象。
createBullet(pos, quat, user=false)：
    创建一个新的子弹对象，并将其添加到场景中，接收一个 pos 向量和一个四元数 quat 作为参数，分别表示子弹的初始位置和方向，
    以及一个可选的布尔型参数 user，表示该子弹是否是由用户玩家发射的。
update(dt)：
    更新所有子弹的位置和状态，接收一个正常化的时间增量 dt 作为参数，用于控制每帧子弹前进的距离。
    对于每一个子弹，该函数将其向前移动一定距离，检查它是否与场景中的 NPC 或用户玩家发生碰撞，如果碰撞，则触发相应的行为，并删除该子弹。
    如果子弹未命中任何目标，则将其继续向前移动，并根据必要的角度旋转。
sphereIntersectsCylinder(px, py, pz, pr, cx, cy, cz, cr, ch)：
    辅助函数，用于检测一个球体和一个圆柱体是否相交。
    接收两个三维向量表示的球体位置 p 和半径 r，以及两个三位向量表示的圆柱体位置 c 和底面圆的半径 cr 和高度 ch。函数返回一个布尔值，表示球体和圆柱体是否相交。
*/

class BulletHandler{
    constructor(game){
        this.game = game;
        this.scene = game.scene;
        const geometry = new CylinderGeometry(0.01, 0.01, 0.08);
        geometry.rotateX( Math.PI/2 );
        // geometry.rotateY( Math.PI/2 );
        const material = new MeshBasicMaterial();
        this.bullet = new Mesh(geometry, material);

        this.bullets = [];

        this.npcs = this.game.npcHandler.npcs;
        
        this.user = this.game.user;
        this.haveBlink = 0;

        this.forward = new Vector3( 0, 0, -1 );
        this.xAxis = new Vector3( 1, 0, 0 );
        this.tmpVec3 = new Vector3();
        this.tmpQuat = new Quaternion();
        const audioLoader = new THREE.AudioLoader();
		this.audioLoader = audioLoader;
        const listener = new THREE.AudioListener();
        this.listener = listener;
        this.raycaster = new THREE.Raycaster(); // 创建射线投射器
        this.rVec3 = new THREE.Vector3(); // raycaster vec
        this.rPosition = new THREE.Vector3(); // raycaster pos
        this.factoryIntersects = [];
        this.fI = 0;
    }

    createBullet( pos, quat, user=false){
        const bullet = this.bullet.clone();
        bullet.position.copy(pos);
        bullet.quaternion.copy(quat);
        bullet.userData.targetType = (user) ? 1 : 2;
        bullet.userData.distance = 0;
        this.scene.add(bullet);
        bullet.visible = true;
        this.bullets.push(bullet);

        
        // add audio
        const listener = this.listener;
        this.audioLoader.load( `${this.game.assetsPath}weapons/shot.wav`, function ( buffer ) {
            const audio = new THREE.PositionalAudio( listener );
            audio.setBuffer( buffer );
            audio.play();
        } );
        
    }

    update(dt){
        this.bullets.forEach( bullet => {
            let hit = false;
            let closestDistance = Infinity;
            const p1 = bullet.position.clone();
            let target;
            const dist = dt * 100;
            //Move bullet to next position
            bullet.translateZ(-dist);
            const p3 = bullet.position.clone();
            // p3 is the next position of the bullet, check whether there is factrory children in the way
            // create a raycaster from bullet and calculate whether intersect with factory children
            this.rPosition = bullet.position.clone();
            this.rVec3 = p3.clone().sub(p1);

            this.raycaster.set(this.rPosition, this.rVec3);

            // make the raycaster visible
            // this.game.scene.add(new THREE.ArrowHelper(this.raycaster.ray.direction, this.raycaster.ray.origin, 10, 0xff0000) );

            // 穿小模不穿大模
            // if won't intersect factory children, then the bullet is valid, goto further check
            bullet.position.copy(p1);
            const iterations = 1;
            const p = this.tmpVec3;
        
            for(let i=1; i<=iterations; i++){
                p.lerpVectors(p1, p3, i/iterations);
                // console.log(bullet.userData);
                if (bullet.userData.targetType==1){
                    const p2 = this.user.position.clone();
                    p2.y += 1.2;
                    hit = sphereIntersectsCylinder(p.x, p.y, p.z, 0.01, p2.x, p2.y, p2.z, 2.4, 0.4);
                    if (hit) target = this.user;
                }else{
                    this.npcs.some( npc => {
                        if (!npc.dead){
                            const p2 = npc.position.clone();
                            p2.y += 1.5;
                            hit = sphereIntersectsCylinder(p.x, p.y, p.z, 0.01, p2.x, p2.y, p2.z, 3.0, 1);
                            if (hit){
                                target = npc;
                                return true;
                            }
                        }
                    })
                }
                if (hit) break;
            }
            
            if (hit){
                target.hp -= 1;
                bullet.userData.remove = true;
                console.log([target.id,target.hp]);
                this.blink(target);
                if(target.hp<=0) target.action = 'shot';
            }else{
                // when not hit, get the factory children intersect distance
                this.factoryIntersects = this.raycaster.intersectObjects(this.game.factory.children, true);        
                if (this.factoryIntersects.length>0){
                    // get the first intersect object
                    this.fI = this.factoryIntersects[0].distance;
                }
                else{
                    this.fI = Infinity;
                }

                if( this.fI > dist ){
                    bullet.translateZ(-dist);
                    // bullet.rotateX(-dt * 0.03);
                    bullet.userData.distance += dist;
                    bullet.userData.remove = (bullet.userData.distance > 50);
                }
                else {
                    // else if intersect factory children before npcs, then the bullet is invalid, remove it
                    bullet.userData.remove = true;
                }
            }

            // reset fI, factoryIntersects
            this.fI = 0;
            this.factoryIntersects = [];           
        });

        let found = false;
        do{
            let remove;
            found = this.bullets.some( bullet => {
                if (bullet.userData.remove){
                    remove = bullet;
                    return true;
                }
            });
            if (found){
                const index = this.bullets.indexOf(remove);
                if (index!==-1) this.bullets.splice(index, 1);
                this.scene.remove(remove);
            }
            
        }while(found);

        // reset material color after blink
        if(this.haveBlink > 0){
            this.npcs.some( npc => {
                if (npc.blink){
                    npc.dt += dt;
                    if(npc.dt > 0.5){
                        npc.object.traverse(o => {
                            if (o.isMesh) {
                                o.material.color.set(0xffffff);                      
                            }
                        });
                        npc.blink = false;
                        this.haveBlink -= 1;
                        npc.dt = 0;
                    }
                }
            })
        }
        // if(this.bullets.length>0) console.log(this.bullets[0].userdata);
        // console.log(this.bullets.length);
    }

    blink(target){
        target.object.traverse(o => {
            if (o.isMesh) {
                o.material.color.set(0xf75454);                      
            }
          });
        target.blink = true;
        this.haveBlink += 1;
    }
}

export { BulletHandler };