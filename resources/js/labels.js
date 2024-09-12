import './bootstrap';
import {CSS2DObject} from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import {populateHouseEditModal, populateTreeEditModal} from './modals.js';
import {formIsBeingSubmitted} from "./mouseHandlers.js";

// Create a label for house data
function createHouseLabel(houseData, addresses) {
    const houseLabelDiv = document.createElement('houseLabelDiv');
    houseLabelDiv.className = 'label';
    houseLabelDiv.id = `house-label${houseData.id}`;
    houseLabelDiv.style.top = '15px';
    houseLabelDiv.style.backgroundColor = '#fff';
    houseLabelDiv.style.border = '1px solid #ccc';
    houseLabelDiv.style.borderRadius = '5px';
    houseLabelDiv.style.padding = '10px';
    houseLabelDiv.style.fontFamily = 'Arial, sans-serif';

    houseLabelDiv.innerHTML = `
       <ul class="list-unstyled"><strong>Addresses:</strong></ul>
        ${addresses.map((address, index) => `
            <li class="mx-2 decoration-none">${address.name} ${address.street}</li>
            ${index < addresses.length - 1 ? '<hr>' : ''}
        `).join('')}
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
            populateHouseEditModal(houseData, addresses);
        });
    }

    return new CSS2DObject(houseLabelDiv);
}

// Create a label for tree data
function createTreeLabel(treeData) {
    const treeLabelDiv = document.createElement('treeLabelDiv');
    treeLabelDiv.className = 'tree-label';
    treeLabelDiv.id = 'tree-label${treeData.id}';
    treeLabelDiv.style.backgroundColor = '#fff';
    treeLabelDiv.style.border = '1px solid #ccc';
    treeLabelDiv.style.borderRadius = '5px';
    treeLabelDiv.style.padding = '10px';
    treeLabelDiv.style.fontFamily = 'Arial, sans-serif';

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
        // console.log("House label clicked");
    });

    const editTreeButton = treeLabelDiv.querySelector(`#editTree${treeData.id}`);
    if (editTreeButton) {
        editTreeButton.addEventListener('click', function(event) {
            event.preventDefault();
            // console.log("Opening tree edit modal...");
            event.stopPropagation(); // Prevent the event from propagating further
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

    return new CSS2DObject(treeLabelDiv);
}

function createCoordsLabel(lat, lon) {
    // Display the coordinates
    const div = document.createElement('div');
    div.className = 'coords-card';
    div.style.position = 'absolute';
    div.style.width = '10rem';
    div.style.border = '1px solid #ccc';
    div.style.borderRadius = '5px';
    div.style.padding = '10px';
    div.style.backgroundColor = '#fff';
    div.style.fontFamily = 'Arial, sans-serif';
    div.style.zIndex = 1000;
    div.style.display = 'block';

    div.innerHTML = `
                <p><strong>Latitude:</strong> ${lat.toFixed(6)}</p>
                <p><strong>Longitude:</strong> ${lon.toFixed(6)}</p>
            `;

    return new CSS2DObject(div);
}

export { createHouseLabel, createTreeLabel, createCoordsLabel };


