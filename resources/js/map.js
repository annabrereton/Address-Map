// Handle map and 3D object-related operations, such as setting up the scene, raycasting, and managing map objects.

// Import necessary components
import './bootstrap';
import '../css/app.css';
import * as THREE from 'three';
import {OrbitControls} from "three/addons/controls/OrbitControls.js";
import { DragControls } from 'three/addons/controls/DragControls.js';
import { CSS2DRenderer} from 'three/addons/renderers/CSS2DRenderer.js';
import { SCENESTATE } from './SceneState.js';
import { mapCoordsToLatLon } from './utils.js';
import {allHouses} from "./houses.js";
import { allTrees } from './trees.js';
import { updateHouseCoordinates } from './api.js';
import { Map2D } from './map2D.js';

// Global variables
export let scene, camera, renderer, orbitControls, mapMesh, mapDiameter, mapHeight, mapRadius;
export let contextMenu = null;
export const sceneState = new SCENESTATE();
let dragControls;
let map2D;

mapDiameter = 300;        // Diameter in meters
mapHeight = 10;           // Height of the cylinder
mapRadius = mapDiameter / 2;

// Create raycaster as a global variable
export const raycaster = new THREE.Raycaster();
// export let houseSelectionEnabled = false;
export let enableRotation = false;
let startPosition;
export let intersectionPoint = new THREE.Vector3();


// Initialize the scene
function setupScene() {
    // Basic scene setup
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    map2D = new Map2D('map2d', mapDiameter, THREE);

    // Set up camera position
    camera.position.set(10, 20, 200);  // x, y, z
    camera.lookAt(0, 0, 0);  // Make the camera look at the center of the map
}

function setupMapMesh() {
    // Create a cylinder geometry for the map
    const mapGeometry = new THREE.CylinderGeometry(mapRadius, mapRadius, mapHeight, 64);
    const mapMaterial = new THREE.MeshStandardMaterial({color: 0x00ff00, side: THREE.DoubleSide});
    mapMesh = new THREE.Mesh(mapGeometry, mapMaterial);
    mapMesh.receiveShadow = true;
    mapMesh.name = 'mapMesh';
    mapMesh.userData.type = 'mapMesh';
    scene.add(mapMesh);

    // GRID HELPER
    let grid = new THREE.GridHelper(300, 10, "aqua", "gray");
    grid.rotation.y = Math.PI / 2;
    grid.position.z = 5.2
    scene.add(grid);
}

