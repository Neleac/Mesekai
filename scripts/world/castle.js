import * as THREE from 'three';

const castleObjects = {
    Floor_Modular : [
        {
            position : [800, -5, -400]
        },
        {
            position : [600, -5, -400]
        },
        {
            position : [400, -5, -400]
        },
        {
            position : [200, -5, -400]
        },
        {
            position : [0, -5, -400]
        },
        {
            position : [-200, -5, -400]
        },
        {
            position : [-400, -5, -400]
        },
        {
            position : [-600, -5, -400]
        },
        {
            position : [-800, -5, -400]
        },
        {
            position : [0, -5, -600]
        },
        {
            position : [0, -5, -800]
        },
        {
            position : [0, -5, -900]
        },
        {
            position : [-200, -5, -600]
        },
        {
            position : [-400, -5, -600]
        },
        {
            position : [200, -5, -600]
        },
        {
            position : [400, -5, -600]
        },
        {
            position : [-200, -5, -800]
        },
        {
            position : [200, -5, -800]
        },
        {
            position : [-400, -5, -800]
        },
        {
            position : [400, -5, -800]
        },
        {
            position : [-200, -5, -900]
        },
        {
            position : [200, -5, -900]
        },
        {
            position : [-400, -5, -900]
        },
        {
            position : [400, -5, -900]
        },
        {
            position : [0, -5, 0]
        },
        {
            position : [200, -5, 0]
        },
        {
            position : [400, -5, 0]
        },
        {
            position : [600, -5, 0]
        },
        {
            position : [800, -5, 0]
        },
        {
            position : [900, -5, 0]
        },
        {
            position : [-200, -5, 0]
        },
        {
            position : [-400, -5, 0]
        },
        {
            position : [-600, -5, 0]
        },
        {
            position : [-800, -5, 0]
        },
        {
            position : [-900, -5, 0]
        },
        {
            position : [0, -5, 200]
        },
        {
            position : [200, -5, 200]
        },
        {
            position : [400, -5, 200]
        },
        {
            position : [600, -5, 200]
        },
        {
            position : [800, -5, 200]
        },
        {
            position : [900, -5, 200]
        },
        {
            position : [-200, -5, 200]
        },
        {
            position : [-400, -5, 200]
        },
        {
            position : [-600, -5, 200]
        },
        {
            position : [-800, -5, 200]
        },
        {
            position : [-900, -5, 200]
        },
        {
            position : [0, -5, 400]
        },
        {
            position : [200, -5, 400]
        },
        {
            position : [400, -5, 400]
        },
        {
            position : [600, -5, 400]
        },
        {
            position : [800, -5, 400]
        },
        {
            position : [900, -5, 400]
        },
        {
            position : [-200, -5, 400]
        },
        {
            position : [-400, -5, 400]
        },
        {
            position : [-600, -5, 400]
        },
        {
            position : [-800, -5, 400]
        },
        {
            position : [-900, -5, 400]
        },
        {
            position : [0, -5, 600]
        },
        {
            position : [200, -5, 600]
        },
        {
            position : [400, -5, 600]
        },
        {
            position : [600, -5, 600]
        },
        {
            position : [800, -5, 600]
        },
        {
            position : [900, -5, 600]
        },
        {
            position : [-200, -5, 600]
        },
        {
            position : [-400, -5, 600]
        },
        {
            position : [-600, -5, 600]
        },
        {
            position : [-800, -5, 600]
        },
        {
            position : [-900, -5, 600]
        },
        {
            position : [0, -5, 800]
        },
        {
            position : [200, -5, 800]
        },
        {
            position : [400, -5, 800]
        },
        {
            position : [600, -5, 800]
        },
        {
            position : [800, -5, 800]
        },
        {
            position : [900, -5, 800]
        },
        {
            position : [-200, -5, 800]
        },
        {
            position : [-400, -5, 800]
        },
        {
            position : [-600, -5, 800]
        },
        {
            position : [-800, -5, 800]
        },
        {
            position : [-900, -5, 800]
        },
        {
            position : [0, -5, 900]
        },
        {
            position : [200, -5, 900]
        },
        {
            position : [400, -5, 900]
        },
        {
            position : [600, -5, 900]
        },
        {
            position : [800, -5, 900]
        },
        {
            position : [900, -5, 900]
        },
        {
            position : [-200, -5, 900]
        },
        {
            position : [-400, -5, 900]
        },
        {
            position : [-600, -5, 900]
        },
        {
            position : [-800, -5, 900]
        },
        {
            position : [-900, -5, 900]
        },
        {
            position : [0, -5, -200]
        },
        {
            position : [-200, -5, -200]
        },
        {
            position : [-400, -5, -200]
        },
        {
            position : [-600, -5, -200]
        },
        {
            position : [-800, -5, -200]
        },
        {
            position : [200, -5, -200]
        },
        {
            position : [400, -5, -200]
        },
        {
            position : [600, -5, -200]
        },
        {
            position : [800, -5, -200]
        },
        {
            position : [-900, -5, -200]
        },
        {
            position : [900, -5, -200]
        },
    ],   
    Pedestal2 : [
        {
            position : [250, 0, -250]
        },
        {
            position : [-250, 0, -250]
        }
    ],
    Vase : [
        {
            position : [250, 230, 80],
            scale : [3, 3, 3]
        },
        {
            position : [-250, 230, 80],
            scale : [3, 3, 3]
        }
    ],
    Arch_Door : [
        {
            position : [0, 0, -953]
        }
    ],
    Arch_bars : [
        {
            position : [0, 0, 953]
        }
    ],
    Arch : [
        {
            position : [0, 0, -953]
        },
        {
            position : [0, 0, 953]
        }
    ],
    Wall_Modular : [
        {
            position : [300, 200, -953],
            scale : [1, 2, 1]
        },
        {
            position : [-300, 200, -953],
            scale : [1, 2, 1]
        },
        {
            position : [300, 200, 953],
            scale : [1, 2, 1]
        },
        {
            position : [-300, 200, 953],
            scale : [1, 2, 1]
        },
        {
            position : [700, 200, 953],
            scale : [2.5, 2, 1]
        },
        {
            position : [-700, 200, 953],
            scale : [2.5, 2, 1]
        },
        {
            position : [700, 200, -350],
            scale : [2.5, 2, 1]
        },
        {
            position : [-700, 200, -350],
            scale : [2.5, 2, 1]
        },
        {
            position : [-440, 200, -650],
            rotation : [0, Math.PI/2, 0],
            scale : [3, 2, 1]
        },
        {
            position : [440, 200, -650],
            rotation : [0, Math.PI/2, 0],
            scale : [3, 2, 1]
        },
        {
            position : [-950, 200, 300],
            rotation : [0, Math.PI/2, 0],
            scale : [6.5, 2, 1]
        },
        {
            position : [950, 200, 300],
            rotation : [0, Math.PI/2, 0],
            scale : [6.5, 2, 1]
        }
    ],
    Column : [
        {
            position : [440, 0, -953]
        },
        {
            position : [-440, 0, -953]
        },
        {
            position : [440, 0, -353]
        },
        {
            position : [-440, 0, -353]
        },
        {
            position : [940, 0, -353]
        },
        {
            position : [-940, 0, -353]
        },
        {
            position : [940, 0, 953]
        },
        {
            position : [-940, 0, 953]
        },
        {
            position : [440, 0, 953]
        },
        {
            position : [-440, 0, 953]
        }
    ],
    Fence_Straight_Modular : [
        {
            position : [-440, 100, -220],
            rotation : [0, Math.PI/2, 0]
        },
        {
            position : [440, 100, -220],
            rotation : [0, Math.PI/2, 0]
        }
    ],
    Fence_End_Modular : [
        {
            position : [-440, 100, -50],
            rotation : [0, Math.PI/2, 0]
        },
        {
            position : [440, 100, -50],
            rotation : [0, Math.PI/2, 0]
        }
    ],
    Torch : [
        {
            position : [300, 300, -920]
        },
        {
            position : [-300, 300, -920]
        },
        {
            position : [300, 300, 920],
            rotation : [0, Math.PI, 0]
        },
        {
            position : [-300, 300, 920],
            rotation : [0, Math.PI, 0]
        },
        {
            position : [-900, 300, -200],
            rotation : [0, Math.PI/2, 0]
        },
        {
            position : [-900, 300, 800],
            rotation : [0, Math.PI/2, 0]
        },
        {
            position : [900, 300, -200],
            rotation : [0, -Math.PI/2, 0]
        },
        {
            position : [900, 300, 800],
            rotation : [0, -Math.PI/2, 0]
        }
    ],
    Cobweb : [
        {
            position : [350, 10, -925]
        },
        {
            position : [-450, 10, -150],
            rotation : [0, -Math.PI/2, 0]
        }
    ],
    Banner_Wall : [
        {
            position : [-700, 350, -335]
        },
        {
            position : [700, 350, -335]
        },
        {
            position : [-700, 350, 935],
            rotation : [0, Math.PI, 0]
        },
        {
            position : [700, 350, 935],
            rotation : [0, Math.PI, 0]
        },
    ],
    Banner : [
        {
            position : [-900, 0, 100],
            rotation : [0, Math.PI/2, 0]
        },
        {
            position : [-900, 0, 500],
            rotation : [0, Math.PI/2, 0]
        }
    ],
    Chest_Gold : [
        {
            position : [-800, 0, 300],
            rotation : [0, Math.PI/2, 0]
        }
    ],
    Sword_big : [
        {
            position : [-930, 300, 400],
            rotation : [0, Math.PI/2, 5*Math.PI/4]
        },
        {
            position : [-930, 300, 200],
            rotation : [0, Math.PI/2, -5*Math.PI/4]
        }
    ],
    Bucket : [
        {
            position : [300, 0, -575]
        }
    ],
    Table_Big : [
        {
            position : [700, 0, 350]
        }
    ],
    Bag_Coins : [
        {
            position : [700, 83, 250]
        }
    ],
    Bag_Standing : [
        {
            position : [700, 83, 450]
        }
    ],
    Chair : [
        {
            position : [875, 0, 275],
            rotation : [0, -Math.PI/2, 0]
        },
        {
            position : [875, 0, 450],
            rotation : [0, -Math.PI/2, 0]
        },
        {
            position : [850, 0, 175],
            rotation : [0, 7*Math.PI/4, 0]
        },
        {
            position : [850, 0, 550],
            rotation : [0, 5*Math.PI/4, 0]
        },
    ],
    Crate : [
        {
            position : [860, 0, -200]
        }
    ],
    Woodfire : [
        {
            position : [600, 0, -200]
        }
    ],
    Barrel : [
        {
            position : [300, 0, 850]
        }
    ],
    Skull : [
        {
            position : [300, 130, 850],
            rotation : [0, -Math.PI/2, 0]
        }
    ],
    Trapdoor : [
        {
            position : [0, 10, 0]
        }
    ],
    Column2 : [
        {
            position : [200, 0, 0]
        },
        {
            position : [-200, 0, 0]
        },
        {
            position : [200, 0, 200]
        },
        {
            position : [-200, 0, 200]
        },
        {
            position : [200, 0, 400]
        },
        {
            position : [-200, 0, 400]
        },
    ]
};

