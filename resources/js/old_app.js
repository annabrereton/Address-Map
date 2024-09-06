import './bootstrap';
import '../css/app.css';
import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {InstancedMesh} from "three";
import axios from 'axios';

axios.defaults.headers.common['X-CSRF-TOKEN'] = document.querySelector('meta[name="csrf-token"]').getAttribute('content');


// Global variables
let scene, camera, renderer, controls;
let mapMesh, trunkMesh, leavesMesh;
let allHouses = [];
const addresses = window.addresses || [];
const trees = window.trees || [];
const mapDiameter = 300;        // Diameter in meters
const mapHeight = 10;           // Height of the cylinder
const mapRadius = mapDiameter / 2;
const latBottomLeft = 0;
const lonBottomLeft = 0;
const latTopRight = 1;
const lonTopRight = 1;
const dummy = new THREE.Object3D();
const raycaster = new THREE.Raycaster();
const treeInstanceData = []; // Initialize treeInstanceData as an empty array or object to store the tree data associated with each instance
const mouse = new THREE.Vector2();
const cardContainer = document.createElement('div');
let contextMenu;
let intersectionPoint;

// Initialize the scene
function init() {
    // Basic scene setup
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Set up camera position
    camera.position.z = 400;

    // Create a cylinder geometry for the map
    const geometry = new THREE.CylinderGeometry(mapRadius, mapRadius, mapHeight, 64);
    const material = new THREE.MeshStandardMaterial({color: 0x00ff00, side: THREE.DoubleSide});
    mapMesh = new THREE.Mesh(geometry, material);
    mapMesh.receiveShadow = true;
    mapMesh.name = 'mapMesh';
    mapMesh.rotation.x = Math.PI / 2; // Rotate 90 degrees along X-axis
    scene.add(mapMesh);
    console.log(mapMesh);

    // GRID HELPER
    let grid = new THREE.GridHelper(300, 10, "aqua", "gray");
    grid.rotation.x = Math.PI / 2;
    grid.position.z = 5.2
    scene.add(grid);

    // Create markers for each address
    const markerMaterial = new THREE.MeshStandardMaterial({color: 0x0000ff});
    addresses.forEach(address => {
        const mapCoords = latLonToMapCoords(address.lat, address.lon);
        const markerGeometry = new THREE.BoxGeometry(10, 10, 10); // Cube size
        const house = new THREE.Mesh(markerGeometry, markerMaterial);
        house.castShadow = true;
        house.receiveShadow = true;
        house.userData.type = house;
        house.userData.id = address.id;
        house.userData.address = address.house + ' ' + address.street;
        house.userData.house = address.house;
        house.userData.street = address.street;
        house.userData.lat = address.lat;
        house.userData.lon = address.lon;
        house.position.set(mapCoords.x, mapCoords.y, mapHeight / 2 + 5); // Adjust Z position
        scene.add(house);
        allHouses.push(house);
    });

    // Load tree model and set up instanced meshes
    loadTreeModel();

    // Set up GUI or controls
    setupControls();

    // Add lighting
    addLights();

    // Add card container for displaying information
    setupCardContainer();

    // Set up event listeners
    setupEventListeners();

    // Start animation loop
    animate();

    // Handle window resize
    window.addEventListener('resize', handleResize);
}

// Convert latitude and longitude to map coordinates
function latLonToMapCoords(lat, lon) {
    const normalizedLat = (lat - latBottomLeft) / (latTopRight - latBottomLeft);
    const normalizedLon = (lon - lonBottomLeft) / (lonTopRight - lonBottomLeft);
    const x = normalizedLon * mapDiameter - mapRadius;
    const y = normalizedLat * mapDiameter - mapRadius;
    return {x, y};
}

// Function to convert integer scale to decimal scale
function integerToScale(integer) {
    const mapping = {
        1: 0.2,
        2: 0.4,
        3: 0.5,
        4: 0.6,
        5: 0.7,
        6: 0.8,
        7: 0.9,
        8: 1.0
    };

    return mapping[integer] || 0.9; // Default scale if not found
}

