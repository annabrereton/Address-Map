<!-- Edit Address Modal -->
<div class="modal fade" id="editAddressModal" tabindex="-1" aria-labelledby="editAddressModalLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="editAddressModalLabel">Edit Address</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <form id="editAddressForm" method="POST">
                    @csrf
                    @method('PUT')

                    <div class="mb-3">
                        <label for="editHouseName" class="form-label">Name/Number</label>
                        <input type="text" class="form-control" id="editHouseName" name="house" required>
                    </div>

                    <div class="mb-3">
                        <label for="editStreet" class="form-label">Street</label>
                        <input type="text" class="form-control" id="editStreet" name="street" required>
                    </div>

                    <div class="mb-3">
                        <label for="editLatitude" class="form-label">Latitude</label>
                        <input type="text" class="form-control" id="editLatitude" name="latitude" required>
                    </div>

                    <div class="mb-3">
                        <label for="editLongitude" class="form-label">Longitude</label>
                        <input type="text" class="form-control" id="editLongitude" name="longitude" required>
                    </div>

                    <button type="submit" class="btn btn-primary">Save changes</button>
                </form>
            </div>
        </div>
    </div>
</div>

