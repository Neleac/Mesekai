import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

import { Avatar } from './avatar';
import { Grid } from './world/grid';
import { Forest } from './world/forest';
import { Castle } from './world/castle';
import { SpaceStation } from './world/spaceStation';
import { House } from './world/house';

const canvasWidthOffset = 0.833;
const worldDim = 2000;

let renderer, camera, scene, loader, avatar, world, skyColor;
let user;

export async function init(canvas, currUser) {
    window.addEventListener('resize', onWindowResize);

    // renderer
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(canvasWidthOffset * window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    canvas.appendChild(renderer.domElement);

    // camera
    camera = new THREE.PerspectiveCamera(45, canvasWidthOffset * window.innerWidth / window.innerHeight, 1, 2000);
    camera.position.set(0, 300, 500);

    // controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target = new THREE.Vector3(0, 200, 0);
    controls.update();

    // scene
    scene = new THREE.Scene();
    loader = new FBXLoader();

    // TODO: use database fields for initial avatar and world
    let avatarName = "ybot";
    let worldName = "grid";

    if (currUser) {
        user = currUser;
        const res = await fetch('api/get-avatar', {
            method: 'POST',
            body: currUser,
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (res.status != 200) {
            alert("Get user info failure.");
        }

        const data = await res.json();
        if (data.msg === "User Found!") {
            avatarName = data.body.avatar;
            worldName = data.body.world;
        }
    }

    // avatar
    avatar = await Avatar(avatarName, loader);
    scene.add(avatar);

    // world
    switch (worldName) {
        case "space station":
            [world, skyColor] = SpaceStation(worldDim, loader);
            break;
        case "house":
            [world, skyColor] = House(worldDim, loader);
            break;
        case "castle":
            [world, skyColor] = Castle(worldDim, loader);
            break;
        case "forest":
            [world, skyColor] = Forest(worldDim, loader);
            break;
        default:
            [world, skyColor] = Grid(worldDim, loader);
    }
    scene.add(world);
    scene.background = new THREE.Color(skyColor);
}

function onWindowResize() {
    camera.aspect = canvasWidthOffset * window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvasWidthOffset * window.innerWidth, window.innerHeight);
}

export function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

// BUG: choosing a different avatar before current avatar has loaded does not override selection
// button UI overrides, avatar model should too
export async function updateAvatar(name) {
    if (avatar) {
        avatar.removeFromParent();
        avatar = null;

        avatar = await Avatar(name, loader);
        scene.add(avatar);

        if (user) {
            const res = await fetch('api/update-avatar', {
                method: 'POST',
                body: JSON.stringify({username: JSON.parse(user).user, avatarName: name}),
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (res.status != 200) {
                alert("Avatar update failure.");
            }
        }
    }
}

export async function updateWorld(name) {
    if (world) {
        world.removeFromParent();
        world = null;

        switch (name) {
            case "space station":
                [world, skyColor] = SpaceStation(worldDim, loader);
                break;
            case "house":
                [world, skyColor] = House(worldDim, loader);
                break;
            case "castle":
                [world, skyColor] = Castle(worldDim, loader);
                break;
            case "forest":
                [world, skyColor] = Forest(worldDim, loader);
                break;
            default:
                [world, skyColor] = Grid(worldDim, loader);
        }

        scene.add(world);
        scene.background = new THREE.Color(skyColor);

        if (user) {
            const res = await fetch('api/update-world', {
                method: 'POST',
                body: JSON.stringify({username: JSON.parse(user).user, worldName: name}),
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (res.status != 200) {
                alert("World update failure.");
            }
        }
    }
}
