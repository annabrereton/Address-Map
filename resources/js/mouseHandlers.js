// Mouse move event handler: Handle mouse-related events and actions.
import * as THREE from "three";
import {contextMenu, removeContextMenu, raycaster, setupRaycaster, camera, mapMesh, createContextMenu} from './map.js';
import { trunkMesh, leavesMesh, treeInstanceData } from './trees.js';
import { mapCoordsToLatLon } from './utils.js';
import { allHouses } from './houses.js';
import { createHouseCard, populateHouseEditModal, deleteAddress, createTreeCard, populateTreeEditModal } from './modals.js';


let intersectionPoint;
const mouse = new THREE.Vector2();

// Get the cardContainer element
const cardContainer = document.getElementById('cardContainer');

// Variable to check if a house or tree was clicked
let clicked = false;

// Variable to check if form is being submitted:
let formIsBeingSubmitted = false;

// Flag to keep track of processed tree instances
const processedTreeInstances = new Set();


function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    // console.log("Mouse move event:", mouse); // Debug log
}


// Mouse click event handler
function onMouseClick(event) {
    // console.log(event); // Check if the event is being received correctly
    // if (!event || event.button === undefined) {
    //     console.error('Mouse event is undefined or has no button property');
    //     return;
    // }

    // Remove context menu if clicked outside
    if (contextMenu && !contextMenu.contains(event.target)) {
        removeContextMenu();
    }

    // Ignore if it's not a left-click
    if (event.button !== 0) return;

    // Check if the click is on a delete button
    if (event.target.closest('button') && event.target.closest('button').classList.contains('btn-danger')) {
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

    // Check the raycaster has intersected objects
    if (intersects.length > 0) {
        // Display cardContainer if there are intersected objects
        cardContainer.style.display = 'block';

        // Process only the first intersected object
        const intersection = intersects[0];
        const object = intersection.object;
        console.log("Object: ", object);

        // Return if intersected object is mapMesh
        if (object === mapMesh) {
            return;
        }

        // Traverse up to the parent group to find the house group
        let parent = object.parent;
        while (parent) {
            if (parent.userData && parent.userData.type === 'house') {
                clicked = true;
                const houseData = parent.userData;
                const addresses = houseData.addresses;
                console.log("House addresses: ", addresses)
                // Create and display the address card
                // (Same logic for house address cards as before)
                createHouseCard(houseData, addresses, event);

                break; // Exit the loop once the house is found
            }
            parent = parent.parent;
        }

        // Handle tree interactions (no need to loop)
        if (object === trunkMesh || object === leavesMesh) {
            const instanceIndex = intersection.instanceId;

            const treeData = treeInstanceData[instanceIndex];

            // Create and display the tree card
            createTreeCard(treeData, event);
        }
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


export {
    mouse, onMouseClick, onMouseMove, onMouseDoubleClick, onContextMenu, formIsBeingSubmitted, populateTreeEditModal, populateHouseEditModal, deleteAddress
}
