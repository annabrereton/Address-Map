import * as THREE from "three";
import {
    contextMenu,
    removeContextMenu,
    mapMesh,
    createContextMenu,
    checkIntersection,
    sceneState
} from './map.js';
import { SCENESTATE } from './SceneState.js';
import { populateHouseEditModal, deleteAddress, populateTreeEditModal } from './modals.js';


const alerts = window.alerts;
const alertsWrapper = window.alertsWrapper;

export let currentLabel = null;
export let intersectionPoint = new THREE.Vector3();

// Variable to check if a house or tree was clicked
// let clicked = false;

// Variable to check if form is being submitted:
let formIsBeingSubmitted = false;

export function onMouseMove(event) {
    sceneState.handleMouseMove(event);
}

export function onMouseClick(event) {
    if (event.button !== 0) return;

    // If a modal is open, skip further interaction
    const modalIsOpen = document.querySelector('.modal.show');
    if (modalIsOpen) return;

    if (alerts) {
        alertsWrapper.style.display = 'none'; // Remove alert elements
    } 

    // Remove context menu if clicked outside
    if (contextMenu && !contextMenu.contains(event.target)) {
        removeContextMenu();
    }
    
    // Update mouse position in SceneState
    sceneState.handleMouseMove(event);

    // Handle the click using SceneState
    sceneState.handleClick(event);    
}

// Context menu event handler
function onContextMenu(event) {
    event.preventDefault();

    const intersection = checkIntersection(sceneState.mouse);

    if (intersection.object === mapMesh) {
        const point = intersection.point; // The precise position on the map mesh

        createContextMenu(event.clientX, event.clientY, point);
    } else {
        removeContextMenu();
    }
}


export {
    formIsBeingSubmitted, 
    onContextMenu,
    populateTreeEditModal, 
    populateHouseEditModal, 
    deleteAddress
}
