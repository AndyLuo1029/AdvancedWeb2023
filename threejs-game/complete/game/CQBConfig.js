import * as THREE from '../../libs/three137/three.module.js';

class CQBConfig{
    constructor(){
        this.text = {
            'scene1':{
                '1st':{
                    0:"prompt 1",
                    1:"prompt 2",
                    2:"prompt 3"
                },
                '2nd':{
                    0:"prompt 1",
                }
            }
        };

        this.missionPoints = {
            'scene1':{
                '1st':{
                    0:new THREE.Vector3(-5.7286011280456215, 0.015784740447998047, -7.691993105828407),
                    1:new THREE.Vector3(-4.066583413951828, 0.015784740447998047, -6.313091329346443),
                    2:new THREE.Vector3(-6, 0.015784740447998047, -11.62638000014127),
                },
            }
        };

    }
}

export { CQBConfig };