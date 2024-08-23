import './bootstrap';
import '../css/app.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { InstancedMesh} from "three";

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
    const material = new THREE.MeshStandardMaterial({ color: 0x00ff00, side: THREE.DoubleSide });
    mapMesh = new THREE.Mesh(geometry, material);
    mapMesh.receiveShadow = true;
    mapMesh.rotation.x = Math.PI / 2; // Rotate 90 degrees along X-axis
    scene.add(mapMesh);

    // GRID HELPER
    let grid = new THREE.GridHelper(300, 10, "aqua", "gray");
    grid.rotation.x = Math.PI / 2;
    grid.position.z = 5.2
    scene.add(grid);

    // Create markers for each address
    const markerMaterial = new THREE.MeshStandardMaterial({ color: 0x0000ff });
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
    return { x, y };
}

// Function to convert integer scale to decimal scale
function integerToScale(integer) {
    const mapping = {
        1: 0.3,
        2: 0.6,
        3: 0.9,
        4: 1.2,
        5: 1.5
    };

    return mapping[integer] || 0.9; // Default scale if not found
}

// Load tree model
function loadTreeModel() {
    const treeLoader = new GLTFLoader();
    treeLoader.load('/assets/tree.glb', function (gltf) {
        // console.log('Loaded GLTF file:', gltf.scene);

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

        const trunkMaterial = trunkMeshGLTF.material;
        const leavesMaterial = leavesMeshGLTF.material;

        trunkMesh = new THREE.InstancedMesh(trunkGeometry, trunkMaterial, trees.length);
        leavesMesh = new THREE.InstancedMesh(leavesGeometry, leavesMaterial, trees.length);

        trunkMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        leavesMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

        scene.add(trunkMesh);
        scene.add(leavesMesh);
        // console.log(trunkMesh)

        trunkMesh.instanceMatrix.needsUpdate = true;
        leavesMesh.instanceMatrix.needsUpdate = true;


        trees.forEach((tree, index) => {
            // Convert the tree's latitude and longitude to map coordinates
            const treeCoords = latLonToMapCoords(tree.lat, tree.lon);
            // console.log(treeCoords);  // Debug: Log the calculated map coordinates

            // Convert integer scale to decimal
            const scale = integerToScale(tree.scale);

            // Set the position of the dummy object based on the map coordinates
            dummy.position.set(treeCoords.x, treeCoords.y, 10);  // Adjust z (height) as needed

            // Rotate the dummy to make the tree stand upright
            dummy.rotation.set(-Math.PI / 2, 0, 0);  // Rotate -90 degrees around the X-axis

            // Set the dummy's scale
            dummy.scale.set(scale, scale, scale);

            // Update the dummy's matrix and apply it to the instance
            dummy.updateMatrix();
            trunkMesh.setMatrixAt(index, dummy.matrix);
            leavesMesh.setMatrixAt(index, dummy.matrix);
        });

        // Ensure the instanced meshes are updated
        trunkMesh.instanceMatrix.needsUpdate = true;
        leavesMesh.instanceMatrix.needsUpdate = true;


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
    cardContainer.id = 'addressCardContainer';
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

    if (event.button !== 0) return; // Ignore if it's not a left-click

    // Update the raycaster based on the current mouse position
    raycaster.setFromCamera(mouse, camera);

    // Calculate objects intersecting the ray
    const intersects = raycaster.intersectObjects([...allHouses, mapMesh]);

    // console.log("Number of intersects:", intersects.length);
    // console.log("Intersects: ", intersects);

    // Clear existing address cards
    cardContainer.innerHTML = '';

    // Variable to check if a house was clicked
    let houseClicked = false;

    if (intersects.length > 0) {
        cardContainer.style.display = 'block';

        intersects.forEach((intersection, index) => {
            const object = intersection.object;

            // Log object data
            // console.log("Intersected Object Data:", object.userData);

            // Only create a card if the object is of type 'house'
            if (object.userData && object.userData.address) {
                houseClicked = true;  // Mark that a house was clicked

                // console.log(object.userData.address);
                // console.log(cardContainer);

                const card = document.createElement('div');
                card.className = 'address-card';
                card.style.position = 'absolute';
                card.style.width = `10rem`;
                card.style.left = `${event.clientX + (index * 180)}px`;
                card.style.top = `${event.clientY}px`; // Offset each card to avoid overlap
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
                        <form id="deleteForm${object.userData.id}" action="/delete-address/${object.userData.id}" method="POST">
                            <input type="hidden" name="_token" value="${document.querySelector('meta[name="csrf-token"]').getAttribute('content')}">
                            <input type="hidden" name="_method" value="DELETE">
                            <button type="submit" class="btn btn-sm btn-danger">Delete</button>
                        </form>
                    </div>
                `;
                // Append the new card to the container
                cardContainer.appendChild(card);

                // Attach event listeners for the Edit buttons
                document.getElementById(`editAddress${object.userData.id}`).addEventListener('click', function (event) {
                    event.preventDefault();
                    // Populate modal fields
                    document.getElementById('editHouseName').value = object.userData.house;
                    document.getElementById('editStreet').value = object.userData.street;
                    document.getElementById('editLatitude').value = object.userData.lat;
                    document.getElementById('editLongitude').value = object.userData.lon;
                    document.getElementById('editAddressForm').action = `/update-address/${object.userData.id}`;
                });            }
        });
    } else {
        cardContainer.style.display = 'none';
    }
}

// Mouse double click event handler
function onMouseDoubleClick(event) {
    if (event.button !== 0) return; // Ignore if it's not a left-click

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects([mapMesh]);

    // console.log("Number of intersects:", intersects.length);
    // console.log("Intersects: ", intersects);

    // Clear existing address cards
    cardContainer.innerHTML = '';


    if (intersects.length > 0) {
        intersectionPoint = intersects[0].point;
        // console.log('Coordinates:', intersectionPoint);

        intersects.forEach((intersection) => {
            const object = intersection.object;

            if (object === mapMesh) {
                // Calculate the clicked position in map coordinates
                const point = intersection.point;
                const normalizedX = (point.x + mapRadius) / mapDiameter;
                const normalizedY = (point.y + mapRadius) / mapDiameter;

                const lat = normalizedY * (latTopRight - latBottomLeft) + latBottomLeft;
                const lon = normalizedX * (lonTopRight - lonBottomLeft) + lonBottomLeft;

                // Display the coordinates
                const coordsCard = document.createElement('div');
                coordsCard.className = 'coords-card';
                coordsCard.style.position = 'absolute';
                coordsCard.style.width = `10rem`;
                coordsCard.style.left = `${event.clientX}px`;
                coordsCard.style.top = `${event.clientY}px`;
                coordsCard.style.border = '1px solid #ccc';
                coordsCard.style.borderRadius = '5px';
                coordsCard.style.padding = '10px';
                coordsCard.style.backgroundColor = '#fff';
                coordsCard.style.fontFamily = 'Arial, sans-serif';
                coordsCard.style.display = 'block';

                coordsCard.innerHTML = `
                <p><strong>Latitude:</strong> ${lat.toFixed(6)}</p>
                <p><strong>Longitude:</strong> ${lon.toFixed(6)}</p>
            `;

                cardContainer.appendChild(coordsCard);
            }
        });
    }
}

function mapCoordsToLatLon(x, y) {
    const normalizedLon = (x + mapRadius) / mapDiameter;
    const normalizedLat = (y + mapRadius) / mapDiameter;

    const lon = normalizedLon * (lonTopRight - lonBottomLeft) + lonBottomLeft;
    const lat = normalizedLat * (latTopRight - latBottomLeft) + latBottomLeft;

    return { lat, lon };
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
            <input type="hidden" name="scale" value="3"> <!-- Default scale, adjust if needed -->
            <button type="submit">Add Tree</button>
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
