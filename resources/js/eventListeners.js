// Setup event listeners: Set up and manage all event listeners for mouse and window events.

import { onMouseClick, onMouseMove, onMouseDoubleClick, onContextMenu } from './mouseHandlers.js';
import { formIsBeingSubmitted, populateTreeEditModal, populateHouseEditModal, deleteAddress } from './mouseHandlers.js';

function setupTreeEventListeners(treeData) {
    // Add click event to populate tree edit modal
    const editTreeButton = document.getElementById(`editTree${treeData.id}`);
    if (editTreeButton) {
        editTreeButton.addEventListener('click', function(event) {
            event.preventDefault();
            populateTreeEditModal(treeData);  // Populate modal fields for tree editing
        });
    }

    // Add form submission event listener for tree deletion
    const deleteForm = document.getElementById(`deleteTreeForm${treeData.id}`);
    if (deleteForm) {
        deleteForm.addEventListener('submit', function() {
            formIsBeingSubmitted = true;  // Set flag when form is submitted
        });
    }
}

// function setupHouseEventListeners(houseData, addresses) {
//     console.log('Setting up house event listeners for house:', houseData.id);
//
//
//     // Add click event to populate tree edit modal
//     const editHouseButton = document.getElementById(`editHouse${houseData.id}`);
//     if (editHouseButton) {
//         editHouseButton.addEventListener('click', function(event) {
//             event.preventDefault();
//             // Populate the modal fields with house data for editing
//             populateHouseEditModal(houseData, addresses);
//         });
//     }
//
//     // Attach event listener to the Delete buttons
//     document.querySelectorAll('.delete-address-btn').forEach(button => {
//         button.addEventListener('click', function(event) {
//             event.preventDefault();
//             const addressId = this.getAttribute('data-address-id');
//             console.log(addressId);
//             deleteAddress(addressId);
//         });
//     });
// }

function setupEventListeners() {
    // console.log("Setting up event listeners");

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('click', onMouseClick);
    window.addEventListener('dblclick', onMouseDoubleClick);
    window.addEventListener('contextmenu', onContextMenu);
}

export {
    setupTreeEventListeners, setupEventListeners
};
