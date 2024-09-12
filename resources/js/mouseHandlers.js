// Mouse move event handler: Handle mouse-related events and actions.
import * as THREE from "three";
import {createTreeLabel, createCoordsLabel} from './labels.js';
import {
    contextMenu,
    removeContextMenu,
    raycaster,
    camera,
    mapMesh,
    createContextMenu,
    render, setupDragControls, mapHeight
} from './map.js';
import { trunkMesh, leavesMesh, treeInstanceData } from './trees.js';
import { mapCoordsToLatLon } from './utils.js';
import { allHouses } from './houses.js';
import { populateHouseEditModal, deleteAddress, populateTreeEditModal } from './modals.js';


let intersectionPoint;
const mouse = new THREE.Vector2();

// Get the cardContainer element
const cardContainer = document.getElementById('cardContainer');

// Variable to check if a house or tree was clicked
let clicked = false;

// Variable to check if form is being submitted:
let formIsBeingSubmitted = false;

let currentLabel = null; // To keep track of the current label being displayed


function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

let enableSelection = false;


function onPointerDown( event ) {

    enableSelection = true;

}

function onPointerUp() {

    enableSelection = false;

}

function onHouseClick(event) {
    event.preventDefault();

    raycaster.setFromCamera(mouse, camera);

    // Check for intersections with all house objects
    const intersections = raycaster.intersectObjects(allHouses, true); // true ensures children are considered
    console.log("Intersections", intersections);

    if (intersections.length > 0) {
        const object = intersections[0].object; // Get the clicked object
        console.log("House part clicked: ", object.name);

        let parent = object.parent; // Get the parent (house group)
        console.log("Parent: ", parent.name, parent);

        // Check if the parent is a valid house group
        if (parent.userData && parent.userData.type === 'house') {
            let offsetY = (mapHeight / 2) + parent.userData.scale;
            // Enable DragControls passing the entire house group (parent)
            setupDragControls([parent], offsetY);
        }
    }

    render();
}

function onMouseClick(event) {
    if (event.button !== 0) return; // Ignore if it's not a left-click

    if (currentLabel) {
        currentLabel.visible = false;
        currentLabel = null;
    }

    // Remove context menu if clicked outside
    if (contextMenu && !contextMenu.contains(event.target)) {
        removeContextMenu();
    }
}

function onMouseDoubleClick(event) {
    if (event.button !== 0) return; // Ignore if it's not a left-click

    if (currentLabel) {
        currentLabel.visible = false;
        currentLabel = null;
    }

    // Remove context menu if clicked outside
    if (contextMenu && !contextMenu.contains(event.target)) {
        removeContextMenu();
    }

    // Check if the click is on a delete button
    if (event.target.closest('button') && event.target.closest('button').classList.contains('btn-danger')) {
        return;
    }

    raycaster.setFromCamera(mouse, camera);

    // Perform raycasting to find the intersected object (house, tree, etc.)
    const intersects = raycaster.intersectObjects([...allHouses, mapMesh, trunkMesh, leavesMesh]); // Checks which objects in the scene the ray intersects. For each intersected object, it creates an Intersection object, saved in the intersects[] array.


    // console.log("Number of intersects:", intersects.length);
    // console.log("Intersects: ", intersects);

    if (intersects.length > 0) {

        const intersection = intersects[0];
        intersectionPoint = intersection.point;
        // console.log('Coordinates:', intersectionPoint);

        const clickedObject = intersection.object;
        // console.log("clickedObject: ", clickedObject);

        if (clickedObject.userData.type === 'mapMesh') {

            // Convert Three.js coordinates (x, y) to latitude and longitude
            const { lat, lon } = mapCoordsToLatLon(intersection.point.x, intersection.point.z);
            // console.log('Latitude:', lat, 'Longitude:', lon);

            let coordsLabel = createCoordsLabel(lat, lon);
            // console.log("Coords Label: ", coordsLabel);
            coordsLabel.position.set(intersection.point.x, intersection.point.y, intersection.point.z);
            clickedObject.add(coordsLabel);

            // Store the label so it can be removed later
            currentLabel = coordsLabel;
        }

        // Check if the clicked object is a house (or any specific object type)
        let parent = clickedObject.parent;
        // console.log("parent: ", parent);
        while (parent) {
            if (parent.userData && parent.userData.type === 'house') {
                clicked = true;
                const houseData = parent.userData;
                const addresses = houseData.addresses;
                // console.log("House addresses: ", addresses)


                // Search for the parent houseGroup houseLabel child
                let houseLabel = parent.children.find(child => child.name === 'houseLabel');

                if (houseLabel) {
                    // console.log("House label is now visible:", houseLabel);
                    currentLabel = houseLabel;  // Store the label so it can be removed later
                    currentLabel.visible = true;  // Make the house label visible
                } else {
                    console.error("House label not found for this house.");
                }

                break; // Exit the loop once the house is found
            }
            parent = parent.parent;
        }

        // Handle tree interactions
        if (clickedObject === trunkMesh || clickedObject === leavesMesh) {
            const instanceIndex = intersection.instanceId;
            const treeData = treeInstanceData[instanceIndex];

            // Create the tree label
            let treeLabel = createTreeLabel(treeData);
            treeLabel.position.set(intersection.point.x, intersection.point.y, intersection.point.z);
            clickedObject.add(treeLabel);

            // Store the label so it can be removed later
            currentLabel = treeLabel;
        }
    }
}

// Context menu event handler
function onContextMenu(event) {
    event.preventDefault();

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
    mouse, currentLabel, onMouseMove, formIsBeingSubmitted, onContextMenu, onMouseClick, onMouseDoubleClick,
    populateTreeEditModal, populateHouseEditModal, deleteAddress, onHouseClick, onPointerDown, onPointerUp
}
