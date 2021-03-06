import * as THREE from './three/src/Three.js';

/**
 * Scene setup below
 */
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, .01, 1000);
var renderer = new THREE.WebGLRenderer();
var light = new THREE.HemisphereLight(0xFFFFFF, 0x000000, 1);
light.position.x = 0;
light.position.y = 50;
light.position.z = 50;
scene.add(light);

renderer.setSize(window.innerWidth-30, window.innerHeight);
document.getElementById("graph").appendChild(renderer.domElement);

camera.position.set(0, 2, 10);
camera.rotation.x = 0;
camera.rotation.y = 0;
camera.rotation.z = 0;

// variables for node selection
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2(); 

// variables for node information
var nodeMaterial = new THREE.MeshLambertMaterial({color:0xFF00FF});
var currNodeMaterial = new THREE.MeshLambertMaterial({color:0xFFAAFF});
var nodeRadius = 1.5;
var nodes = [];


// variables for tracking active page
var currNode = '';
var currURL = '';


/** 
 * Functions below
*/

// label creator function
function makeLabelCanvas(baseWidth, size, name) {
    const borderSize = 2;
    const ctx = document.createElement('canvas').getContext('2d');
    const font =  `${size}px bold sans-serif`;
    ctx.font = font;
    // measure how long the name will be
    const textWidth = ctx.measureText(name).width;

    baseWidth = baseWidth + name.length*5;
    const doubleBorderSize = borderSize * 2;
    const width = baseWidth + doubleBorderSize;
    const height = size + doubleBorderSize;
    ctx.canvas.width = width;
    ctx.canvas.height = height;

    // need to set font again after resizing canvas
    ctx.font = font;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';

    ctx.fillStyle = '#1e1a24';
    ctx.fillRect(0, 0, width, height);

    // scale to fit but don't stretch
    const scaleFactor = Math.min(1, baseWidth / textWidth);
    ctx.translate(width / 2, height / 2);
    ctx.scale(scaleFactor, 1);
    ctx.fillStyle = '#00ff9d';
    ctx.fillText(name, 0, 0);

    return ctx.canvas;
  }

  // node creator function
  function addNode(x, y, labelStr, parentNode) {
    // make labels
    const canvas = makeLabelCanvas(200, 48, labelStr);
    const texture = new THREE.CanvasTexture(canvas);

    texture.minFilter = THREE.LinearFilter;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;

    const labelMaterial = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
    });

    // define node
    let node = '';
    const geometry = new THREE.SphereGeometry(nodeRadius, 12, 12);
    // select the first node
    if (currNode == '') {
        node = new THREE.Mesh(geometry, currNodeMaterial);
        currNode = node;
        currURL = {"url": labelStr}
        chrome.storage.sync.set({ currURL });
        document.getElementById("currURL").innerText = currURL["url"];
    }
    else {
        node = new THREE.Mesh(geometry, nodeMaterial);
    }
    node.position.x = x;
    node.position.y = y;

    const label = new THREE.Sprite(labelMaterial);
    node.add(label);
    label.position.x = 0;
    label.position.y = nodeRadius + 1;

    const labelBaseScale = 0.01;
    label.scale.x = canvas.width  * labelBaseScale;
    label.scale.y = canvas.height * labelBaseScale;

    node.userData = {"url": labelStr, "parent": parentNode, "children": []}

    scene.add(node);
    nodes.push(node);
  }

/**
 * Listeners below
 */

// track if the mouse button is held down
var mouseDown = false;
document.body.onmousedown = function() { 
    mouseDown = true;

    // get mouse location considering canvas bounds and scrolling
    let canvasBounds = renderer.getContext().canvas.getBoundingClientRect();
    mouse.x = ((event.clientX - canvasBounds.left)/(canvasBounds.right - canvasBounds.left)) * 2 - 1;
    mouse.y = -((event.clientY - canvasBounds.top)/(canvasBounds.bottom - canvasBounds.top)) * 2 + 1;

    // use raycaster to check for intersection with nodes
    raycaster.setFromCamera( mouse, camera );
    let intersects = raycaster.intersectObjects(nodes);
    if (intersects.length > 0) {
        if (currNode != '') {
            currNode.material = nodeMaterial;
        }
        console.log(intersects[0]); 
        currNode = intersects[0].object;
        currNode.material = currNodeMaterial;
        currURL = {"url": currNode.userData["url"]}
        chrome.storage.sync.set({ currURL });
        document.getElementById("currURL").innerText = currURL["url"];
    }
}
document.body.onmouseup = function() {
    mouseDown = false;
}

// track if the motion keys are held down
var up = false;
var down = false;
var left = false;
var right = false;
var direction = new THREE.Vector3;
var speed = 0.1;

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

// reset the camera on button press
function resetCamera() {
    camera.position.set(0, 0, 10);
    camera.lookAt(0, 0, 0);
    mx = 0;
    my = 0;
}

let resetButton = document.getElementById("resetButton");
resetButton.addEventListener("click", async () => {
    resetCamera();
  });


/**
 * Scene initialization below
 */

addNode(0, 0, "https://website.com/blahblahblahblahblahblahblahblah");
addNode(10, 0, "http://some-site.com/home");
addNode(-10, 0, "http://some-site.com/contact-about-us");



// finally, animate
function animate() {
    requestAnimationFrame(animate);
    // update  background color
    chrome.storage.sync.get("color", ({ color }) => {
        scene.background = new THREE.Color(color);
      });


      
    // handle movement
    camera.getWorldDirection(direction);
    if (up) {
        camera.position.addScaledVector(direction, speed);
    }
    if (down) {
        camera.position.addScaledVector(direction, -speed);
    }
    if (left) {
        var axis = new THREE.Vector3(0,1,0);
        direction.applyAxisAngle(axis, 90*Math.PI/180);
        camera.position.addScaledVector(direction, speed);
    }
    if (right) {
        var axis = new THREE.Vector3(0,1,0);
        direction.applyAxisAngle(axis, -90*Math.PI/180);
        camera.position.addScaledVector(direction, speed);
    }

    
    // handle rotation of camera with mouse
    camera.rotation.y = mx/250;
    camera.rotation.x = my/250;

    // block user from going past 0z
    if (camera.position.z < 0)
        camera.position.z = 0;

    // finally render scene
    renderer.render(scene, camera);
}
animate();