// Add lighting to the scene
function addLights() {
    const ambientLight = new THREE.AmbientLight(0x404040, 1.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(100, 200, 100);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.camera.left = -150;
    directionalLight.shadow.camera.right = 150;
    directionalLight.shadow.camera.top = 150;
    directionalLight.shadow.camera.bottom = -150;
    scene.add(directionalLight);
    scene.add(directionalLight.target);
}

// Add contextmenu
function createContextMenu(x, y, point) {
    if (contextMenu) {
        contextMenu.remove();
    }

    // Get CSRF token from meta tag
    const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

    // Convert Three.js coordinates to latitude and longitude
    const latLon = mapCoordsToLatLon(point.x, point.z);

    contextMenu = document.createElement('div');
    contextMenu.className = 'context-menu';
    contextMenu.style.position = 'absolute';
    contextMenu.style.left = `${x}px`;
    contextMenu.style.top = `${y}px`;
    contextMenu.style.border = '1px solid #ccc';
    contextMenu.style.borderRadius = '5px';
    contextMenu.style.padding = '10px';
    contextMenu.style.backgroundColor = '#fff';
    contextMenu.style.fontFamily = 'Arial, sans-serif';
    contextMenu.style.zIndex = 1000;
    contextMenu.style.display = 'block';

    contextMenu.innerHTML = `
        <form action="/tree" method="post">
            <input type="hidden" name="_token" value="${csrfToken}">
            <input type="hidden" name="lat" value="${latLon.lat}">
            <input type="hidden" name="lon" value="${latLon.lon}">
            <input type="hidden" name="scale" value="3"> <!-- Default scale -->
            <button type="submit" style="border: none; background: none; padding: 0; margin: 0; color: inherit; font: inherit; cursor: pointer;">Add Tree</button>
        </form>
        `;

    document.body.appendChild(contextMenu);
}


function removeContextMenu() {
    if (contextMenu) {
        contextMenu.remove();
        contextMenu = null;
    }
}

// Set up CSS2D Renderer
const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize( window.innerWidth, window.innerHeight );
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0px';
document.body.appendChild( labelRenderer.domElement );


// Setup Orbit Controls
function setupOrbitControls() {
    orbitControls = new OrbitControls(camera, labelRenderer.domElement);
    console.log("orbitControls set up.");
}


export function setupDragControls(objectsToDrag, heightOffset, isRotating = false) {
    console.log('Setting up drag controls', objectsToDrag, heightOffset, isRotating);
    if (dragControls) {
        dragControls.dispose();
    }

    dragControls = new DragControls(objectsToDrag, camera, labelRenderer.domElement);
    dragControls.transformGroup = true;
    dragControls.addEventListener('dragstart', function (event) {
        orbitControls.enabled = false;
        startPosition = { x: event.object.position.x, z: event.object.position.z };
        console.log('Drag started on:', event.object.name);
        console.log("Start Rotation", event.object.rotation.y);
    });

    dragControls.addEventListener('drag', function (event) {
        if (isRotating) {
            event.object.position.y = heightOffset;
            event.object.position.x = startPosition.x;
            event.object.position.z = startPosition.z;

            event.object.rotation.x = 0; // No rotation on X
            event.object.rotation.z = 0; // No rotation on Z
            event.object.rotation.y = (event.object.rotation.y + 0.1) % (2 * Math.PI); // Update rotation and normalize it to [0, 2π) (360degrees in radians)

            console.log("Rotating object", event.object.rotation.y);
        } else {
            event.object.position.y = heightOffset;
        }
        render();
    });

    dragControls.addEventListener('dragend', function (event) {
        orbitControls.enabled = true;
        console.log('Drag ended on:', event.object.name);
        
        const position = event.object.position;
        const rotation = event.object.rotation.y % (2 * Math.PI);
            console.log("Dragend Rotation", rotation);
        const { lat, lon } = mapCoordsToLatLon(position.x, position.z);
        console.log('Calling updateHouseCoordinates - Lat:', lat, 'Lon:', lon, 'Rotation:', rotation);

        updateHouseCoordinates(event.object.userData.id, lat, lon, rotation);
    });
    
    dragControls.enabled = true;
}

export function disposeDragControls() {
    if (dragControls) {
        dragControls.dispose();
        dragControls = null;
        console.log('Drag controls disposed');
    }
}

export function checkIntersection(mouse) {
    raycaster.setFromCamera(mouse, camera);
    const objectsToIntersect = [mapMesh, ...allHouses, ...allTrees]; // Ensure mapMesh is included
    const intersects = raycaster.intersectObjects(objectsToIntersect, true);

    if (intersects.length > 0) {
        const intersection = intersects[0];
        return intersection; // Return the full intersection object
    }
    return null;
}

// Handle window resize
function handleResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.setSize(window.innerWidth, window.innerHeight);

    // Update 2D map dimensions
    map2D.updateDimensions();
}

// Animation loop
export function animate() {
    requestAnimationFrame(animate);
    if (orbitControls && orbitControls.enabled) {
        orbitControls.update();
    }
 
    renderer.render(scene, camera);
    labelRenderer.render(scene, camera); // Your CSS2DRenderer

    // Get camera's rotation around the y-axis
    const cameraRotation = Math.atan2(
        -camera.matrix.elements[8],
        camera.matrix.elements[10]
    );

    // Update 2D map
    const objectsToMap = [mapMesh, ...allHouses, ...allTrees];
    map2D.update(objectsToMap, cameraRotation + Math.PI * 1.5);
}

function render() {
    renderer.render( scene, camera );
}


export {
    setupScene, setupMapMesh, setupOrbitControls, addLights, createContextMenu, removeContextMenu,
    handleResize, render
};
