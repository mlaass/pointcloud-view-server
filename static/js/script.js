// Three.js - Textured Cube - 6 Textures
// from https://threejsfundamentals.org/threejs/threejs-textured-cube-6-textures.html

import * as THREE from 'three';
import { toHumanString } from 'HRNumbers';

import { TrackballControls } from 'TrackballControls';
import { FirstPersonControls } from 'FirstPersonControls';
import { OrbitControls, MapControls } from 'OrbitControls';
import { FlyControls } from 'FlyControls';
import { DragControls } from 'DragControls';
import Stats from 'Stats'
import { RGBA_ASTC_10x10_Format } from 'three';


var stats, scene, renderer, camera;
var material, controls;
var objects = [];

var settings = {
    controls: 'trackball',
    points: 1000,
    pointSize: 0.05,
    show_grid: true,
    color: "#00fe88"
}

function main() {


    const canvas = document.querySelector('#c');
    renderer = new THREE.WebGLRenderer({ canvas });
    renderer.setClearColor(new THREE.Color('#333333'), 255)
    const clock = new THREE.Clock();

    const fov = 75;
    const aspect = 2;  // the canvas default
    const near = 0.1;
    const far = 5000;
    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.z = 2;

    scene = new THREE.Scene();


    var ambientLight = new THREE.AmbientLight(0x383838);
    scene.add(ambientLight);
    setupGUI();
    setupObjects();
    setupControls(settings.controls);
    // stats = new Stats();
    // stats.domElement.style.position = 'absolute';
    // stats.domElement.style.bottom = '0px';
    // document.body.appendChild(stats.domElement);

    function resizeRendererToDisplaySize(renderer) {
        const canvas = renderer.domElement;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const needResize = canvas.width !== width || canvas.height !== height;
        if (needResize) {
            renderer.setSize(width, height, false);
        }
        return needResize;
    }

    function render(time) {
        time *= 0.001;
        var delta = clock.getDelta();

        if (resizeRendererToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }

        controls.update(delta);
        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}

main();

function setupControls(ctrl) {
    console.log(ctrl);

    if (ctrl == 'trackball') {

        controls = new TrackballControls(camera, renderer.domElement);

        controls.rotateSpeed = 1.0;
        controls.zoomSpeed = 1.2;
        controls.panSpeed = 0.8;

        controls.keys = ['A', 'S', 'D'];
    }
    if (ctrl == 'orbit') {
        controls = new OrbitControls(camera, renderer.domElement);
        controls.listenToKeyEvents(window); // optional

        //controls.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)

        controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
        controls.dampingFactor = 0.05;

        controls.screenSpacePanning = false;

        controls.minDistance = 0.1;
        controls.maxDistance = 1500;

        controls.maxPolarAngle = Math.PI / 2;
    }
    if (ctrl == 'map') {
        controls = new MapControls(camera, renderer.domElement);

        //controls.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)

        controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
        controls.dampingFactor = 0.05;

        controls.screenSpacePanning = false;

        controls.minDistance = 0.1;
        controls.maxDistance = 1500;

        controls.maxPolarAngle = Math.PI / 2;
    }
    if (ctrl == 'fly') {
        controls = new FlyControls(camera, renderer.domElement);

        controls.movementSpeed = 10;
        controls.domElement = renderer.domElement;
        controls.rollSpeed = Math.PI / 24;
        controls.autoForward = false;
        controls.dragToLook = false;
    }
    if (ctrl == 'drag') {
        controls = new DragControls([...objects], camera, renderer.domElement);
        controls.addEventListener('drag', render);
    }
    if (ctrl == 'firstperson') {

        controls = new FirstPersonControls(camera, renderer.domElement);
        controls.activeLook = true;
        controls.lookSpeed = 0.1;
        controls.mouseDragOn = true;
        controls.movementSpeed = settings.pointSize
    }
}

function setupObjects() {
    // var geometry = new THREE.TorusGeometry(1, 0.42);
    // var mmaterial = new THREE.MeshNormalMaterial();
    // var mesh = new THREE.Mesh(geometry, mmaterial);
    // objects.push(mesh);
    // scene.add(mesh);
    const MAX_POINTS = 1000;

    var points = new Array(MAX_POINTS * 3);
    var i = 0;
    while (i < MAX_POINTS) {
        var x = 2 * Math.random() - 1;
        var y = 2 * Math.random() - 1;
        var z = 2 * Math.random() - 1;
        if (x * x + y * y + z * z < 1) {  // only use points inside the unit sphere
            points[i * 3] = x;
            points[(i * 3) + 1] = y;
            points[(i * 3) + 2] = z;
            i++;
        }
    }

    var geometry = new THREE.BufferGeometry();
    const positionNumComponents = 3;
    const normalNumComponents = 0;
    const uvNumComponents = 0;
    geometry.setAttribute(
        'position',
        new THREE.BufferAttribute(new Float32Array(points), positionNumComponents));

    material = new THREE.PointsMaterial({
        color: new THREE.Color(settings.color),
        size: settings.pointSize,
        sizeAttenuation: true,
    });
    var pointCloud = new THREE.Points(geometry, material);
    objects.push(pointCloud);
    scene.add(pointCloud);
}

function cleanupScene() {
    objects.forEach(i => {
        const object = scene.getObjectByProperty('uuid', i.uuid);

        object.geometry.dispose();
        object.material.dispose();
        scene.remove(object);
    });
    renderer.renderLists.dispose();
    objects = [];
}

function addPointCloud(pc) {
    var geometry = new THREE.BufferGeometry();
    const positionNumComponents = 3;
    const normalNumComponents = 0;
    const rgbNumComponents = 3;
    geometry.setAttribute(
        'position',
        new THREE.BufferAttribute(new Float32Array(pc.coords.flat()), positionNumComponents));
    if (_.has(pc, 'rgb')) {
        console.log(pc.rgb);
        geometry.setAttribute(
            'color',
            new THREE.BufferAttribute(new Float32Array(pc.rgb.flat()), rgbNumComponents));
        material = new THREE.PointsMaterial({
            vertexColors: true,
            size: settings.pointSize,
            sizeAttenuation: true,
        });
    } else {

        material = new THREE.PointsMaterial({
            color: new THREE.Color(settings.color),
            size: settings.pointSize,
            sizeAttenuation: true,
        });
    }
    var pointCloud = new THREE.Points(geometry, material);
    objects.push(pointCloud);
    scene.add(pointCloud);
}

function setupGUI() {
    var gui = new dat.GUI(/*{ autoPlace: false }*/);
    gui.addColor(settings, 'color',)
        .onChange(clr => {
            material.color = new THREE.Color(clr);
        });
    gui.add(settings, 'controls', {
        TrackBall: 'trackball',
        FirstPerson: 'firstperson',
        // Drag: 'drag',
        Fly: 'fly', Map: 'map', Orbit: 'orbit'
    })
        .onChange(ctrl => {
            setupControls(ctrl);
        });

    gui.add(settings, 'pointSize', .001, 5)
        .onChange(size => {
            // Change the size of the points by modifying the size property of the matrial.
            material.size = settings.pointSize;
        });
    //TODO add grid
    // gui.add(settings, 'show_grid').onChange(grd => {
    //     console.log(grd);
    // });
}

$(document).ready(function () {
    console.log("ready")

    $('#spinner').hide()
    $("#show_browser").hide();

    $('#hide_browser').click(() => {
        $("#browser").hide();
        $("#show_browser").show();

    });

    $('#show_browser').click(() => {
        $("#browser").show();
        $("#show_browser").hide();

    });
    $('#load_datasets').click(() => {
        $('#spinner').show();
        $.ajax({
            type: "GET",
            url: `/datasets/`,
            contentType: 'application/json',
            dataType: 'json',
            async: true,
            success: (res) => {
                console.log(res)
                var browser = ''
                Object.entries(res.files).forEach((entry) => {
                    const [key, value] = entry;
                    browser += `<h2>${key}</h2>`;
                    var min = Number.MAX_SAFE_INTEGER;
                    var max = 0;
                    var total = 0;
                    Object.entries(value).forEach((scene) => {
                        const [name, data] = scene;
                        var warn = '';
                        min = (data < min) ? data : min;
                        max = (data > max) ? data : max;
                        total += data;
                        if (data > 1000 * 1000 * 2) {
                            warn = ' <i class="bi bi-exclamation-triangle-fill"> big file</i>'
                        }
                        browser += `<a href="/datasets/${key}/${name}" class="load_scene">${name}: ${toHumanString(data)}</a> ${warn}</br>`;
                    });
                    console.log(`${key}: min: ${toHumanString(min)}, max: ${toHumanString(max)}, total: ${toHumanString(total)}`);
                });
                $('#browserlist').html("");
                $('#browserlist').append(browser);
                $('a.load_scene').bind('click', load_scene);
                $('#spinner').hide();
            }
        });
    });
    function load_scene(event) {
        $('#spinner').show();
        event = event || window.event;
        console.log(event);
        if (event.preventDefault) {
            event.preventDefault();
        }
        if (event.stopPropagation) {
            event.stopPropagation();
        }
        var scene_url = $(this).attr("href");

        $.ajax({
            type: "GET",
            url: scene_url,
            contentType: 'application/json',
            dataType: 'json',
            async: true,
            success: function (res) {
                console.log("success")
                cleanupScene();
                addPointCloud(res);
                $('#spinner').hide();
                console.log(res.stats)

            }
        });

        return false;
    }
    function takeScreenshot() {
        // https://jsfiddle.net/2pha/art388yv/
        // open in new window like this
        //
        var w = window.open('', '');
        w.document.title = "Screenshot";
        //w.document.body.style.backgroundColor = "red";
        var img = new Image();
        // Without 'preserveDrawingBuffer' set to true, we must render now
        renderer.render(scene, camera);
        img.src = renderer.domElement.toDataURL();
        w.document.body.appendChild(img);

        /*
            // download file like this.
            //
            var a = document.createElement('a');
            // Without 'preserveDrawingBuffer' set to true, we must render now
            renderer.render(scene, camera);
            a.href = renderer.domElement.toDataURL().replace("image/png", "image/octet-stream");
            a.download = 'canvas.png'
            a.click();
        */

        /*
            // New version of file download using toBlob.
            // toBlob should be faster than toDataUrl.
            // But maybe not because also calling createOjectURL.
            //
            renderer.render(scene, camera);
            renderer.domElement.toBlob(function(blob){
                var a = document.createElement('a');
              var url = URL.createObjectURL(blob);
              a.href = url;
              a.download = 'canvas.png';
              a.click();
            }, 'image/png', 1.0);
        */

    }

    var start_url = '/datasets/modelnet10_10k.h5/ModelNet10_monitor_train_monitor_0007'

    // $.ajax({
    //     type: "GET",
    //     url: start_url,
    //     contentType: 'application/json',
    //     dataType: 'json',
    //     async: false,
    //     success: function (res) {
    //         console.log("success")
    //         cleanupScene();
    //         addPointCloud(res);
    //         $('#spinner').hide();
    //         console.log(res.stats)

    //     }
    // });
});
