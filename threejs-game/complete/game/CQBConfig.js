import * as THREE from '../../libs/three137/three.module.js';

class CQBConfig{
    constructor(){
        // 每轮游戏每个任务点的文字提示
        this.text = {
            'scene1':{
                '1st':{
                    0:"scene1 round1 prompt 1: kill A, 按空格继续",
                    1:"scene1 round1 prompt 2: kill B, 按空格继续",
                    2:"scene1 round1 prompt 3: round1 end, 按空格继续"
                },
                '2nd':{
                    0:"scene1 round2 prompt 1: kill C, 按空格继续",
                    1:"scene1 round2 prompt 2: round2 end, 按空格继续",
                },
                '3rd':{
                    0:"scene1 round3 prompt 1: goto next mission point, 按空格继续",
                    1:"scene1 round3 prompt 2: kill E, 按空格继续",
                },
                '4th':{
                    0:"scene1 round4 prompt 1: goto next mission point, 按空格继续",
                    1:"scene1 round4 prompt 2: kill D, 按空格继续",
                }
            },
            'scene2':{
            },
            'end':'训练结束，您的数据已返回服务器，您可以随时离开该页面并在用户后台查看您的数据。按空格继续。',
        };

        // 每轮游戏每个任务点的击杀目标（NPC的名字对应NPC数组里的下标）
        this.targets = {
            'scene1':{
                '1st':{
                    0:0,
                    1:1,
                },
                '2nd':{
                    0:2,
                },
                '3rd':{
                    0:undefined, // undefined 表示当前任务点不需要玩家击杀NPC
                    1:4,
                },
                '4th':{
                    0:undefined,
                    1:3,
                }
            },
            'scene2':{
            },
        }

        // 每轮游戏每个任务点的位置
        this.missionPoints = {
            'scene1':{
                '1st':{
                    0:new THREE.Vector3( 21.950816950006, 0.2062275464428991, -1.132499337240025),
                    1:new THREE.Vector3(21.019919834864126, 0.18245120346546173, 1.3124429261695632),
                    2:new THREE.Vector3(21.03893097433767, 0.18245120346546173, 5.955562077164792),
                },
                '2nd':{
                    0:new THREE.Vector3( 21.950816950006, 0.2062275464428991, -1.132499337240025),
                    1:new THREE.Vector3(21.179459028779196, 0.18245120346546173, -7.4913905647656875),
                },
                '3rd':{
                    0:new THREE.Vector3( 21.950816950006, 0.2062275464428991, -1.132499337240025),
                    1:new THREE.Vector3(21.170839316398546, 0.18245120346546173, 2.4469670985777),
                },
                '4th':{
                    0:new THREE.Vector3( 21.950816950006, 0.2062275464428991, -1.132499337240025),
                    1:new THREE.Vector3(21.15417638482961, 0.18245120346546173, -4.987210103242351),
                }
            }
        };

        // 两个场景的玩家初始化位置
        this.startPosition = {
            'scene1':new THREE.Vector3(21, 0.186, 0),
            'scene2':new THREE.Vector3(-5.7286011280456215, 0.015784740447998047, -7.691993105828407),
        };

        // 每轮NPC存活死亡情况（根据CQB），false代表存活，true代表死亡
        this.NPCstatus = {
            'scene1':{
                '1st':{
                    'A':false,
                    'B':false,
                    'C':false,
                    'D':false,
                    'E':false,
                },
                '2nd':{
                    'A':true,
                    'B':true,
                    'C':false,
                    'D':false,
                    'E':false,
                },
                '3rd':{
                    'A':true,
                    'B':true,
                    'C':true,
                    'D':false,
                    'E':false,
                },
                '4th':{
                    'A':true,
                    'B':true,
                    'C':true,
                    'D':false,
                    'E':true,
                }
            }
        }

    }
}

export { CQBConfig };