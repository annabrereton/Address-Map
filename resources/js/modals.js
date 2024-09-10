// Handle modal-related functionalities and interactions.

import {fetchHouses, renderHouses, allHouses} from "./houses.js";
import {scene} from "./map.js";
import {currentLabel} from "./mouseHandlers.js";

function populateHouseEditModal(houseData, addresses) {
    console.log("Populating modal...", houseData);

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
            const addressForm = `<form id="editAddressForm${address.id}" method="POST" action="/address/${address.id}" class="my-3">
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
                                ${index < addresses.length - 1 ? `<hr id="divider${address.id}">` : ''}
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

        currentLabel.visible = false;
        currentLabel = null;  // Clear the reference
    }
}

async function deleteAddress(addressId, houseData) {
    console.log(`Attempting to delete address with ID: ${addressId}`);

    if (confirm("Are you sure you want to delete this address?")) {
        const actionUrl = `/address/${addressId}`; // URL for the DELETE request

        try {
            const response = await fetch(actionUrl, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete address');
            }

            // Success: Handle UI updates
            alert('Address deleted successfully!');

            // Remove the address form from the DOM
            const formElementsToRemove = document.querySelectorAll(`#editAddressForm${addressId}, #divider${addressId}`);
            formElementsToRemove.forEach(element => element.remove());

            // Check if there are any address forms left
            const remainingForms = document.querySelectorAll('[id^=editAddressForm]');
            if (remainingForms.length === 0) {
                // Remove the <h5> header if no addresses remain
                const elementsToRemove = document.querySelectorAll('#addressesContainer h5, #addressesContainer hr');
                elementsToRemove.forEach(element => element.remove());
            }

            // Fetch updated house data and refresh the map
            await updateMapAfterDeletion();
        } catch (error) {
            alert('Failed to delete address.');
            console.error('Error:', error);
        }
    }
}

// Clear houses function - Add a check before calling dispose to prevent errors
function clearHouses() {
    console.log(allHouses);
    allHouses.forEach(houseGroup => {
        console.log(houseGroup);

        // Dispose of the meshes inside the house group
        houseGroup.children.forEach(child => {
            if (child.isMesh) {
                child.geometry.dispose();
                child.material.dispose();
            }
        });

        // Remove the group from the scene
        scene.remove(houseGroup);
    });

    // Clear the contents of allHouses without reassigning it
    allHouses.length = 0;
}

// This function will handle fetching the updated house data and refreshing the map
async function updateMapAfterDeletion() {
    try {
        // Call the API to fetch updated house data
        const housesData = await fetchHouses();

        // Clear the current houses from the map
        clearHouses();

        // Re-render houses on the map using the fetched data
        renderHouses(housesData);

    } catch (error) {
        console.error('Error in updateMapAfterDeletion:', error);
    }
}

// Function to populate the tree edit modal with tree data
function populateTreeEditModal(treeData) {
    console.log("Populating tree modal...");
    document.getElementById('treeToEditId').textContent = treeData.id;
    document.getElementById('treeLatitude').value = treeData.data.lat;
    document.getElementById('treeLongitude').value = treeData.data.lon;
    document.getElementById('treeScale').value = String(treeData.data.scale);
    document.getElementById('editTreeForm').action = `/tree/${treeData.id}`;

    currentLabel.visible = false;
    currentLabel = null;  // Clear the reference
}

export { populateHouseEditModal, deleteAddress, populateTreeEditModal };


