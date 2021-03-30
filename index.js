import * as THREE from './three/src/Three.js';
// import {Scene} from './three/Scene.js'

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, .01, 1000);
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// var loader = new GLTFLoader();

// var obj;
// loader.load("me.gltf", function(gltf){
//     scene.add(gltf.scene);
//     obj = gltf.scene;
// })


// define cube
var geometry = new THREE.BoxGeometry();
var material = new THREE.MeshLambertMaterial({color:0xFFFFFF});
var cube = new THREE.Mesh(geometry, material);
var light = new THREE.HemisphereLight(0xFFFFFF, 0x000000, 1);

scene.add(cube);
scene.add(light);

camera.position.set(0, 1, 3);

var mx = 0;
var my = 0;
function saveMouse() {
    mx = event.clientX;
    my = event.clientY;

}
document.onmousemove = saveMouse;

// scene.background= new THREE.Color(0x0000FF)

function animate() {
    requestAnimationFrame(animate);

    cube.rotation.y = mx/500;
    cube.rotation.x = my/500;

    renderer.render(scene, camera);
    chrome.storage.sync.get("color", ({ color }) => {
        scene.background= new THREE.Color(color);
        ;
      });
}
animate();