// Load tree model
function loadTreeModel() {
    const treeLoader = new GLTFLoader();
    treeLoader.load('/assets/tree.glb', function (gltf) {
        console.log('Loaded GLTF file:', gltf.scene);

        const trunkMeshGLTF = gltf.scene.getObjectByName('treetrunk');
        const leavesMeshGLTF = gltf.scene.getObjectByName('treeleaves');

        if (!trunkMeshGLTF || !leavesMeshGLTF) {
            console.error('Error: Trunk or Leaves mesh not found in the GLTF file');
            return;
        }

        const trunkGeometry = trunkMeshGLTF.geometry.clone();
        const leavesGeometry = leavesMeshGLTF.geometry.clone();

        const defaultTransform = new THREE.Matrix4()
            .makeRotationX(Math.PI)
            .multiply(new THREE.Matrix4().makeScale(7, 7, 7));

        trunkGeometry.applyMatrix4(defaultTransform);
        leavesGeometry.applyMatrix4(defaultTransform);

        const trunkMaterial = trunkMeshGLTF.material.clone();  // Clone to allow modifications
        const leavesMaterial = leavesMeshGLTF.material.clone();  // Clone to allow modifications

        // Ensure the material settings allow the color to show as intended
        leavesMaterial.transparent = false;  // Disable transparency
        leavesMaterial.color = new THREE.Color(0xffffff);  // Set base color to white
        if (leavesMaterial.map) {
            leavesMaterial.map = null;  // Remove any texture map
        }

        trunkMesh = new THREE.InstancedMesh(trunkGeometry, trunkMaterial, trees.length);
        leavesMesh = new THREE.InstancedMesh(leavesGeometry, leavesMaterial, trees.length);

        trunkMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        leavesMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

        scene.add(trunkMesh);
        scene.add(leavesMesh);
        // console.log(trunkMesh)

        trunkMesh.instanceMatrix.needsUpdate = true;
        leavesMesh.instanceMatrix.needsUpdate = true;

        // Iterate through the trees variable to position according to db values
        trees.forEach((tree, index) => {
            // Convert the tree's latitude and longitude to map coordinates
            const treeCoords = latLonToMapCoords(tree.lat, tree.lon);
            // console.log(treeCoords);  // Debug: Log the calculated map coordinates

            // Convert integer scale to decimal
            const scale = integerToScale(tree.scale);

            dummy.position.set(treeCoords.x, treeCoords.y, 10); // Set the x, y position of the dummy object based on the map coordinates
            dummy.rotation.set(-Math.PI / 2, 0, 0);  // Rotate -90 degrees around the X-axis
            dummy.scale.set(scale, scale, scale); // Set the dummy's scale
            dummy.updateMatrix(); // Update the dummy's matrix and apply it to the instance

            trunkMesh.setMatrixAt(index, dummy.matrix);
            leavesMesh.setMatrixAt(index, dummy.matrix);

            // Set colors from database
            const trunkColor = new THREE.Color(tree.trunk_colour || '#8B4513');  // Default to a brown color if not set
            const leavesColor = new THREE.Color(tree.leaf_colour || '#00FF00');  // Default to green if not set

            trunkMesh.setColorAt(index, trunkColor);
            leavesMesh.setColorAt(index, leavesColor);

            // Store the tree ID and other relevant data
            treeInstanceData[index] = {id: tree.id, data: tree};
        });

        // Ensure the instanced meshes are updated
        trunkMesh.instanceMatrix.needsUpdate = true;
        leavesMesh.instanceMatrix.needsUpdate = true;
        trunkMesh.instanceColor.needsUpdate = true;
        leavesMesh.instanceColor.needsUpdate = true;

        console.log("Tree Instance Data: ", treeInstanceData);

    }, undefined, function (error) {
        console.error('An error occurred while loading the GLTF model:', error);
    });
}

