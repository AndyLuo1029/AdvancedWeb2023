import { Object3D, Camera, Vector3, Quaternion, Raycaster } from '../../libs/three137/three.module.js';

/*
控制器类，用于处理玩家的移动和相机控制输入。
它接收一个Game类实例作为参数，该实例提供了访问游戏相机、时钟、用户、导航网格和其他必要的游戏对象的方法。
该控制器支持键盘/鼠标和触摸控制，以及游戏手柄输入。

该类定义了处理按键按下/释放、鼠标点击/移动和游戏手柄输入的函数。
它还定义了更新玩家移动和相机方向的函数，根据接收到的输入对玩家和相机应用必要的变换。
update()函数每帧都会被调用，并根据接收到的输入应用必要的变换到玩家和相机上。
*/

class Controller{
    constructor(game){
        this.rotateAngle = 0;
        this.camera = game.camera;
        this.clock = game.clock;
        this.user = game.user;
        this.target = game.user.root;
        this.navmesh = game.navmesh;
        this.game = game;
        this.perspective =3;
        this.raycaster = new Raycaster();

        this.move = { up:0, right:0 };
        this.look = { up:0, right:0 };
        this.rotate = { up:0,right:0 };

        this.tmpVec3 = new Vector3();
        this.tmpQuat = new Quaternion();


        //Used to return the camera to its base position and orientation after a look event
        this.cameraBase = new Object3D();
        this.cameraBase.position.copy( this.camera.position );
        this.cameraBase.quaternion.copy( this.camera.quaternion );
        this.target.attach( this.cameraBase );
        //this.target.rotateY(0.7);

        this.cameraHigh = new Camera();
        this.cameraHigh.position.copy( this.camera.position );
        this.cameraHigh.position.y += 10;
        this.cameraHigh.lookAt( this.target.position );
        this.target.attach( this.cameraHigh );


        this.yAxis = new Vector3(0, 1, 0);
        this.xAxis = new Vector3(1, 0, 0);
        this.forward = new Vector3(0, 0, 1);
        this.right = new Vector3(1, 0, 0);
        this.down = new Vector3(0, -1, 0);

        this.speed = 5;

        this.run = false;

        document.addEventListener('keydown', this.keyDown);
        document.addEventListener('keyup', this.keyUp);
        document.addEventListener('mousedown', this.mouseDown);
        document.addEventListener('mouseup', this.mouseUp);
        document.addEventListener('mousemove', this.mouseMove);
        this.keys = {   
                        w:false, 
                        a:false, 
                        d:false, 
                        s:false,
                        v:false,
                        shift:false,
                        enter:false
                        //space:false,
                        // mousedown:false,
                        //mouseorigin:{x:0, y:0}
                    };

        this.domElement = document.body;
        this.isLocked = false;
    }

    keyDown=(e)=>{
        // repeat is true when the key is held down continuously
        let repeat = false;
        if (e.repeat !== undefined) {
            repeat = e.repeat;
        }
        if(e.keyCode ===13){
            this.keys.enter = !this.keys.enter;
            this.user.sendMessage(this.keys.enter);
            return;
        }
        if(this.keys.enter)return;

        switch(e.keyCode){
            case 87:
                this.keys.w = true;
                break;
            case 65:
                this.keys.a = true;
                break;
            case 83:
                this.keys.s = true;
                break;
            case 68:
                this.keys.d = true;
                break;
            case 16:
                //shift
                this.keys.shift =true;
                break;
            case 86:
                this.keys.v =true;
                this.perspective = (this.perspective ==3)? 1:3;
                break;

        }
    }

    keyUp=(e)=>{
        if(!this.keys.enter){
            switch(e.keyCode){
                case 87:
                    this.keys.w = false;
                    if (!this.keys.s) this.move.up = 0;
                    break;
                case 65:
                    this.keys.a = false;
                    if (!this.keys.d) this.move.right = 0;
                    break;
                case 83:
                    this.keys.s = false;
                    if (!this.keys.w) this.move.up = 0;
                    break;
                case 68:
                    this.keys.d = false;
                    if (!this.keys.a) this.move.right = 0;
                    break;
                case 16:
                    this.keys.shift =false;
                    break;
                case 86:
                    this.keys.v =false;
                    break;
            }
        }

    }

    mouseDown=(e)=>{
        if(this.keys.enter)return;
        let repeat = false;
        if (e.repeat !== undefined) {
            repeat = e.repeat;
        }
        if (!repeat && e.button == 0)  this.fire(true)
     }

     mouseUp=(e)=>{
         if(this.keys.enter)return;
         this.fire(false)
     }

     mouseMove=(e)=>{
        if(this.keys.enter)return;
        if(this.isLocked){
            this.rotate.right = -e.movementX*0.001;
            if(this.rotateAngle>=0.19&&e.movementY>0)return;
            if(this.rotateAngle<=-0.19&&e.movementY<0)return;
            this.rotate.up =e.movementY*0.001;
        }        
    }

    fire(mode){
        this.user.firing = mode;
    }

    onMove( up, right ){
        this.move.up = up;
        this.move.right = -right;
    }

    onLook( up, right ){
        this.look.up = up*0.25;
        this.look.right = -right;
    }

    keyHandler(){
        if (this.keys.w) this.move.up += 0.1;
        if (this.keys.s) this.move.up -= 0.1;
        if (this.keys.a) this.move.right += 0.1;
        if (this.keys.d) this.move.right -= 0.1;
        if (this.move.up>1) this.move.up = 1;
        if (this.move.up<-1) this.move.up = -1;
        if (this.move.right>1) this.move.right = 1;
        if (this.move.right<-1) this.move.right = -1;
    }