const amColor = 0xBB5C14;
const skyColor = 0x005171;
const groundColor = 0x27272A;

export function Castle(worldDim, loader) {
    let world = new THREE.Object3D();

    const posMax = worldDim / 2;    // world bounds
    const posMin = -posMax;

    // lights
    const amLight = new THREE.AmbientLight(amColor, 0.2);
    world.add(amLight);

    const hemiLight = new THREE.HemisphereLight(skyColor, groundColor, 0.1);
    world.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xCAE6E9, 1.5);
    dirLight.position.set(0, 1, 1);
    // dirLight.castShadow = true;
    world.add(dirLight);

    // ground
    const geometry = new THREE.PlaneGeometry(worldDim, worldDim);
    const material = new THREE.MeshLambertMaterial({color: groundColor, side: THREE.BackSide});
    const plane = new THREE.Mesh(geometry, material);
    plane.rotateX(Math.PI / 2);
    //plane.receiveShadow = true;
    world.add(plane);

    // objects
    for (const [name, params] of Object.entries(castleObjects)) {
        loader.load(`/worlds/castle/${name}.fbx`, function(object) {
            params.forEach((params) => {
                let instance = object.clone();

                if (params.position) instance.position.fromArray(params.position);
                if (params.rotation) instance.rotation.fromArray(params.rotation);
                if (params.scale) instance.scale.fromArray(params.scale);
                world.add(instance);
            });
        });
    }

    return [world, skyColor];
}
