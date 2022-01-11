import * as THREE from 'three';

const spaceObjects = {
    Door_Double : [
        {
            position : [0, 0, -935]
        }
    ],
    DoorDouble_Wall_SideA : [
        {
            position : [0, 0, -935]
        }
    ],
    Wall_1 : [
        {
            position : [350, 0, -935]
        }
    ],
    Wall_2 : [
        {
            position : [750, 0, -935]
        },
        {
            position : [-750, 0, -935]
        }
    ],
    Column_1 : [
        {
            position : [980, 0, -935]
        },
        {
            position : [-980, 0, -935]
        },
        {
            position : [-980, 0, 935]
        },
        {
            position : [980, 0, 935]
        }
    ],
    Wall_4 : [
        {
            position : [-350, 0, -935]
        }
    ],
    Window_Wall_SideB : [
        {
            position : [-980, 0, 0],
            rotation : [0, Math.PI/2, 0],
            scale : [4.5, 1, 1]
        },
        {
            position : [980, 0, 0],
            rotation : [0, -Math.PI/2, 0],
            scale : [4.5, 1, 1]
        },
        {
            position : [0, 0, 955],
            rotation : [0, -Math.PI, 0],
            scale : [4.9, 1, 1]
        }
    ],
    FloorTile_Basic2 : [
        {
            position : [0, 0, 10],
            scale : [10.5, 1, 10.5]
        }
    ],
    Props_Base : [
        {
            position : [850, 0, -800]
        },
        {
            position : [850, 0, -550]
        },
        {
            position : [850, 0, -300]
        }
    ],
    Props_Pod : [
        {
            position : [850, 0, -800],
            rotation : [0, -Math.PI/2, 0]
        },
        {
            position : [850, 0, -550],
            rotation : [0, -Math.PI/2, 0]
        },
        {
            position : [850, 0, -300],
            rotation : [0, -Math.PI/2, 0]
        }
    ],
    Props_Computer : [
        {
            position : [650, 0, -900]
        }
    ],
    Props_Crate : [
        {
            position : [-880, 0, -850]
        },
        {
            position : [-880, 80, -850]
        },
        {
            position : [-880, 160, -850]
        },
        {
            position : [-880, 0, -770]
        },
        {
            position : [-880, 0, -690]
        },
        {
            position : [-880, 80, -770]
        },
        {
            position : [-800, 0, -850]
        },
        {
            position : [-800, 80, -850]
        },
        {
            position : [-720, 0, -850]
        },
        {
            position : [-800, 0, -770]
        }
    ],
    Props_CrateLong : [
        {
            position : [-600, 0, -850],
        },
        {
            position : [-475, 0, -850],
        },
        {
            position : [-537.5, 80, -850],
        },
    ],
    Props_Chest : [
        {
            position : [-880, 0, -550],
            rotation : [0, Math.PI/2, 0]
        }
    ],
    Props_ContainerFull : [
        {
            position : [-880, 0, -420],
            rotation : [0, Math.PI/2, 0]
        }
    ],
    Props_Capsule : [
        {
            position : [-880, 20, 830],
            rotation : [Math.PI/4, 0, 0]
        },
        {
            position : [-790, 20, 830],
            rotation : [Math.PI/4, 0, 0]
        }
    ],
    Props_Shelf_Tall : [
        {
            position : [820, 0, 820]
        }
    ],
    Props_Teleporter_1 : [
        {
            position : [300, 0, 200]
        }
    ],
    Props_ComputerSmall : [
        {
            position : [170, 0, 200]
        }
    ]
};

const amColor = 0x37425B;
const skyColor = 0x182030;
const groundColor = 0x808080;

export function SpaceStation(worldDim, loader) {
    let world = new THREE.Object3D();

    const posMax = worldDim / 2;    // world bounds
    const posMin = -posMax;

    // lights
    const amLight = new THREE.AmbientLight(amColor, 0.4);
    world.add(amLight);

    const hemiLight = new THREE.HemisphereLight(skyColor, groundColor, 0.1);
    world.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xC7E4EE, 1.5);
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
    for (const [name, params] of Object.entries(spaceObjects)) {
        loader.load(`/spaceObjects/${name}.fbx`, function(object) {
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