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
var lineMaterial = new THREE.LineBasicMaterial({ color: 0x00FFFF})
var nodeRadius = .5;
var nodes = [];
var maxDepth = 3;
var existingURLS = [];
var origin;


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
  function addNode(x, y, z, labelStr, parentNode, angle) {
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

    node.userData = {"url": labelStr, "parent": parentNode, "children": [], "angle":angle}
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
        points.push(new THREE.Vector3(0, 0, 0));
        points.push(new THREE.Vector3(0, 0, 0).sub(n.sub(p)));   
        const lineGeo = new THREE.BufferGeometry().setFromPoints( points );

        var line = new THREE.Line(lineGeo,lineMaterial);
        node.add(line);
    }
  

    scene.add(node);
    nodes.push(node);
    return node;
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

  function addChildNodes(dir, links, parent, depth) {
    
    var newNodes = []
    // build out the current node connections
    for(var i = 0; i < links.length; i++) {
        let d = 50; // line scale factor
        var xCoord, yCoord, zCoord;
        let pangle = parent.userData["angle"];

        if (links.length > 1) {

            let angle = i*(Math.PI*2 / links.length);
            xCoord = (nodeRadius*(d)) * Math.cos(angle) + parent.position.x;
            yCoord = (nodeRadius*(d)) * Math.sin(angle) + parent.position.y;
            zCoord = parent.position.z - depth*10;

            let node = addNode(xCoord, yCoord, zCoord, links[i], parent, angle);
            newNodes.push(node);
            
        }
        else {
            xCoord = (nodeRadius*d) * Math.cos(pangle) + parent.position.x;
            yCoord = (nodeRadius*d) * Math.sin(pangle) + parent.position.y;
            zCoord = parent.position.z;

            let node = addNode(xCoord, yCoord, zCoord, links[i], parent, pangle);
            newNodes.push(node);
        }
        // console.log("added", links[i])
    }
    for (var i = 0; i < newNodes.length; i++) {
        if (depth <= maxDepth){
            buildTree(newNodes[i], depth+1);
            parent.children.push(newNodes[i]);
        }
    }
  }

  function makeRequest(method, url) {
    return new Promise(function (resolve, reject) {
        let xhr = new XMLHttpRequest();
        xhr.open(method, url);
        xhr.onload = function () {
            if (this.status >= 200 && this.status < 300) {
                resolve(xhr.response);
            } else {
                reject({
                    status: this.status,
                    statusText: xhr.statusText
                });
            }
        };
        xhr.onerror = function () {
            reject({
                status: this.status,
                statusText: xhr.statusText
            });
        };
        xhr.send();
    });
}

async function buildTree(node, d) {
    let dest = node.userData["url"];
    if (dest.substring(dest.length-1) == '"') {
        dest = dest.slice(0, -1);
    }
    var res = '';
    try {
        res = await makeRequest("GET", dest);
    }
    catch {
        return;
    }
    var urls = [];

    let pageText = res;

    //remove scripts to be safe
    let expr = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
    pageText = pageText.replace(expr, "script removed for security");

    // find all urls
    const expression = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;
    let regURL = RegExp(expression, "g")

    var result;
    while((result = regURL.exec(pageText)) !== null) {
        
        // Try to correct urls with script tags attached
        var url = result[0];
        if (url.includes('"></script>')) {
            url = url.slice(0, -11);
        }
        // check for bad file types
        const badEnds = [".js", ".css", ".png", ".jpg"];
        let badURL = false;
        badEnds.forEach(ending => {
            if (url.includes(ending)) {
                badURL = true;
                return;
            }
        });
        // double check for extra html tags in url
        if (url.includes("<") || url.includes(">")) {
            badURL = true;
        }
        if (badURL) {
            continue;
        }
        // make sure to have http
        if (url.slice(0, 3) == "www") {
            url = "http://" + url;
        }

        urls.push(url);
    }
    // get unique urls
    urls = [...new Set(urls)];
    // only keep urls that are not already in existing urls
    urls = urls.filter( function(e) {
        return !existingURLS.includes(e);
    })
    existingURLS = existingURLS.concat(urls);
    // console.log("urls", urls);

    // limit tree depth
    if (d <= maxDepth) {
        addChildNodes(node.userData["dir"], urls, node, d);
    }
}

/**
 * Listeners below
 */

// get base site input
let inputButton = document.getElementById("inputButton");

inputButton.addEventListener("click", async () => {

    let baseSite = document.getElementById("baseSite");
    console.log("baseSite: " + baseSite.value);
    document.getElementById("currPage").innerText = "Current Root Site ("+baseSite.value+") ";
    origin = {"url": baseSite.value};    
});

let depthButton = document.getElementById("depthButton");

depthButton.addEventListener("click", async () => {
    maxDepth = document.getElementById("depth").value;
});

let buildButton = document.getElementById("buildButton");

buildButton.addEventListener("click", async () => {
    //reset scene
    scene.remove.apply(scene, scene.children);
    scene.add(light);
    nodes = [];
    existingURLS = [];
    //initial node
    addNode(0, 0, 0, origin["url"], null, 0);
    existingURLS.push(origin["url"]);

    // build tree from root node
    buildTree(nodes[0], 1);
});

// track if the mouse button is held down
var mouseDown = false;
document.body.onmousedown = function() { 

    // get mouse location considering canvas bounds and scrolling
    let canvasBounds = renderer.getContext().canvas.getBoundingClientRect();
    mouse.x = ((event.clientX - canvasBounds.left)/(canvasBounds.right - canvasBounds.left)) * 2 - 1;
    mouse.y = -((event.clientY - canvasBounds.top)/(canvasBounds.bottom - canvasBounds.top)) * 2 + 1;

    mouseDown = true;

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
var speed = 0.2;

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
    // console.log(event.keyCode);
}
document.onkeydown = pressKey;

// track if the motion keys are released
function releaseKey() {
    if (event.keyCode === 87) {
        speed = .1;
        up = false;
    }
    else if (event.keyCode === 83) {
        speed = .1;

        down = false;
    }
    else if (event.keyCode === 65) {
        speed = .1;

        left = false;
    }
    else if (event.keyCode === 68) {
        speed = .1;

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
        speed*=1.01;
        camera.position.addScaledVector(direction, speed);
    }
    if (down) {
        speed*=1.01;
        camera.position.addScaledVector(direction, -speed);
    }
    if (left) {
        speed*=1.01;
        var axis = new THREE.Vector3(0,1,0);
        direction.applyAxisAngle(axis, 90*Math.PI/180);
        camera.position.addScaledVector(direction, speed);
    }
    if (right) {
        speed*=1.01;
        var axis = new THREE.Vector3(0,1,0);
        direction.applyAxisAngle(axis, -90*Math.PI/180);
        camera.position.addScaledVector(direction, speed);
    }

    
    // handle rotation of camera with mouse
    camera.rotation.y = mx/250;
    camera.rotation.x = my/250;

    resizeCanvasToDisplaySize();
    // finally render scene
    renderer.render(scene, camera);
}
animate();