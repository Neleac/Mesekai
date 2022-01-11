import * as THREE from 'three';

// 2 * limit = dimension of square around avatar to restrict
const treeLimit = 200;
const bushLimit = 50;
const treeScale = [1, 2];

const forestObjects = {
    Grass1 : {
        number : 2000
    },
    Grass2 : {
        number : 2000
    },
    Grass3 : {
        number : 2000
    },
    CommonTree_5 : {
        number : 5,
        limit : treeLimit,
        scale : treeScale
    },
    BirchTree_1 : {
        number : 5,
        limit : treeLimit,
        scale : treeScale
    },
    BirchTree_3 : {
        number : 5,
        limit : treeLimit,
        scale : treeScale
    },
    BushBerries_1 : {
        number : 10,
        limit : bushLimit
    },
    Bush_1 : {
        number : 7,
        limit : bushLimit
    },
    Bush_2 : {
        number : 7,
        limit : bushLimit
    },
    Plant_1 : {
        number : 20
    },
    Plant_3 : {
        number : 20
    },
    Plant_4 : {
        number : 20
    },
    WoodLog_Moss : {
        number : 8,
        limit : bushLimit
    },
};

const amColor = 0xF4E99B;
const skyColor = 0x87CEEB;
const groundColor = 0x90EE90;

export function Forest(worldDim, loader) {
    let world = new THREE.Object3D();

    const posMax = worldDim / 2;    // world bounds
    const posMin = -posMax;

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
    for (const [name, params] of Object.entries(forestObjects)) {
        loader.load(`/worlds/forest/${name}.fbx`, function(object) {
            for (var i = 0; i <= params.number; i++) {
                let instance = object.clone();

                // position
                let x, z;
                if (params.limit) {
                    // flip a coin to determine which side
                    x = (Math.round(Math.random()) == 1) ? Math.random() * (posMax - params.limit) + params.limit : Math.random() * (-params.limit - posMin) + posMin;
                    z = (Math.round(Math.random()) == 1) ? Math.random() * (posMax - params.limit) + params.limit : Math.random() * (-params.limit - posMin) + posMin;
                } else {
                    x = Math.random() * (posMax - posMin) + posMin;
                    z = Math.random() * (posMax - posMin) + posMin;
                }
                instance.position.set(x, 0, z);

                // rotation
                instance.rotateY(Math.random() * (2 * Math.PI));

                // scale
                if (params.scale) {
                    let scaleMin = params.scale[0];
                    let scaleMax = params.scale[1];
                    instance.scale.set(Math.random() * (scaleMax - scaleMin) + scaleMin, Math.random() * (scaleMax - scaleMin) + scaleMin, Math.random() * (scaleMax - scaleMin) + scaleMin);
                }

                world.add(instance);
            }
        });
    }

    return [world, skyColor];
}
