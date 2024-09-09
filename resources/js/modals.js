// Handle modal-related functionalities and interactions.

import axios from "./axiosConfig.js";
import {setupTreeEventListeners} from "./eventListeners.js";

function createHouseCard(houseData, addresses, event) {
    const card = document.createElement('div');
    card.className = 'addresses-card';
    card.style.position = 'absolute';
    card.style.width = '15rem';
    card.style.left = `${event.clientX}px`;
    card.style.top = `${event.clientY}px`;
    card.style.border = '1px solid #ccc';
    card.style.borderRadius = '5px';
    card.style.padding = '10px';
    card.style.paddingTop = '20px';
    card.style.backgroundColor = '#fff';
    card.style.fontFamily = 'Arial, sans-serif';
    card.style.display = 'block';

    let addressContent = `<ul><strong>Addresses:</strong></ul>`;

    // Iterate through addresses and append each to the card content
    addresses.forEach((address, index) => {
        addressContent += `
            <li class="ms-4 decoration-none">${address.name} ${address.street}</li>
            ${index < addresses.length - 1 ? '<hr>' : ''}
        `;
    });

    card.innerHTML = `
        ${addressContent}
        <div class="d-flex justify-content-end gap-2">
            <a href="#" id="editHouse${houseData.id}" class="btn btn-sm btn-primary" data-bs-toggle="modal"
               data-bs-target="#editHouseAddressModal">Edit</a>
        </div>
    `;

    // Append the card to the container
    cardContainer.appendChild(card);

    // Set up event listener for the edit house button
    const editHouseButton = document.getElementById(`editHouse${houseData.id}`);
    if (editHouseButton) {
        editHouseButton.addEventListener('click', function(event) {
            event.preventDefault();
            // Populate the modal fields with house data for editing
            populateHouseEditModal(houseData, addresses);
        });
    }
}

function populateHouseEditModal(houseData, addresses) {
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

    // Set house ID for the new address form
    document.getElementById('newAddressHouseId').value = houseData.id;

    // Populate the addresses in the modal
    const addressesContainer = document.getElementById('addressesContainer');
    addressesContainer.innerHTML = ''; // Clear existing content
    const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

    // Check if there are any addresses
    if (addresses.length > 0) {
        // If addresses exist, show the <h5> header
        addressesContainer.insertAdjacentHTML('afterbegin', '<hr> <h5>Existing Addresses</h5>');

        addresses.forEach((address, index) => {
            const addressForm = `
                                <form id="editAddressForm${address.id}" method="POST" action="/address/${address.id}" class="my-3">
                                    <input type="hidden" name="_token" value="${csrfToken}">
                                    <input type="hidden" name="_method" value="PUT"> <!-- Use PUT method for updates -->
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
                                            <button type="button" class="btn btn-danger delete-address-btn  w-100" data-address-id="${address.id}">Delete</button>
                                        </div>
                                    </div>
                                </form>
                                ${index < addresses.length - 1 ? '<hr>' : ''}
                                <form id="deleteAddressForm${address.id}" method="POST" action="/address/${address.id}">
                                    <input type="hidden" name="_token" value="${csrfToken}">
                                </form>
                            `;
            addressesContainer.insertAdjacentHTML('beforeend', addressForm);
        });
        // Add event listener for dynamically created delete buttons
        addressesContainer.addEventListener('click', function(event) {
            if (event.target && event.target.classList.contains('delete-address-btn')) {
                event.preventDefault();
                const addressId = event.target.getAttribute('data-address-id');
                deleteAddress(addressId);
            }
        });
    }
}

function deleteAddress(addressId) {
    console.log(`Attempting to delete address with ID: ${addressId}`);

    if (confirm("Are you sure you want to delete this address?")) {
        const actionUrl = `/address/${addressId}`; // URL for the DELETE request

        axios.delete(actionUrl)
            .then(response => {
                alert('Address deleted successfully!');

                // Remove the address form from the DOM
                const formToRemove = document.getElementById(`editAddressForm${addressId}`);
                if (formToRemove) {
                    formToRemove.remove();
                }

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

function createTreeCard(treeData, event) {
    const card = document.createElement('div');
    card.className = 'tree-card';
    card.style.position = 'absolute';
    card.style.width = '10rem';
    card.style.left = `${event.clientX}px`;
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

    // Append the card to the container
    cardContainer.appendChild(card);

    // Set up event listeners for the newly created tree card - delete/edit
    setupTreeEventListeners(treeData);
}

// Function to populate the tree edit modal with tree data
function populateTreeEditModal(treeData) {
    document.getElementById('treeToEditId').textContent = treeData.id;
    document.getElementById('treeLatitude').value = treeData.data.lat;
    document.getElementById('treeLongitude').value = treeData.data.lon;
    document.getElementById('treeScale').value = String(treeData.data.scale);
    document.getElementById('editTreeForm').action = `/tree/${treeData.id}`;
}

export { createHouseCard, populateHouseEditModal, deleteAddress, createTreeCard, populateTreeEditModal };
