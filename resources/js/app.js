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


    // Iterate over houses variable and create the house using the db data
    houses.forEach(houseData => {
        console.log(houseData);

        const mapCoords = latLonToMapCoords(houseData.lat, houseData.lon);
        const scale = houseData.scale || 1;

        const house = HouseMod.create({wallColour: houseData.wallColour,
            roofColour: houseData.roofColour,
            doorColour: houseData.doorColour,
            windowColour: houseData.windowColour,
            doorStyle: houseData.doorStyle,
            windowStyle: houseData.windowStyle,
            scale: scale
        });

        const heightOffset = (mapHeight / 2) + scale;
        house.position.set(mapCoords.x, heightOffset, mapCoords.y);

        house.name = "house" + houseData.id;
        house.userData.id = houseData.id;
        house.userData.type = "house";
        house.userData.lat = houseData.lat;
        house.userData.lon = houseData.lon;
        house.userData.scale = houseData.scale;
        house.userData.doorStyle = houseData.doorStyle;
        house.userData.windowStyle = houseData.windowStyle;
        house.userData.doorColour = houseData.doorColour;
        house.userData.roofColour = houseData.roofColour;
        house.userData.wallColour = houseData.wallColour;
        house.userData.addresses = houseData.addresses; // Add addresses to house userData

        scene.add(house);
        console.log("House created with address: ", house.userData.addresses)
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

(function (HouseMod) {
    // CREATE SIMPLE DOOR
    var SimpleDoor = function (materials) {
        return new THREE.Mesh(new THREE.PlaneGeometry(1, 1.6), materials.door);
    };

    // CREATE FANCY DOOR
    var FancyDoor = function(materials) {
        materials = materials || materials_default;
        let doorBaseGeometry = new THREE.PlaneGeometry(1, 1.2);
        let doorBase = new THREE.Mesh(doorBaseGeometry, materials.door);
        doorBase.position.set(0, -0.2, 0);
        let doorCurveGeometry = new THREE.CircleGeometry(0.5);
        let doorCurve = new THREE.Mesh(doorCurveGeometry, materials.door);
        doorCurve.position.set(0, 0.4, 0);
        let doorGroup = new THREE.Group();
        doorGroup.add(doorBase);
        doorGroup.add(doorCurve);
        return doorGroup;
    };

    // CREATE CIRCULAR WINDOW
    var WindowCircle = function (materials) {
        return new THREE.Mesh(new THREE.CircleGeometry(0.5), materials.window);
    };

    // CREATE HOUSE TRIANGLE/GABLE PART
    var HouseTriangle = function (materials) {
        var geometry = new THREE.BufferGeometry(); // THREE.BufferGeometry is used to define a custom geometry
        var vertices = new Float32Array([ // vertices array defines three vertices of the triangle in 3D space
            -1, 0, 0, // Vertex 1
            0.5, 1.5, 0, // Vertex 2
            2, 0, 0 // Vertex 3
        ]);
        geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        geometry.computeVertexNormals();
        return new THREE.Mesh(geometry, materials.wall);
    };

    // CREATE HOUSE
    HouseMod.create = function ({
                                    wallColour = 0xffffff,
                                    roofColour = 0x202020,
                                    doorColour = 0xff0000,
                                    windowColour = 0x537d90,
                                    doorStyle = 'fancy',
                                    windowStyle = 'rectangular',
                                    scale = 3
                                } = {}) {
        const materials = {
            wall: new THREE.MeshStandardMaterial({ color: wallColour, side: THREE.DoubleSide }),
            roof: new THREE.MeshStandardMaterial({ color: roofColour, side: THREE.DoubleSide }),
            door: new THREE.MeshStandardMaterial({ color: doorColour }),
            window: new THREE.MeshStandardMaterial({ color: windowColour })
        };

        // HOUSE GROUP
        var house = new THREE.Group();
        house.scale.set(scale, scale, scale);
        house.castShadow = true;
        house.receiveShadow = true;
        house.userData.type = 'house';

        // HOUSE BASE
        var base = new THREE.Mesh(new THREE.BoxGeometry(3, 2, 4), materials.wall);
        base.castShadow = true;
        base.receiveShadow = true;
        house.add(base);

        // HOUSE TRIANGLE/GABLE PARTS
        var tri1 = HouseTriangle(materials);
        tri1.castShadow = true;
        tri1.receiveShadow = true;
        tri1.position.set(-0.5, 1, 2);
        house.add(tri1);

        var tri2 = HouseTriangle(materials);
        tri2.castShadow = true;
        tri2.receiveShadow = true;
        tri2.position.set(-0.5, 1, -2);
        house.add(tri2);

        // ROOF
        var roof1 = new THREE.Mesh(new THREE.PlaneGeometry(2.84, 4.5), materials.roof);
        roof1.position.set(-1, 1.51, 0);
        roof1.rotation.set(Math.PI * 0.5, Math.PI * 0.25, 0);
        roof1.castShadow = true;
        roof1.receiveShadow = true;
        house.add(roof1);

        var roof2 = new THREE.Mesh(new THREE.PlaneGeometry(2.84, 4.5), materials.roof);
        roof2.position.set(1, 1.51, 0);
        roof2.rotation.set(Math.PI * 0.5, Math.PI * -0.25, 0);
        roof2.castShadow = true;
        roof2.receiveShadow = true;
        house.add(roof2);

        // DOOR
        let door = doorStyle === 'fancy' ? FancyDoor(materials) : SimpleDoor(materials);
        door.position.set(0.5, -0.2, 2.1);
        house.add(door);

        // WINDOWS
        let window1, window2, window3;
        if (windowStyle === 'rectangular') {
            window1 = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), materials.window);
            window1.position.set(-0.75, 0.1, 2.1);
            house.add(window1);

            window2 = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), materials.window);
            window2.position.set(-1.6, 0.1, -1.1);
            window2.rotation.set(Math.PI * 0.5, Math.PI * 1.5, 0);
            house.add(window2);

            window3 = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), materials.window);
            window3.position.set(-1.6, 0.1, 1.1);
            window3.rotation.set(Math.PI * 0.5, Math.PI * 1.5, 0);
            house.add(window3);
        } else {
            let circleWindow1 = WindowCircle(materials);
            circleWindow1.position.set(-0.75, 0.5, 2.1);
            house.add(circleWindow1);
        }

        // HOUSE SHADOWS
        house.castShadow = true;
        house.receiveShadow = true;

        return house;
    };
}(window.HouseMod = window.HouseMod || {}));


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

        trunkMesh.castShadow = true;
        trunkMesh.receiveShadow = true;
        leavesMesh.castShadow = true;
        leavesMesh.receiveShadow = true;

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

            dummy.position.set(treeCoords.x, 10, treeCoords.y); // Set the x, y position of the dummy object based on the map coordinates
            dummy.rotation.z = Math.PI;  // Rotate to match the map's orientation
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
            treeInstanceData[index] = { id: tree.id, data: tree };
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

                    // // Attach event listeners to the delete buttons after rendering the forms
                    // document.querySelectorAll('.delete-address-btn').forEach(button => {
                    //     button.addEventListener('click', function(event) {
                    //         event.preventDefault();
                    //         const addressId = this.getAttribute('data-address-id');
                    //         const deleteForm = document.getElementById(`deleteAddressForm${addressId}`);
                    //
                    //         if (deleteForm) {
                    //             if (confirm("Are you sure you want to delete this address?")) {
                    //                 button.disabled = true; // Disable button to prevent multiple clicks
                    //
                    //                 const formData = new FormData(deleteForm);
                    //                 console.log(`/address/${addressId}`);
                    //                 fetch(`/address/${addressId}`, {
                    //                     method: 'DELETE',
                    //                     headers: {
                    //                         'X-CSRF-TOKEN': formData.get('_token'),
                    //                         'X-Requested-With': 'XMLHttpRequest',
                    //                         'Cache-Control': 'no-cache'
                    //                     }
                    //                 })
                    //                     .then(response => {
                    //                         button.disabled = false; // Re-enable button after request
                    //                         if (!response.ok) {
                    //                             throw new Error('Network response was not ok');
                    //                         }
                    //                         return response.json();
                    //                     })
                    //                     .then(data => {
                    //                         alert("Address deleted successfully!");
                    //                         document.getElementById(`editAddressForm${addressId}`).remove(); // Remove the form
                    //                     })
                    //                     .catch(error => {
                    //                         alert("Failed to delete address.");
                    //                         console.error(error);
                    //                     });
                    //             }
                    //         } else {
                    //             console.error('Delete form not found for address ID: ' + addressId);
                    //         }
                    //     });
                    // });

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
