import * as THREE from 'three';

const houseObjects = {
    Light_Stand1 : [
        {
            position : [-450, 0, 450],
            scale : [1, 1.5, 1]
        }
    ],
    Sword_big_Golden : [
        {
            position : [-485, 500, 100],
            rotation : [0, Math.PI/2, 5*Math.PI/4]
        },
        {
            position : [-485, 500, -100],
            rotation : [0, Math.PI/2, 3*Math.PI/4]
        }
    ],
    Houseplant_7 : [
        {
            position : [-350, 75, 300]
        }
    ],
    NightStand_1 : [
        {
            position : [-350, 0, 300]
        }
    ],
    Shield_Celtic_Golden : [
        {
            position : [-470, 400, 0],
            rotation : [0, Math.PI/2, 0],
            scale : [1/2, 1/2, 1/2]
        }
    ],
    Key4 : [
        {
            position : [-440, 260, -70],
            rotation : [0, Math.PI/6, 0],
            scale : [1/3, 1/3, 1/3]
        }
    ],
    Crystal4 : [
        {
            position : [-423, 290, 87],
            scale : [1/3, 1/3, 1/3]
        },
        {
            position : [-423, 290, 112],
            scale : [1/3, 1/3, 1/3]
        }
    ],
    Crystal5 : [
        {
            position : [-440, 270, 0],
            rotation : [Math.PI/-6, Math.PI/6, Math.PI/-6],
            scale : [3/4, 3/4, 3/4]
        }
    ],
    Fireplace : [
        {
            position : [-450, 0, 0],
            rotation : [0, Math.PI/2, 0]
        }
    ],
    Bonfire_Fire : [
        {
            position : [-460, 41, 0],
            rotation : [0, Math.PI/2, 0],
            scale : [1/3, 1/2, 1/3]
        },
        {
            position : [-460, 41, 50],
            rotation : [0, Math.PI/2, 0],
            scale : [1/3, 1/2, 1/3]
        },
        {
            position : [-460, 41, -50],
            rotation : [0, Math.PI/2, 0],
            scale : [1/3, 1/2, 1/3]
        }
    ],
    Table_RoundLarge : [
        {
            position : [0, 0, -200],
            rotation : [0, 0, 0]
        }
    ],
    Plate : [
        {
            position : [0, 103, -200]
        }
    ],
    Burger : [
        {
            position : [0, 146, -200]
        }
    ],
    Bag : [
        {
            position : [-440, 30, -190],
            rotation : [0, 2*Math.PI, 0]
        }
    ],
    Desk : [
        {
            position : [-450, 0, -300],
            rotation : [0, Math.PI/2, 0]
        }
    ],
    Potion5_Empty : [
        {
            position : [-445, 90, -370],
            scale : [1/2, 1/2, 1/2]
        }
    ],
    Book4_Open : [
        {
            position : [-450, 100, -300],
            rotation : [0, Math.PI/2, 0],
        }
    ],
    OfficeChair : [
        {
            position : [-390, 0, -300],
            rotation : [0, Math.PI/-2, 0],
        }
    ],
    Trashcan_Small1 : [
        {
            position : [-450, 0, -435],
        }
    ],
    Book1_CLosed : [
        {
            position : [440, 325, 460],
            rotation : [0, 0, Math.PI/2],
            scale : [1/2, 1/2, 1/2]
        },
        {
            position : [440, 333, 460],
            rotation : [0, 0, Math.PI/2],
            scale : [1/2, 1/2, 1/2]
        },
        {
            position : [440, 341, 460],
            rotation : [0, 0, Math.PI/2],
            scale : [1/2, 1/2, 1/2]
        }
    ],
    Book2_CLosed : [
        {
            position : [408, 333, 460],
            rotation : [0, 0, Math.PI/-6],
            scale : [1/2, 1/2, 1/2]
        }
    ],
    Bookcase_Books : [
        {
            position : [400, 0, 460],
            rotation : [0, Math.PI, 0]
        }
    ],
    Couch_Medium1 : [
        {
            position : [0, 0, 375],
            rotation : [0, Math.PI, 0],
            scale : [3/4, 3/4, 3/4]
        }
    ],
    Crystal1 : [
        {
            position : [450, 290, -420],
            rotation : [Math.PI/2, 0, Math.PI/2],
            scale : [3/4, 3/4, 3/4]
        }
    ],
    Crystal2 : [
        {
            position : [438, 305, -399],
            rotation : [Math.PI/-4, 0,0],
            scale : [3/4, 3/4, 3/4]
        }
    ],
    Crystal3 : [
        {
            position : [465, 305, -399],
            rotation : [Math.PI/-4, 0, 0],
            scale : [3/4, 3/4, 3/4]
        }
    ],
    Closet : [
        {
            position : [450, 0, -375],
            rotation : [0, Math.PI/-2, 0]
        }
    ],
    Bed_Single : [
        {
            position : [400, 0, 0]
        }
    ],
    Window_Large1 : [
        {
            position : [500, 200, 0],
            rotation : [0, Math.PI/2, 0]
        },
        {
            position : [0, 200, 500]
        }
    ],
    Door_1 : [
        {
            position : [80, 0, -500]
        }
    ],
    Chest_Ingots : [
        {
            position : [-250, 0, -420],
            scale : [1.3, 1.3, 1.3]
        }
    ],
    Axe_small : [
        {
            position : [200, 80, -443],
            rotation : [Math.PI/-8, 0, 0],
            scale : [1.3, 1.3, 1.3]
        }
    ],
};

