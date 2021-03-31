import * as THREE from './three/src/Three.js';

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, .01, 1000);
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// define cube
var geometry = new THREE.BoxGeometry();
var material = new THREE.MeshLambertMaterial({color:0xFFFFFF});
var cube = new THREE.Mesh(geometry, material);
var light = new THREE.HemisphereLight(0xFFFFFF, 0x000000, 1);

scene.add(cube);
scene.add(light);

camera.position.set(0, 1, 3);


// track if the mouse button is held down
var mouseDown = false;
document.body.onmousedown = function() { 
    mouseDown = true;
}
document.body.onmouseup = function() {
    mouseDown = false;
}

// track if the motion keys are held down
var up = false;
var down = false;
var left = false;
var right = false;

function pressKey() {
    if (event.keyCode === 87) {
        up = true;
    }
    else if (event.keyCode === 83) {
        down = true;
    }
    else if (event.keyCode === 65) {
        left = true;
    }
    else if (event.keyCode === 68) {
        right = true;
    }
    console.log(event.keyCode);
}
document.onkeydown = pressKey;

// track if the motion keys are released
function releaseKey() {
    if (event.keyCode === 87) {
        up = false;
    }
    else if (event.keyCode === 83) {
        down = false;
    }
    else if (event.keyCode === 65) {
        left = false;
    }
    else if (event.keyCode === 68) {
        right = false;
    }
}
document.onkeyup = releaseKey;


// track mouse change and update location
var mx = 0;
var my = 0;
var lmx = 0;
var lmy = 0;
function saveMouse() {
    let dx = event.clientX - lmx;
    let dy = event.clientY - lmy;
    lmx = event.clientX;
    lmy = event.clientY;
    if (mouseDown) {
        my = my + dy;
        mx = mx + dx;
    }
}
document.onmousemove = saveMouse;

var direction = new THREE.Vector3;
var speed = 0.1;

function animate() {
    requestAnimationFrame(animate);
    // update  background color
    chrome.storage.sync.get("color", ({ color }) => {
        scene.background= new THREE.Color(color);
        ;
      });


    // handle movement
    if (up) {
        camera.getWorldDirection(direction);
        camera.position.addScaledVector(direction, speed);
    }
    if (down) {
        camera.getWorldDirection(direction);
        camera.position.addScaledVector(direction, -speed);
    }

    
    // handle rotation
    camera.rotation.y = mx/250;

    camera.rotation.x = my/250;


    renderer.render(scene, camera);
}
animate();