// Setup controls
function setupControls() {
    controls = new OrbitControls(camera, renderer.domElement);
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

// Setup card container for displaying address info
function setupCardContainer() {
    cardContainer.id = 'cardContainer';
    cardContainer.style.position = 'absolute';
    cardContainer.style.top = '0px';
    cardContainer.style.left = '0px';
    cardContainer.style.width = '100vw';
    cardContainer.style.height = '100vh';
    document.body.appendChild(cardContainer);
}

// Setup event listeners
function setupEventListeners() {
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('click', onMouseClick);
    window.addEventListener('dblclick', onMouseDoubleClick);
    window.addEventListener('contextmenu', onContextMenu);
}

// Mouse move event handler
function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

// Mouse click event handler
function onMouseClick(event) {
    // Remove context menu if clicked outside
    if (contextMenu && !contextMenu.contains(event.target)) {
        removeContextMenu();
    }

    // Ignore if it's not a left-click
    if (event.button !== 0) return;

    // Check if the click is on a delete button
    if (event.target.closest('button') && event.target.closest('button').classList.contains('btn-danger')) {
        // Don't clear the container or do anything if a delete button was clicked
        return;
    }

    // Update the raycaster based on the current mouse position
    raycaster.setFromCamera(mouse, camera);

    // Calculate objects intersecting the ray
    const intersects = raycaster.intersectObjects([...allHouses, mapMesh, trunkMesh, leavesMesh]); // Checks which objects in the scene the ray intersects. For each intersected object, it creates an Intersection object, saved in the intersects[] array.

    // console.log("Number of intersects:", intersects.length);
    // console.log("Intersects: ", intersects);

    // Clear existing address cards
    cardContainer.innerHTML = '';

    // Variable to check if a house or tree was clicked
    let clicked = false;

    // Flag to keep track of processed tree instances
    const processedTreeInstances = new Set();

    if (intersects.length > 0) {
        cardContainer.style.display = 'block';

        intersects.forEach((intersection, index) => {
            const object = intersection.object;

            // Log object data
            // console.log("Intersected Object Data:", object.userData);

            if (object === mapMesh) {
                // Handle map interactions if needed
                return;
            }

            // Handle house interactions
            if (object.userData && object.userData.address) {
                clicked = true;

                const card = document.createElement('div');
                card.className = 'address-card';
                card.style.position = 'absolute';
                card.style.width = `10rem`;
                card.style.left = `${event.clientX + (index * 180)}px`;
                card.style.top = `${event.clientY}px`;
                card.style.border = '1px solid #ccc';
                card.style.borderRadius = '5px';
                card.style.padding = '10px';
                card.style.backgroundColor = '#fff';
                card.style.fontFamily = 'Arial, sans-serif';
                card.style.display = 'block';

                card.innerHTML = `
                    <p><strong>Address:</strong> ${object.userData.address}</p>
                    <p><strong>Lat:</strong> ${object.userData.lat}</p>
                    <p><strong>Lon:</strong> ${object.userData.lon}</p>
                    <div class="d-flex justify-content-end gap-2">
                        <a href="#" id="editAddress${object.userData.id}" class="btn btn-sm btn-primary" data-bs-toggle="modal"
                           data-bs-target="#editAddressModal">Edit</a>
                        <form id="deleteAddressForm${object.userData.id}" action="/address/${object.userData.id}" method="POST">
                            <input type="hidden" name="_token" value="${document.querySelector('meta[name="csrf-token"]').getAttribute('content')}">
                            <input type="hidden" name="_method" value="DELETE">
                            <button type="submit" class="btn btn-sm btn-danger">Delete</button>
                        </form>
                    </div>
                `;
                cardContainer.appendChild(card);

                // Add form submission event listener
                document.getElementById(`deleteAddressForm${object.userData.id}`).addEventListener('submit', function () {
                    formIsBeingSubmitted = true; // Set flag when form is submitted
                });

                document.getElementById(`editAddress${object.userData.id}`).addEventListener('click', function (event) {
                    event.preventDefault();
                    document.getElementById('editAddressName').value = object.userData.house;
                    document.getElementById('editAddressStreet').value = object.userData.street;
                    document.getElementById('editAddressLatitude').value = object.userData.lat;
                    document.getElementById('editAddressLongitude').value = object.userData.lon;
                    document.getElementById('editAddressForm').action = `/address/${object.userData.id}`;
                });
            }

            // Handle tree interactions
            if (object === trunkMesh || object === leavesMesh) {
                const instanceIndex = intersection.instanceId;

                // Ensure that the instance is only processed once per click
                if (!processedTreeInstances.has(instanceIndex)) {
                    processedTreeInstances.add(instanceIndex);

                    const treeData = treeInstanceData[instanceIndex];
                    console.log("Tree instance: ", instanceIndex, "TreeData: ", treeData);

                    // Here you can handle the treeData, e.g., show information or edit the tree
                    clicked = true;

                    const card = document.createElement('div');
                    card.className = 'tree-card';
                    card.style.position = 'absolute';
                    card.style.width = `10rem`;
                    card.style.left = `${event.clientX + (index * 180)}px`;
                    card.style.top = `${event.clientY}px`;
                    card.style.border = '1px solid #ccc';
                    card.style.borderRadius = '5px';
                    card.style.padding = '10px';
                    card.style.backgroundColor = '#fff';
                    card.style.fontFamily = 'Arial, sans-serif';
                    card.style.display = 'block';

                    card.innerHTML = `
                        <p><strong>Tree ID:</strong> ${treeData.id}</p>
                        <p><strong>Lat:</strong> ${treeData.data.lat}</p>
                        <p><strong>Lon:</strong> ${treeData.data.lon}</p>
                        <p><strong>Scale:</strong> ${treeData.data.scale}</p>
                        <div class="d-flex justify-content-end gap-2">
                            <a href="#" id="editTree${object.userData.id}" class="btn btn-sm btn-primary" data-bs-toggle="modal"
                               data-bs-target="#editTreeModal">Edit</a>
                            <form id="deleteTreeForm${object.userData.id}" action="/tree/${treeData.id}" method="POST">
                                <input type="hidden" name="_token" value="${document.querySelector('meta[name="csrf-token"]').getAttribute('content')}">
                                <input type="hidden" name="_method" value="DELETE">
                                <button type="submit" class="btn btn-sm btn-danger">Delete</button>
                            </form>
                        </div>
                    `;
                    cardContainer.appendChild(card);

                    // Add form submission event listener
                    // document.getElementById(`deleteTreeForm${object.userData.id}`).addEventListener('submit', function() {
                    //     formIsBeingSubmitted = true; // Set flag when form is submitted
                    // });
                    const formElement = document.getElementById(`deleteTreeForm${object.userData.id}`);
                    if (formElement) {
                        formElement.addEventListener('submit', function () {
                            formIsBeingSubmitted = true; // Set flag when form is submitted
                        });
                    } else {
                        console.error(`Element with ID deleteTreeForm${object.userData.id} not found`);
                    }

                    document.getElementById(`editTree${object.userData.id}`).addEventListener('click', function (event) {
                        event.preventDefault();
                        // Populate modal fields for tree editing
                        document.getElementById('treeToEditId').textContent = treeData.id;
                        document.getElementById('treeLatitude').value = treeData.data.lat;
                        document.getElementById('treeLongitude').value = treeData.data.lon;
                        document.getElementById('treeScale').value = String(treeData.data.scale);
                        document.getElementById('editTreeForm').action = `/tree/${treeData.id}`;
                    });
                }
            }
        });

        if (!clicked) {
            cardContainer.style.display = 'none';
        }
    } else {
        cardContainer.style.display = 'none';
    }
}

// Mouse double click event handler
function onMouseDoubleClick(event) {
    if (event.button !== 0) return; // Ignore if it's not a left-click

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects([mapMesh]);

    console.log("Number of intersects:", intersects.length);
    console.log("Intersects: ", intersects);

    // Clear existing address cards
    cardContainer.innerHTML = '';


    if (intersects.length > 0) {
        cardContainer.style.display = 'block';

        const intersection = intersects[0];
        intersectionPoint = intersection.point;
        console.log('Coordinates:', intersectionPoint);

        const object = intersection.object;
        console.log('object: ', object.name)
        if (object === mapMesh) {
            console.log('mapMesh: ', object.name)
            // Calculate the clicked position in map coordinates
            const point = intersection.point;
            const normalizedX = (point.x + mapRadius) / mapDiameter;
            const normalizedY = (point.y + mapRadius) / mapDiameter;
            console.log('Normalized X:', normalizedX);
            console.log('Normalized Y:', normalizedY);

            const lat = normalizedY * (latTopRight - latBottomLeft) + latBottomLeft;
            const lon = normalizedX * (lonTopRight - lonBottomLeft) + lonBottomLeft;
            console.log(lat, lon);
            console.log('Clicked Object:', object);

            // Display the coordinates
            const card = document.createElement('div');
            card.className = 'coords-card';
            card.style.position = 'absolute';
            card.style.width = `10rem`;
            card.style.left = `${event.clientX}px`;
            card.style.top = `${event.clientY}px`;
            card.style.border = '1px solid #ccc';
            card.style.borderRadius = '5px';
            card.style.padding = '10px';
            card.style.backgroundColor = '#fff';
            card.style.fontFamily = 'Arial, sans-serif';
            card.style.zIndex = 1000;
            card.style.display = 'block';

            card.innerHTML = `
            <p><strong>Latitude:</strong> ${lat.toFixed(6)}</p>
            <p><strong>Longitude:</strong> ${lon.toFixed(6)}</p>
        `;

            cardContainer.appendChild(card);
            console.log(card)
        }
    }
}

// <p><strong>Latitude:</strong> ${lat.toFixed(6)}</p>
// <p><strong>Longitude:</strong> ${lon.toFixed(6)}</p>

function mapCoordsToLatLon(x, y) {
    const normalizedLon = (x + mapRadius) / mapDiameter;
    const normalizedLat = (y + mapRadius) / mapDiameter;

    const lon = normalizedLon * (lonTopRight - lonBottomLeft) + lonBottomLeft;
    const lat = normalizedLat * (latTopRight - latBottomLeft) + latBottomLeft;

    return {lat, lon};
}

// Add contextmenu
function createContextMenu(x, y, point) {
    if (contextMenu) {
        contextMenu.remove();
    }

    // Get CSRF token from meta tag
    const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

    // Convert Three.js coordinates to latitude and longitude
    const latLon = mapCoordsToLatLon(point.x, point.y);

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

// Context menu event handler
function onContextMenu(event) {
    event.preventDefault();

    // Remove existing address and coordinates cards
    cardContainer.innerHTML = '';

    // Update the raycaster based on the current mouse position
    raycaster.setFromCamera(mouse, camera);

    // Calculate objects intersecting the ray
    const intersects = raycaster.intersectObjects([...allHouses, mapMesh]);

    if (intersects[0].object === mapMesh) {
        const intersection = intersects[0];
        const point = intersection.point; // The precise position on the map mesh

        createContextMenu(event.clientX, event.clientY, point);
    } else {
        removeContextMenu();
    }
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
    controls.update();
    renderer.render(scene, camera);
}

// Initialize the scene
init();