const amColor = 0xF4E99B;
const skyColor = 0x71BCE1;
const groundColor = 0x58111A;

export function House(worldDim, loader) {
    let world = new THREE.Object3D();

    // lights
    const amLight = new THREE.AmbientLight(amColor, 0.2);
    world.add(amLight);

    const hemiLight = new THREE.HemisphereLight(skyColor, groundColor, 0.1);
    world.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xFFFFFF);
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
    for (const [name, params] of Object.entries(houseObjects)) {
        loader.load(`/worlds/house/${name}.fbx`, function(object) {
            params.forEach((params) => {
                let instance = object.clone();

                if (params.position) instance.position.fromArray(params.position);
                if (params.rotation) instance.rotation.fromArray(params.rotation);
                if (params.scale) instance.scale.fromArray(params.scale);
                world.add(instance);
            });
        });
    }

    // Skull model
    loader.load(`/worlds/house/Skull.fbx`, function(object){
        object.position.set(-440, 275, 100);
        object.rotateY(Math.PI/2);
        object.rotateX(Math.PI/-6);
        world.add(object);
    });

    // Necklace3 model
    loader.load(`/worlds/house/Necklace3.fbx`, function(object){
        object.position.set(-435, 95, -230);
        object.scale.set(1/2, 1/2, 1/2);
        object.rotateY(Math.PI/2);
        object.rotateX(Math.PI/-4);
        world.add(object);
    });

    // Ring6 model
    loader.load(`/worlds/house/Ring6.fbx`, function(object){
        object.position.set(-455, 95, -230);
        object.scale.set(1/6, 1/6, 1/6);
        object.rotateY(Math.PI/4);
        object.rotateX(Math.PI/-2);
        world.add(object);
    });

    // wall 1 part 1
    const wall1Part1 = new THREE.BoxGeometry(1000, 200, 12); // width, height, depth
    const material1Part1 = new THREE.MeshLambertMaterial({ color: 0xF8F0F3 });
    const wall1Part1Mesh = new THREE.Mesh(wall1Part1, material1Part1);
    wall1Part1Mesh.position.set(0, 100, 500); 
    world.add(wall1Part1Mesh);

    // wall 1 part 2
    const wall1Part2 = new THREE.BoxGeometry(410, 340, 12); // width, height, depth
    const material1Part2 = new THREE.MeshLambertMaterial({ color: 0xF8F0F3 });
    const wall1Part2Mesh = new THREE.Mesh(wall1Part2, material1Part2);
    wall1Part2Mesh.position.set(295, 200, 500); 
    world.add(wall1Part2Mesh);

    // wall 1 part 3
    const wall1Part3 = new THREE.BoxGeometry(410, 340, 12); // width, height, depth
    const material1Part3 = new THREE.MeshLambertMaterial({ color: 0xF8F0F3 });
    const wall1Part3Mesh = new THREE.Mesh(wall1Part3, material1Part3);
    wall1Part3Mesh.position.set(-295, 200, 500); 
    world.add(wall1Part3Mesh);

    // wall 1 part 4
    const wall1Part4 = new THREE.BoxGeometry(1000, 200, 12); // width, height, depth
    const material1Part4 = new THREE.MeshLambertMaterial({ color: 0xF8F0F3 });
    const wall1Part4Mesh = new THREE.Mesh(wall1Part4, material1Part4);
    wall1Part4Mesh.position.set(0, 470, 500); 
    world.add(wall1Part4Mesh);

    // wall 2
    const wall2 = new THREE.BoxGeometry(1000, 570, 12); // width, height, depth
    const material2 = new THREE.MeshLambertMaterial({ color: 0xF8F0F3 });
    const wall2_mesh = new THREE.Mesh(wall2, material2);
    wall2_mesh.rotateY(Math.PI/2);
    wall2_mesh.position.set(-500, 285, 0); 
    world.add(wall2_mesh);

    // wall 3 part 1
    const wall3 = new THREE.BoxGeometry(1000, 200, 12); // width, height, depth
    const material3 = new THREE.MeshLambertMaterial({ color: 0xF8F0F3 });
    const wall3_mesh = new THREE.Mesh(wall3, material3);
    wall3_mesh.rotateY(Math.PI/2);
    wall3_mesh.position.set(500, 100, 0); 
    world.add(wall3_mesh);

    // wall 3 part 2
    const wall3Part2 = new THREE.BoxGeometry(410, 340, 12); // width, height, depth
    const material3Part2 = new THREE.MeshLambertMaterial({ color: 0xF8F0F3 });
    const wall3Part2Mesh = new THREE.Mesh(wall3Part2, material3Part2);
    wall3Part2Mesh.position.set(500, 200, 295); 
    wall3Part2Mesh.rotateY(Math.PI/2);
    world.add(wall3Part2Mesh);

    // wall 3 part 3
    const wall3Part3 = new THREE.BoxGeometry(410, 340, 12); // width, height, depth
    const material3Part3 = new THREE.MeshLambertMaterial({ color: 0xF8F0F3 });
    const wall3Part3Mesh = new THREE.Mesh(wall3Part3, material3Part3);
    wall3Part3Mesh.position.set(500, 200, -295); 
    wall3Part3Mesh.rotateY(Math.PI/2);
    world.add(wall3Part3Mesh);

    // wall 3 part 4
    const wall3Part4 = new THREE.BoxGeometry(1000, 200, 12); // width, height, depth
    const material3Part4 = new THREE.MeshLambertMaterial({ color: 0xF8F0F3 });
    const wall3Part3_mesh = new THREE.Mesh(wall3Part4, material3Part4);
    wall3Part3_mesh.rotateY(Math.PI/2);
    wall3Part3_mesh.position.set(500, 470, 0); 
    world.add(wall3Part3_mesh);

    // wall 4 part 1
    const wall4Part1 = new THREE.BoxGeometry(421, 570, 12); // width, height, depth
    const material4Part1 = new THREE.MeshLambertMaterial({ color: 0xF8F0F3 });
    const wall4Part1Mesh = new THREE.Mesh(wall4Part1, material4Part1);
    wall4Part1Mesh.position.set(-295, 285, -500); 
    world.add(wall4Part1Mesh);

    // wall 4 part 2
    const wall4Part2 = new THREE.BoxGeometry(425, 570, 12); // width, height, depth
    const material4Part2 = new THREE.MeshLambertMaterial({ color: 0xF8F0F3 });
    const wall4Part2Mesh = new THREE.Mesh(wall4Part2, material4Part2);
    wall4Part2Mesh.position.set(293, 285, -500); 
    world.add(wall4Part2Mesh);

    // wall 4 part 3
    const wall4Part3 = new THREE.BoxGeometry(180, 160, 12); // width, height, depth
    const material4Part3 = new THREE.MeshLambertMaterial({ color: 0xF8F0F3 });
    const wall4Part3Mesh = new THREE.Mesh(wall4Part3, material4Part3);
    wall4Part3Mesh.position.set(0, 490, -500); 
    world.add(wall4Part3Mesh);

    return [world, skyColor];
}