import './bootstrap';
import {CSS2DObject} from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import {populateHouseEditModal, populateTreeEditModal} from './modals.js';
import {formIsBeingSubmitted} from "./mouseHandlers.js";

// Create a label for house data
function createHouseLabel(houseData) {
    console.log("Creating house label", houseData);
    const houseLabelDiv = document.createElement('div');
    houseLabelDiv.className = 'label house-label';
    houseLabelDiv.id = `house-label${houseData.id}`;
    houseLabelDiv.style.top = '15px';
    houseLabelDiv.style.backgroundColor = '#fff';
    houseLabelDiv.style.borderBottom = '1px solid #ccc';
    houseLabelDiv.style.padding = '10px';
    houseLabelDiv.style.fontFamily = 'Arial, sans-serif';
    houseLabelDiv.pointerEvents = 'auto';
    

    let addressesContent;
    if (!houseData.addresses || houseData.addresses.length === 0) {
        addressesContent = '<p>No addresses found for this house.</p>';
    } else {
        addressesContent = `
            <ul class="list-unstyled"><strong>Addresses:</strong></ul>
            ${houseData.addresses.map((address, index) => `
                <li class="mx-2 decoration-none">${address.name} ${address.street}</li>
                ${index < houseData.addresses.length - 1 ? '<hr>' : ''}
            `).join('')}
        `;
    }

    houseLabelDiv.innerHTML = `
        ${addressesContent}
        <div class="d-flex justify-content-end gap-2">
            <a href="#" id="editHouse${houseData.id}" class="btn btn-sm btn-primary mt-2" data-bs-toggle="modal" data-bs-target="#editHouseAddressModal">Edit</a>
        </div>
    `;

    // Add event listener to the label itself to stop clicks from going through to 3D objects
    houseLabelDiv.addEventListener('pointerdown', function(event) {
        event.stopPropagation(); // Prevents the click from affecting the scene behind
        // console.log("House label clicked");
    });

    // Add event listener to the Edit button
    const editHouseButton = houseLabelDiv.querySelector(`#editHouse${houseData.id}`);
    if (editHouseButton) {
        editHouseButton.addEventListener('click', function(event) {
            event.preventDefault();
            event.stopPropagation(); // Prevent the event from propagating further
            populateHouseEditModal(houseData, houseData.addresses);
        });
    }

    return houseLabelDiv;
}

// Create a label for tree data
function createTreeLabel(treeData) {
    const treeLabelDiv = document.createElement('div');
    treeLabelDiv.className = 'label tree-label';
    treeLabelDiv.id = 'tree-label${treeData.id}';
    treeLabelDiv.style.backgroundColor = '#fff';
    treeLabelDiv.style.borderBottom = '1px solid #ccc';
    treeLabelDiv.style.padding = '10px';
    treeLabelDiv.style.fontFamily = 'Arial, sans-serif';
    treeLabelDiv.pointerEvents = 'auto',

    treeLabelDiv.innerHTML = `
        <p><strong>Tree ID:</strong> ${treeData.id}</p>
        <p><strong>Lat:</strong> ${treeData.data.lat}</p>
        <p><strong>Lon:</strong> ${treeData.data.lon}</p>
        <p><strong>Scale:</strong> ${treeData.data.scale}</p>
        <div class="d-flex justify-content-end gap-2">
            <a href="#" id="editTree${treeData.id}" class="btn btn-sm btn-primary" data-bs-toggle="modal"
               data-bs-target="#editTreeModal">Edit</a>
            <form id="deleteTreeForm${treeData.id}" method="POST" action="/tree/${treeData.id}">
                <input type="hidden" name="_token" value="${document.querySelector('meta[name="csrf-token"]').getAttribute('content')}">
                <input type="hidden" name="_method" value="DELETE">
                <button type="submit" class="btn btn-sm btn-danger">Delete</button>
            </form>
        </div>
    `;

    // Add event listener to the label itself to stop clicks from going through to 3D objects
    treeLabelDiv.addEventListener('pointerdown', function(event) {
        event.stopPropagation(); // Prevents the click from affecting the scene behind
    });

    const editTreeButton = treeLabelDiv.querySelector(`#editTree${treeData.id}`);
    if (editTreeButton) {
        editTreeButton.addEventListener('click', function(event) {
            event.preventDefault();
            // console.log("Opening tree edit modal...");
            event.stopPropagation(); // Prevent the event from propagating further

            // Hide the tree label when the modal opens
            treeLabelDiv.style.display = 'none';

            // Open the modal
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

    return treeLabelDiv;
}

export { createHouseLabel, createTreeLabel };