    update(dt=0.0167){ 
        // console.log(this.user.position); 
        let playerMoved = false;
        let speed;
        this.keyHandler();
    
        if (this.move.up!=0){
            const forward = this.forward.clone().applyQuaternion(this.target.quaternion);
            speed = this.move.up>0 ? this.speed * dt : this.speed * dt * 0.3;
            speed *= this.move.up;
            if(!this.user.isRun)speed*=0.3;
            if (this.user.isFiring && speed>0.03) {
                if(this.user.isRun)speed = 0.05;
                else speed = 0.02;
            }

            const pos = this.target.position.clone().add(forward.multiplyScalar(speed));
            pos.y += 2;
            //console.log(`Moving>> target rotation:${this.target.rotation} forward:${forward} pos:${pos}`);
            
            this.raycaster.set( pos, this.down );

            const intersects = this.raycaster.intersectObject( this.navmesh );

            if ( intersects.length>0 ){
                this.target.position.copy(intersects[0].point);
                playerMoved = true;
            }
        }
        // else{
        //     speed = 0;
        //  }

        if (Math.abs(this.move.right)>0.1){
            const right = this.right.clone().applyQuaternion(this.target.quaternion);

            speed = this.speed * dt*0.5 ;
            if(!this.user.isRun)speed*=0.3;
            if (this.user.isFiring && speed>0.03) {
                if(this.user.isRun)speed = 0.05;
                else speed = 0.02;
            }
            speed*=this.move.right;
            speed *= 1.5;

            const pos = this.target.position.clone().add(right.multiplyScalar(speed));
            pos.y += 2;
            this.raycaster.set( pos, this.down );

            const intersects = this.raycaster.intersectObject( this.navmesh );
            if ( intersects.length>0 ){
                this.target.position.copy(intersects[0].point);
                playerMoved = true;
            }
            // const theta = dt * (this.move.right-0.1) * 1;
            // this.target.rotateY(theta);
            //playerMoved = true;
        }

        if(this.move.up===0&&this.move.right===0)speed =0;
        if(speed!==undefined){
            this.user.speed = speed;
        }
        else this.user.speed =0;

        if(this.rotate.right!==0){
            // const theta = dt * (this.rotate.right - 0.1);
            // this.target.rotateY(theta);
            this.target.rotateOnWorldAxis(this.yAxis, this.rotate.right);
            this.rotate.right = 0;
            playerMoved = true;
        }

        if(this.rotate.up!==0){   
            this.target.rotateX(this.rotate.up);

            this.rotateAngle += this.rotate.up;
            // console.log(this.rotateAngle)

            // let rotBorder = 0;
            // if(this.perspective == 3){
            //     rotBorder = 2.80;
            // }
            // else {
            //     rotBorder = 2.75;
            // }
            // if(Math.abs(this.target.rotation.x) < rotBorder){
            //     if(this.target.rotation.x > 0){
            //         this.target.rotation.x = rotBorder;
            //     }   
            //     else{
            //         this.target.rotation.x = -rotBorder;
            //     }
            // }

            this.rotate.up = 0;
            playerMoved = true;
        }

        //console.log(playerMoved)
        if (playerMoved){
            this.cameraBase.getWorldPosition(this.tmpVec3);
            this.camera.position.lerp(this.tmpVec3, 0.7);
            if (this.keys.shift){
                this.user.action = 'run';    
            }else{
                this.user.action = (this.user.isFiring) ? 'firingwalk' : 'walk';
            }
        }else{
            if (this.user !== undefined && !this.user.isFiring) this.user.action = 'idle';
        }


         if (this.look.up==0 && this.look.right==0){
             //console.log(this.tmpVec3,this.target.position,this.camera.position)
            let lerpSpeed = 0.7;
            this.cameraBase.getWorldPosition(this.tmpVec3);
             if (this.game.seeUser(this.tmpVec3, true)){
                 this.cameraBase.getWorldQuaternion(this.tmpQuat);
             }else{
                this.cameraHigh.getWorldPosition(this.tmpVec3);
                this.cameraHigh.getWorldQuaternion(this.tmpQuat);
            }
             this.camera.position.lerp(this.tmpVec3, lerpSpeed);
             this.camera.quaternion.slerp(this.tmpQuat, lerpSpeed);
             if(this.perspective===1){
                 this.camera.position.setX(this.target.position.x) ;
                 this.camera.position.setY(this.target.position.y+1.57) ;
                 this.camera.position.setZ(this.target.position.z) ;
                
                 this.game.seeUser(this.camera.position, true);
             }

        }else{
            const delta = 1 * dt;
            this.camera.rotateOnWorldAxis(this.yAxis, this.look.right * delta);
            const cameraXAxis = this.xAxis.clone().applyQuaternion(this.camera.quaternion);
            this.camera.rotateOnWorldAxis(cameraXAxis, this.look.up * delta);
        }
    }

    onPointerlockChange=()=>{
        this.isLocked = document.pointerLockElement === this.domElement;
    }
    onPointerlockError=()=>{
        console.error( 'THREE.PointerLockControls: Unable to use Pointer Lock API' );
    }
    connect() {
        this.domElement.addEventListener('click', this.domElement.requestPointerLock); 
        document.addEventListener( 'pointerlockchange', this.onPointerlockChange, false );
        document.addEventListener( 'pointerlockerror', this.onPointerlockError, false );
    }
}

export { Controller };