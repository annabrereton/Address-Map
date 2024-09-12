// Handle map and 3D object-related operations, such as setting up the scene, raycasting, and managing map objects.

// Import necessary components
import './bootstrap';
import '../css/app.css';
import * as THREE from 'three';
import {OrbitControls} from "three/addons/controls/OrbitControls.js";
import { DragControls } from 'three/addons/controls/DragControls.js';
import { CSS2DRenderer} from 'three/addons/renderers/CSS2DRenderer.js';
import { mapCoordsToLatLon } from './utils.js';
// import { heightOffset } from './houses.js';

// Global variables
let scene, camera, renderer, orbitControls;
let dragControls;
let mapMesh;

const mapDiameter = 300;        // Diameter in meters
const mapHeight = 10;           // Height of the cylinder
const mapRadius = mapDiameter / 2;

const raycaster = new THREE.Raycaster();
let contextMenu;

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

// Function to setup DragControls
function setupDragControls(houseToDrag, heightOffset) {
    if (dragControls) {
        dragControls.dispose(); // Dispose of existing controls if any
    }

    dragControls = new DragControls(houseToDrag, camera, labelRenderer.domElement);
    dragControls.transformGroup = true;

    dragControls.addEventListener('dragstart', function (event) {
        orbitControls.enabled = false;
        console.log('Drag started on:', event.object.name);
    });

    dragControls.addEventListener('drag', function (event) {
        // Restrict movement to X and Z axes
        event.object.position.y = heightOffset; // Fix Y position
        render();
    });

    dragControls.addEventListener('dragend', function (event) {
        orbitControls.enabled = true;
        console.log('Drag ended on:', event.object.name);

        // Capture the new coordinates for the moved house
        const movedHouse = event.object;
        const position = movedHouse.position;
        const { lat, lon } = mapCoordsToLatLon(position.x, position.z);
        const houseId = movedHouse.userData.id;

        // Send the updated position to the server
        updateHouseCoordinates(houseId, lat, lon);
    });

    dragControls.addEventListener('hoveron', function (event) {
        console.log('Hovering over:', event.object.name);
    });

    dragControls.addEventListener('hoveroff', function (event) {
        console.log('Stopped hovering over:', event.object.name);
    });
}

// Function to send updated dragged house coordinates to the server
async function updateHouseCoordinates(houseId, x, z) {
    try {
        const response = await fetch(`/api/house/${houseId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content') // Include CSRF token if using Laravel
            },
            body: JSON.stringify({
                id: houseId,
                lat: x,
                lon: z
            })
        });

        if (!response.ok) {
            throw new Error('Failed to update house coordinates');
        }

        const data = await response.json();
        console.log('Coordinates updated successfully:', data);
    } catch (error) {
        console.error('Error updating coordinates:', error);
    }
}

// Function to set up Raycaster
function setupRaycaster() {
    const raycaster = new THREE.Raycaster();
}

// Handle window resize
function handleResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    orbitControls.update();
    renderer.render(scene, camera);
    labelRenderer.render(scene, camera); // Your CSS2DRenderer
}

function render() {

    renderer.render( scene, camera );

}

export {
    scene, camera, renderer, orbitControls, setupScene, setupOrbitControls, raycaster, mapMesh, mapDiameter, mapHeight, mapRadius, setupMapMesh,
    setupRaycaster, addLights, contextMenu, createContextMenu, removeContextMenu, handleResize, animate, setupDragControls,
    dragControls, render
};
