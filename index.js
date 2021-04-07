import * as THREE from './three/src/Three.js';
// import {getLinks} from './findPages.js';
/**
 * Scene setup below
 */
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, 2, .01, 1000);
var renderer = new THREE.WebGLRenderer();
var light = new THREE.HemisphereLight(0xFFFFFF, 0x000000, 1);
light.position.x = 0;
light.position.y = 50;
light.position.z = 50;
scene.add(light);

// let cWidth = document.getElementById("graphSec");

// console.log(cWidth.width);
// renderer.setSize(window.innerWidth, window.innerHeight);
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
var lineMaterial = new THREE.LineBasicMaterial({ color: 0xFF00FF})
var nodeRadius = .5;
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
  function addNode(x, y, z, labelStr, parentNode, dir) {
    // make labels
    const canvas = makeLabelCanvas(200, 48, labelStr);
    const texture = new THREE.CanvasTexture(canvas);

    texture.minFilter = THREE.LinearFilter;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;

    const labelMaterial = new THREE.SpriteMaterial({
        map: texture,
        transparent: false,
    });

    // define node
    let node = '';
    const geometry = new THREE.SphereGeometry(nodeRadius, 12, 12);
    // select the first node
    if (currNode == '') {
        node = new THREE.Mesh(geometry, currNodeMaterial);
        currNode = node;
        labelMaterial.color.setHex(0x0066ff);
        currURL = {"url": labelStr}
        chrome.storage.sync.set( {"currURL":currURL} );
        document.getElementById("currURL").innerText = currURL["url"];
    }
    else {
        node = new THREE.Mesh(geometry, nodeMaterial);
    }

    node.userData = {"url": labelStr, "parent": parentNode, "children": [], "dir":dir}
    if (!parentNode) {
        node.x = x;
        node.y = y;
    }
    else {
        parentNode.userData["children"].push(node);
    }

    node.position.x = x;
    node.position.y = y;
    node.position.z = z;

    const label = new THREE.Sprite(labelMaterial);
    node.add(label);
    label.position.x = 0;
    label.position.y = nodeRadius + .5;

    const labelBaseScale = 0.01;
    label.scale.x = canvas.width  * labelBaseScale;
    label.scale.y = canvas.height * labelBaseScale;

    if (parentNode) {
        scene.updateMatrixWorld(true);

        // draw line to parent
        var points = [];
        var n = new THREE.Vector3().copy(node.position);
        var p = new THREE.Vector3().copy(parentNode.position);
        points.push(n.divide(new THREE.Vector3(10, 10, 1)));
        points.push(p.sub(n).sub(n).sub(n).sub(n).sub(n).sub(n).sub(n).sub(n).sub(n));   
        const lineGeo = new THREE.BufferGeometry().setFromPoints( points );

        var line = new THREE.Line(lineGeo,lineMaterial);
        node.add(line);
    }
  

    scene.add(node);
    nodes.push(node);
  }

  function resizeCanvasToDisplaySize() {
    const canvas = renderer.domElement;
    // look up the size the canvas is being displayed
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
  
    // adjust displayBuffer size to match
    if (canvas.width !== width || canvas.height !== height) {
      // you must pass false here or three.js sadly fights the browser
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
  
      // update any render target sizes here
    }
  }

  function addChildNodes(dir, links, parent) {
    console.log("addChildNodes links", links, "length", links.length, "parent", parent);  
    
    for(var i = 0; i < links.length; i++) {
        console.log("adding", links[i])
        let angle = i*(Math.PI*2 / links.length);
        var xCoord, yCoord, zCoord;
        let d = 10;
        if (dir == "x") {
            xCoord = (nodeRadius*d) * Math.cos(angle) + parent.position.x;
            yCoord = (nodeRadius*d) * Math.sin(angle) + parent.position.y;
            zCoord = parent.position.z;
            console.log(xCoord, yCoord, zCoord);
            addNode(xCoord, yCoord, zCoord, links[i], parent, "z");
        }
        else if (dir == "z") {
            xCoord = parent.position.x;
            yCoord = (nodeRadius*d) * Math.sin(angle) + parent.position.y;
            zCoord = (nodeRadius*d) * Math.cos(angle) + parent.position.z;

            addNode(xCoord, yCoord, zCoord, links[i], parent, "x");
        }
    }
  }

/**
 * Listeners below
 */

// get base site input
let inputButton = document.getElementById("inputButton");

inputButton.addEventListener("click", async () => {
    // let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    let baseSite = document.getElementById("baseSite");
    console.log("baseSite: " + baseSite.value);
    document.getElementById("currPage").innerText = "Current Root Site ("+baseSite.value+") ";
    let origin = {"url": baseSite.value};
    chrome.storage.sync.set({'baseSite':origin}, function() {
        console.log("baseSite:" + origin);
    });
    addNode(0, 0, 0, origin["url"], null, "x");

    getLinks(origin["url"]).then(links => {
        console.log("links", links, "len", links.length, "type", typeof(links));
        console.log("nodes[0]", nodes[0]);
        setTimeout(() => {
            addChildNodes(nodes[0].userData["dir"], links, nodes[0])

        }, 1000);

    });


});

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
            currNode.children[0].material.color.setHex(0xffffff);

        }
        console.log(intersects[0]); 
        currNode = intersects[0].object;
        currNode.material = currNodeMaterial;
        currNode.children[0].material.color.setHex(0x0066ff);
        // console.log(currNode.children[0].material);
        currURL = {"url": currNode.userData["url"]};
        chrome.storage.sync.set( {"currURL": currURL} );
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

// addNode(0, 0, "https://website.com/blahblahblahblahblahblahblahblah");
// addNode(10, 0, "https://google.com");
// addNode(-10, 0, "http://some-site.com/contact-about-us");



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

    resizeCanvasToDisplaySize();
    // finally render scene
    renderer.render(scene, camera);
}
animate();