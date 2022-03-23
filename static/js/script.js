var stats, scene, renderer;
var camera, cameraControl;
var objects = new Array();

if (!init()) animate();

// init the scene
function init() {

    if (Detector.webgl) {
        renderer = new THREE.WebGLRenderer({
            antialias: true,	// to get smoother output
            preserveDrawingBuffer: true	// to allow screenshot
        });
        renderer.setClearColorHex(0xBBBBBB, 1);
        // uncomment if webgl is required
        //}else{
        //	Detector.addGetWebGLMessage();
        //	return true;
    } else {
        renderer = new THREE.CanvasRenderer();
    }
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('container').appendChild(renderer.domElement);

    // add Stats.js - https://github.com/mrdoob/stats.js
    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.bottom = '0px';
    document.body.appendChild(stats.domElement);

    // create a scene
    scene = new THREE.Scene();

    // put a camera in the scene
    camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.set(0, 0, 5);
    scene.add(camera);

    // create a camera contol
    cameraControls = new THREEx.DragPanControls(camera)

    // transparently support window resize
    THREEx.WindowResize.bind(renderer, camera);
    // allow 'p' to make screenshot
    THREEx.Screenshot.bindKey(renderer);
    // allow 'f' to go fullscreen where this feature is supported
    if (THREEx.FullScreen.available()) {
        THREEx.FullScreen.bindKey();
        document.getElementById('inlineDoc').innerHTML += "- <i>f</i> for fullscreen";
    }

    // here you add your objects
    // - you will most likely replace this part by your own
    setupObjects();
}

function setupObjects() {
    var geometry = new THREE.TorusGeometry(1, 0.42);
    var material = new THREE.MeshNormalMaterial();
    var mesh = new THREE.Mesh(geometry, material);
    objects.push(mesh.uuid);
    scene.add(mesh);
    const MAX_POINTS = 1000;

    points = new Array(MAX_POINTS);
    var i = 0;
    while (i < MAX_POINTS) {
        var x = 2 * Math.random() - 1;
        var y = 2 * Math.random() - 1;
        var z = 2 * Math.random() - 1;
        if (x * x + y * y + z * z < 1) {  // only use points inside the unit sphere
            points[i] = new THREE.Vector3(x, y, z);
            i++;
        }
    }
    geometry = new THREE.Geometry();
    for (i = 0; i < MAX_POINTS; i++) {
        geometry.vertices.push(points[i]);
    }
    material = new THREE.PointsMaterial({
        color: "yellow",
        size: 0.1,
        sizeAttenuation: false
    });
    pointCloud = new THREE.Points(geometry, material);
    objects.push(pointCloud.uuid);
    scene.add(pointCloud);
}

function cleanupScene() {
    objects.ForEach(i => {
        const object = scene.getObjectByProperty('uuid', i);

        object.geometry.dispose();
        object.material.dispose();
        scene.remove(object);
    });
    renderer.renderLists.dispose();
}

function addPointCloud(pc) {
    geometry = new THREE.Geometry();
    for (i = 0; i < pc.length; i++) {
        geometry.vertices.push(new THREE.Vector3(pc[i][0], pc[i][1], pc[i][2]));
    }
    material = new THREE.PointsMaterial({
        color: "green",
        size: 2,
        sizeAttenuation: true,
    });
    pointCloud = new THREE.Points(geometry, material);
    objects.push(pointCloud.uuid);
    scene.add(pointCloud);
}

// animation loop
function animate() {

    // loop on request animation loop
    // - it has to be at the begining of the function
    // - see details at http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
    requestAnimationFrame(animate);

    // do the render
    render();

    // update stats
    stats.update();
}

// render the scene
function render() {

    // update camera controls
    cameraControls.update();

    // actually render the scene
    renderer.render(scene, camera);
}