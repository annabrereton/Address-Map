import './bootstrap';
import '../css/app.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { InstancedMesh} from "three";
import axios from 'axios';

// Automatically include CSRF token in all Axios requests
axios.defaults.headers.common['X-CSRF-TOKEN'] = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

// Global variables
let scene, camera, renderer, controls;
let mapMesh, trunkMesh, leavesMesh;
let allHouses = [];
// const addresses = window.addresses || [];
const trees = window.trees || [];
const houses = window.houses || [];
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
    // camera.position.z = 400;
    camera.position.set(10, 20, 200);  // x, y, z
    camera.lookAt(0, 0, 0);  // Make the camera look at the center of the map

    // Create a cylinder geometry for the map
    const mapGeometry = new THREE.CylinderGeometry(mapRadius, mapRadius, mapHeight, 64);
    const mapMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00, side: THREE.DoubleSide });
    mapMesh = new THREE.Mesh(mapGeometry, mapMaterial);
    mapMesh.receiveShadow = true;
    // mapMesh.rotation.y = Math.PI / 2; // Rotate 90 degrees along Y-axis
    scene.add(mapMesh);

    // GRID HELPER
    let grid = new THREE.GridHelper(300, 10, "aqua", "gray");
    grid.rotation.y = Math.PI / 2;
    grid.position.z = 5.2
    scene.add(grid);


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

    console.log("Number of intersects:", intersects.length);
    console.log("Intersects: ", intersects);

    // Clear existing address cards
    cardContainer.innerHTML = '';

    // Variable to check if a house or tree was clicked
    let clicked = false;

    // Variable to check if form is being submitted:
    let formIsBeingSubmitted;

    // Flag to keep track of processed tree instances
    const processedTreeInstances = new Set();

    if (intersects.length > 0) {
        cardContainer.style.display = 'block';

        // Process only the first intersected object for houses
        const object = intersects[0].object;

        if (object === mapMesh) {
            // Handle map interactions if needed
            return;
        }

        // Traverse up to the parent group to find the house group
        let parent = object.parent;


        while (parent) {
            if (parent.userData && parent.userData.type === 'house') {
                clicked = true;
                const houseData = parent.userData;
                const addresses = houseData.addresses;

                // Create a single address card container
                const card = document.createElement('div');
                card.className = 'addresses-card';
                card.style.position = 'absolute';
                card.style.width = `15rem`;
                card.style.left = `${event.clientX}px`;
                card.style.top = `${event.clientY}px`;
                card.style.border = '1px solid #ccc';
                card.style.borderRadius = '5px';
                card.style.padding = '10px';
                card.style.paddingTop = '20px';
                card.style.backgroundColor = '#fff';
                card.style.fontFamily = 'Arial, sans-serif';
                card.style.display = 'block';

                let addressContent = `
                <ul><strong>Addresses:</strong></ul>`;

                // Iterate through addresses and append each to the card content
                addresses.forEach((address, index) => {
                    addressContent += `
                    <li class="ms-4 decoration-none">${address.name} ${address.street}</li>
                    ${index < addresses.length - 1 ? '<hr>' : ''} <!-- Add an <hr> between addresses except after the last one -->
                `;
                });

                // Set the inner HTML of the card with all the addresses
                card.innerHTML = `
                    ${addressContent}
                    <div class="d-flex justify-content-end gap-2">
                        <a href="#" id="editHouse${houseData.id}" class="btn btn-sm btn-primary" data-bs-toggle="modal"
                           data-bs-target="#editHouseAddressModal">Edit</a>
                    </div>
                `;

                // Append the card to the container
                cardContainer.appendChild(card);


                // Attach the edit event listener to open the modal
                document.getElementById(`editHouse${houseData.id}`).addEventListener('click', function(event) {
                    event.preventDefault();
                    console.log(houseData);
                    // Set house data in the edit modal
                    document.getElementById('house_id').value = houseData.id;
                    document.getElementById('editHouseScale').value = String(houseData.scale);
                    document.getElementById('editWallColour').value = houseData.wallColour;
                    document.getElementById('editDoorColour').value = houseData.doorColour;
                    document.getElementById('editWindowStyle').value = houseData.windowStyle;
                    document.getElementById('editDoorStyle').value = houseData.doorStyle;
                    document.getElementById('editRoofColour').value = houseData.roofColour;
                    document.getElementById('editLat').value = houseData.lat;
                    document.getElementById('editLon').value = houseData.lon;
                    document.getElementById('editHouseForm').action = `/house/${houseData.id}`;


                    // Populate the addresses in the modal
                    const addressesContainer = document.getElementById('addressesContainer');
                    addressesContainer.innerHTML = ''; // Clear existing content
                    const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

                    // Check if there are any addresses
                    if (addresses.length > 0) {
                        // If addresses exist, show the <h5> header
                        addressesContainer.insertAdjacentHTML('afterbegin', '<hr> <h5>Existing Addresses</h5>');

                        addresses.forEach((address, index) => {
                            console.log("id: " + address.id);
                            const addressForm = `
                        <form id="editAddressForm${address.id}" method="POST" action="/address/${address.id}" class="my-3">
                            <input type="hidden" name="_token" value="${csrfToken}"> <!-- CSRF Token -->
<!--                            <input type="hidden" name="_method" value="PUT"> &lt;!&ndash; Method Spoofing &ndash;&gt;-->

                            <input type="hidden" name="address_id" value="${address.id}">

                            <div class="row">
                                 <div class="col-10">
                                    <div class="input-group mb-3">
                                        <span class="input-group-text" id="basic-addon1">Name/Number</span>
                                        <input type="text" class="form-control" id="editAddressName${address.id}" name="name" value="${address.name}" required>
                                    </div>
                                    <div class="input-group mb-3">
                                        <span class="input-group-text" id="basic-addon1">Street</span>
                                        <input type="text" class="form-control" id="editAddressStreet${address.id}" name="street" value="${address.street}" required>
                                    </div>
                                </div>

                                <div class="col-2 align-content-start text-center">
                                    <button type="submit" class="btn btn-primary w-100 mb-2">Save</button>
                                    <!-- Delete Button Inside Edit Form, but linked to external form -->
                                    <button type="button" class="btn btn-danger delete-address-btn  w-100" data-address-id="${address.id}">Delete</button>
                                </div>
                            </div>
                        </form>
                    </div>
                    ${index < addresses.length - 1 ? '<hr>' : ''} <!-- Add an <hr> between addresses except after the last one -->

                    <!-- Delete Address Form outside of the Edit Form -->
                    <form id="deleteAddressForm${address.id}" method="POST" action="/address/${address.id}">
                        <input type="hidden" name="_token" value="${csrfToken}"> <!-- CSRF Token -->
<!--                        <input type="hidden" name="_method" value="DELETE"> &lt;!&ndash; Method Spoofing &ndash;&gt;-->
                    </form>
                    `;
                            addressesContainer.insertAdjacentHTML('beforeend', addressForm);
                        });

                        // Attach event listener to the Delete buttons
                        document.querySelectorAll('.delete-address-btn').forEach(button => {
                            button.addEventListener('click', function (event) {
                                event.preventDefault();
                                const addressId = this.getAttribute('data-address-id');
                                deleteAddress(addressId);
                            });
                        });
                    }

                    // Function to handle the delete form submission (DELETE request)
                    function deleteAddress(addressId) {
                        if (confirm("Are you sure you want to delete this address?")) {
                            const deleteForm = document.getElementById(`deleteAddressForm${addressId}`);
                            const formData = new FormData(deleteForm);
                            const actionUrl = `/address/${addressId}`; // URL for the DELETE request

                            axios({
                                method: 'delete',
                                url: actionUrl,
                                headers: {
                                    'X-CSRF-TOKEN': formData.get('_token'),  // Include CSRF token from the form
                                    'X-Requested-With': 'XMLHttpRequest'    // Required for Laravel's AJAX request validation
                                }
                            })
                                .then(response => {
                                    alert('Address deleted successfully!');
                                    // Remove the form from the DOM
                                    document.getElementById(`editAddressForm${addressId}`).remove();

                                    // Check if there are any address forms left
                                    const remainingForms = document.querySelectorAll('[id^=editAddressForm]');
                                    if (remainingForms.length === 0) {
                                        // Remove the <h5> header if no addresses remain
                                        const elementsToRemove = document.querySelectorAll('#addressesContainer h5, #addressesContainer hr');
                                        elementsToRemove.forEach(element => element.remove());
                                    }
                                    console.log(response);
                                })
                                .catch(error => {
                                    // Handle error response
                                    alert('Failed to delete address.');
                                    console.error(error);
                                });
                        }
                    }
                    // Set house ID for the new address form
                    document.getElementById('newAddressHouseId').value = houseData.id;
                });

                break; // Exit the loop once the house is found
            }
            parent = parent.parent;
        }

        // Use forEach to handle tree interactions
        intersects.forEach((intersection, index) => {
            const object = intersection.object;

            // Handle tree interactions
            if (object === trunkMesh || object === leavesMesh) {
                const instanceIndex = intersection.instanceId;

                // Ensure that the instance is only processed once per click
                if (!processedTreeInstances.has(instanceIndex)) {
                    processedTreeInstances.add(instanceIndex);

                    const treeData = treeInstanceData[instanceIndex];
                    console.log("Tree instance: ", instanceIndex, "TreeData: ", treeData);

                    // Handle the treeData, e.g., show information or edit the tree
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
                        <a href="#" id="editTree${treeData.id}" class="btn btn-sm btn-primary" data-bs-toggle="modal"
                           data-bs-target="#editTreeModal">Edit</a>
                        <form id="deleteTreeForm${treeData.id}" action="/tree/${treeData.id}" method="POST">
                            <input type="hidden" name="_token" value="${document.querySelector('meta[name="csrf-token"]').getAttribute('content')}">
                            <input type="hidden" name="_method" value="DELETE">
                            <button type="submit" class="btn btn-sm btn-danger">Delete</button>
                        </form>
                    </div>
                `;
                    cardContainer.appendChild(card);

                    // Add form submission event listener
                    document.getElementById(`deleteTreeForm${treeData.id}`).addEventListener('submit', function() {
                        formIsBeingSubmitted = true; // Set flag when form is submitted
                    });

                    document.getElementById(`editTree${treeData.id}`).addEventListener('click', function (event) {
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

    // console.log("Number of intersects:", intersects.length);
    // console.log("Intersects: ", intersects);

    // Clear existing address cards
    cardContainer.innerHTML = '';

    if (intersects.length > 0) {
        cardContainer.style.display = 'block';

        const intersection = intersects[0];
        intersectionPoint = intersection.point;
        // console.log('Coordinates:', intersectionPoint);

        const object = intersection.object;
        // console.log('object: ', object.name);

        if (object === mapMesh) {

            // Convert Three.js coordinates (x, y) to latitude and longitude
            const { lat, lon } = mapCoordsToLatLon(intersection.point.x, intersection.point.y);
            // console.log('Latitude:', lat, 'Longitude:', lon);

            // Display the coordinates
            const card = document.createElement('div');
            card.className = 'coords-card';
            card.style.position = 'absolute';
            card.style.width = '10rem';
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
        }
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
