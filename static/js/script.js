// Three.js - Textured Cube - 6 Textures
// from https://threejsfundamentals.org/threejs/threejs-textured-cube-6-textures.html

import * as THREE from 'three';
import { toHumanString } from 'HRNumbers';

import { TrackballControls } from 'TrackballControls';
import { FirstPersonControls } from 'FirstPersonControls';
import Stats from 'Stats'
import { RGBA_ASTC_10x10_Format } from 'three';


var stats, scene, renderer, camera;
var material, controls;
var objects = [];

var settings = {
    animation: '',
    points: 1000,
    pointSize: 1,
}

function main() {


    const canvas = document.querySelector('#c');
    renderer = new THREE.WebGLRenderer({ canvas });
    renderer.setClearColor(0x111111, 255)
    const clock = new THREE.Clock();

    const fov = 75;
    const aspect = 2;  // the canvas default
    const near = 0.1;
    const far = 5000;
    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.z = 2;

    scene = new THREE.Scene();
    var flyControls = new FirstPersonControls(camera, renderer.domElement);
    flyControls.activeLook = true;
    flyControls.lookSpeed = 0.2;
    flyControls.mouseDragOn = true;

    var ambientLight = new THREE.AmbientLight(0x383838);
    scene.add(ambientLight);
    setupGUI();
    setupObjects();
    setupControls(camera);

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

        // cubes.forEach((cube, ndx) => {
        //   const speed = .2 + ndx * .1;
        //   const rot = time * speed;
        //   cube.rotation.x = rot;
        //   cube.rotation.y = rot;
        // });

        renderer.render(scene, camera);

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}

main();

function setupControls(camera) {

    controls = new TrackballControls(camera, renderer.domElement);

    controls.rotateSpeed = 1.0;
    controls.zoomSpeed = 1.2;
    controls.panSpeed = 0.8;

    controls.keys = ['A', 'S', 'D'];
}

function setupObjects() {
    var geometry = new THREE.TorusGeometry(1, 0.42);
    var material = new THREE.MeshNormalMaterial();
    var mesh = new THREE.Mesh(geometry, material);
    objects.push(mesh.uuid);
    scene.add(mesh);
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

    geometry = new THREE.BufferGeometry();
    const positionNumComponents = 3;
    const normalNumComponents = 0;
    const uvNumComponents = 0;
    geometry.setAttribute(
        'position',
        new THREE.BufferAttribute(new Float32Array(points), positionNumComponents));

    material = new THREE.PointsMaterial({
        color: "blue",
        size: 0.02,
        sizeAttenuation: true
    });
    var pointCloud = new THREE.Points(geometry, material);
    objects.push(pointCloud.uuid);
    scene.add(pointCloud);
}

function cleanupScene() {
    objects.forEach(i => {
        const object = scene.getObjectByProperty('uuid', i);

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
    const uvNumComponents = 0;
    geometry.setAttribute(
        'position',
        new THREE.BufferAttribute(new Float32Array(pc.flat()), positionNumComponents));

    material = new THREE.PointsMaterial({
        color: new THREE.Color("rgba(255, 0, 0, 128)"),
        size: 1,
        sizeAttenuation: true,
    });
    var pointCloud = new THREE.Points(geometry, material);
    objects.push(pointCloud.uuid);
    scene.add(pointCloud);
}

function setupGUI() {
    var gui = new dat.GUI(/*{ autoPlace: false }*/);
    //document.getElementById('settings').appendChild(gui.domElement);
    var prevAnim = settings.animation;
    gui.add(settings, 'animation', { None: '', Spin: 'spin', Drift: 'drift' })
        .onChange(anim => {
            if (!prevAnim) { // Start animating, if not currently animating.
                requestAnimationFrame(render);
            }
            prevAnim = anim;
        });

    gui.add(settings, 'pointSize', .001, 2)
        .onChange(size => {
            // Change the size of the points by modifying the size property of the matrial.
            material.size = size;
            if (!settings.animation) {
                render();
            }
        });
}

function load_scene(event) {

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
        async: false,
        success: function (res) {
            console.log(res)
            cleanupScene();
            addPointCloud(res.coords);

        }
    });

    return false;
}
$(document).ready(function () {
    console.log("ready")


    $('#load_datasets').click(function () {
        $.ajax({
            type: "GET",
            url: `/datasets/`,
            contentType: 'application/json',
            dataType: 'json',
            async: false,
            success: function (res) {
                console.log(res)
                var browser = ''
                Object.entries(res.files).forEach((entry) => {
                    const [key, value] = entry;
                    browser += `<h2>${key}</h2>`;
                    Object.entries(value).forEach((scene) => {
                        const [name, data] = scene;
                        browser += `<a href="/datasets/${key}/${name}" class="load_scene">${name}: ${toHumanString(data)}</a></br>`;
                    });
                });
                $('#browser').html("");
                $('#browser').append(browser);
                $('a.load_scene').bind('click', load_scene);
            }
        });
    });

});
