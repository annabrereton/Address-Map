import './bootstrap';
import '../css/app.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';


document.addEventListener('DOMContentLoaded', function() {
    // Access addresses from global window object
    const addresses = window.addresses || []; // Default to an empty array if addresses is not defined

    // Basic scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Set up camera position
    camera.position.z = 400;

    // Map dimensions in world units (meters)
    const mapDiameter = 300;        // Diameter in meters
    const mapHeight = 10;           // Height of the cylinder
    const mapRadius = mapDiameter / 2;

    // Define fake coordinate bounds (for demonstration purposes)
    const latBottomLeft = 0;
    const lonBottomLeft = 0;
    const latTopRight = 1;
    const lonTopRight = 1;

    // Function to convert latitude and longitude to map coordinates
    function latLonToMapCoords(lat, lon) {
    const normalizedLat = (lat - latBottomLeft) / (latTopRight - latBottomLeft);
    const normalizedLon = (lon - lonBottomLeft) / (lonTopRight - lonBottomLeft);

    const x = normalizedLon * mapDiameter - mapRadius;
    const y = normalizedLat * mapDiameter - mapRadius;

    return {x, y};
}

    // Create a cylinder geometry for the map
    const geometry = new THREE.CylinderGeometry(mapRadius, mapRadius, mapHeight, 64);
    const material = new THREE.MeshStandardMaterial({color: 0x00ff00, side: THREE.DoubleSide});
    const mapMesh = new THREE.Mesh(geometry, material);
    mapMesh.receiveShadow = true;
    mapMesh.userData.name = 'mapMesh';
    mapMesh.userData.type = mapMesh;

    // Rotate the cylinder to make it horizontal
    mapMesh.rotation.x = Math.PI / 2;       // Rotate 90 degrees along X-axis
    scene.add(mapMesh);

    // Create markers for each address
    const markerMaterial = new THREE.MeshStandardMaterial({color: 0x0000ff});         // Blue cubes

    let allHouses = [];

    addresses.forEach(address => {
        // console.log(address.house + ' ' + address.street);
    const mapCoords = latLonToMapCoords(address.lat, address.lon);
    const markerGeometry = new THREE.BoxGeometry(10, 10, 10);       // Cube size
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
    house.position.set(mapCoords.x, mapCoords.y, mapHeight / 2 + 5);       // Adjust Z position to sit on top of the cylinder
    scene.add(house);
    allHouses.push(house);
    });

    // CREATE RAYCASTER FOR DETECTING CLICKS
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // ADD DOM ELEMENT TO DISPLAY ADDRESS
    const cardContainer = document.createElement('div');
    cardContainer.id = 'addressCardContainer';
    cardContainer.style.position = 'absolute';
    cardContainer.style.top = '0px';
    cardContainer.style.left = '0px';
    cardContainer.style.width = '100vw';
    cardContainer.style.height = '100vh';
    document.body.appendChild(cardContainer);
    console.log("Card Container:", cardContainer);

    // UPDATE MOUSE VARIABLE ON MOUSE MOVE
    window.addEventListener('mousemove', (event) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    });

    const loader = new GLTFLoader();

    // HANDLE SINGLE LEFT CLICK
    window.addEventListener('click', (event) => {
        // Remove context menu if clicked outside
        if (contextMenu && !contextMenu.contains(event.target)) {
            removeContextMenu();
        }
        if (event.button !== 0) return; // Ignore if it's not a left-click
        // Remove context menu if clicked outside

        // Update the raycaster based on the current mouse position
        raycaster.setFromCamera(mouse, camera);

        // Calculate objects intersecting the ray
        const intersects = raycaster.intersectObjects([...allHouses, mapMesh]);

        console.log("Number of intersects:", intersects.length);
        console.log("Intersects: ", intersects);

        // Clear existing address cards
        cardContainer.innerHTML = '';

        // Variable to check if a house was clicked
        let houseClicked = false;

        if (intersects.length > 0) {
            cardContainer.style.display = 'block'; // Ensure container is shown

            intersects.forEach((intersection, index) => {
                const object = intersection.object;

                // Log object data
                console.log("Intersected Object Data:", object.userData);

                // Only create a card if the object is of type 'house'
                if (object.userData && object.userData.address) {
                    houseClicked = true;  // Mark that a house was clicked

                    console.log(object.userData.address);
                    console.log(cardContainer);

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
                                <button type="submit" id="removeHouse${object.userData.id}" class="btn btn-sm btn-danger">Delete</button>
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
                    });
                }
            });
        } else {
            // Hide the card container if no object was clicked
            cardContainer.style.display = 'none';
        }
    });

    // HANDLE DOUBLE LEFT CLICK (showing coordinates)
    window.addEventListener('dblclick', (event) => {
        // Update the raycaster based on the current mouse position
        raycaster.setFromCamera(mouse, camera);

        // Calculate objects intersecting the ray
        const intersects = raycaster.intersectObjects([mapMesh]);

        console.log("Number of intersects:", intersects.length);
        console.log("Intersects: ", intersects);

        // Clear existing address cards
        cardContainer.innerHTML = '';

        if (intersects.length > 0) {
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
    });

    // HANDLE RIGHT CLICKS (CONTEXT MENU)
    let contextMenu;
    let intersectionPoint;

    function createContextMenu(x, y, point) {
        if (contextMenu) {
            contextMenu.remove();
        }

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
        <button id="addTree">Add Tree</button>
    `;

        document.body.appendChild(contextMenu);

        // Store the intersection point when creating the context menu
        intersectionPoint = point;

        document.getElementById('addTree').addEventListener('click', () => {
            if (intersectionPoint) {
                addTreeAtPosition(intersectionPoint);
                removeContextMenu();
            } else {
                console.error('Intersection point is undefined');
            }
        });
    }

    function removeContextMenu() {
        if (contextMenu) {
            contextMenu.remove();
            contextMenu = null;
        }
    }

    //Add tree function
    function addTreeAtPosition(position) {
        loader.load('/assets/tree.glb', function (gltf) {
            const tree = gltf.scene;

            // Set the tree's position at the intersection point
            tree.position.copy(position);

            // Rotate and scale the tree model as needed
            tree.rotation.x = Math.PI / 2; // Rotate 90 degrees along X-axis
            tree.scale.set(2, 2, 2); // Scale the tree

            // Add the tree to the scene
            scene.add(tree);
        });
    }

    window.addEventListener('contextmenu', (event) => {
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
// console.log(point)
            createContextMenu(event.clientX, event.clientY, point);
        } else {
            removeContextMenu();
        }
    });
    // window.addEventListener('contextmenu', (event) => {
    //     event.preventDefault(); // Prevent the default context menu
    //
    //     // Update the raycaster based on the current mouse position
    //     raycaster.setFromCamera(mouse, camera);
    //
    //     // Calculate objects intersecting the ray
    //     const intersects = raycaster.intersectObjects([mapMesh]);
    //
    //     if (intersects.length > 0) {
    //         const intersection = intersects[0];
    //
    //         // Check if the only object intersected is the mapMesh
    //         if (intersection.object === mapMesh) {
    //             // Create the context menu
    //             const contextMenu = document.createElement('div');
    //             contextMenu.style.position = 'absolute';
    //             contextMenu.style.left = `${event.clientX}px`;
    //             contextMenu.style.top = `${event.clientY}px`;
    //             contextMenu.style.border = '1px solid #ccc';
    //             contextMenu.style.borderRadius = '5px';
    //             contextMenu.style.padding = '10px';
    //             contextMenu.style.marginBottom = '0px';
    //             contextMenu.style.backgroundColor = '#fff';
    //             contextMenu.style.fontFamily = 'Arial, sans-serif';
    //
    //             contextMenu.innerHTML = `<p class="mb-0">Add tree</p>`;
    //             document.body.appendChild(contextMenu);
    //
    //             // Add event listener to 'Add tree' option
    //             contextMenu.addEventListener('click', () => {
    //                 loader.load('/assets/tree.glb', function (gltf) {
    //                     const tree = gltf.scene;
    //
    //                     // Set the tree's position at the intersection point
    //                     tree.position.copy(intersection.point);
    //
    //                     // Rotate 90 degrees along X-axis
    //                     tree.rotation.x = Math.PI / 2;
    //
    //                     // Scale the tree model
    //                     tree.scale.set(2, 2, 2);
    //
    //                     scene.add(tree);
    //                 });
    //
    //                 // Remove the context menu after clicking
    //                 document.body.removeChild(contextMenu);
    //             });
    //
    //             // Remove context menu if user clicks elsewhere
    //             window.addEventListener('click', function removeMenu(event) {
    //                 if (contextMenu.contains(event.target)) return;
    //                 document.body.removeChild(contextMenu);
    //                 window.removeEventListener('click', removeMenu);
    //             });
    //         }
    //     }
    // });


    // Ambient light (soft, scattered light)
    const ambientLight = new THREE.AmbientLight(0x404040, 1.5);         // Soft white light, slightly stronger
    scene.add(ambientLight);

    // Directional light (sharp, directional shadows)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(100, 200, 100);
    directionalLight.target.position.set(0, 0, 0);
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

    // Visual helpers
    // const lightHelper = new THREE.DirectionalLightHelper(directionalLight, 5);
    // scene.add(lightHelper);
    // scene.add(new THREE.CameraHelper(directionalLight.shadow.camera));

    // Controls to navigate the scene
    const controls = new OrbitControls(camera, renderer.domElement);

    // GRID HELPER
    let grid = new THREE.GridHelper(300, 10, "aqua", "gray");
    grid.rotation.x = Math.PI / 2;
    grid.position.z = 5.2
    scene.add(grid);

    function animate() {
    requestAnimationFrame(animate);
    controls.update();      // Required for controls to work
    renderer.render(scene, camera);
}
    animate();

    // Handle window resize
    window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});
})
;
