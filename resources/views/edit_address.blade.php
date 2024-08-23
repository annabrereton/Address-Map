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
                        <label for="editAddressName" class="form-label">Name/Number</label>
                        <input type="text" class="form-control" id="editAddressName" name="house" required>
                    </div>

                    <div class="mb-3">
                        <label for="editAddressStreet" class="form-label">Street</label>
                        <input type="text" class="form-control" id="editAddressStreet" name="street" required>
                    </div>

                    <div class="mb-3">
                        <label for="editAddressLatitude" class="form-label">Latitude</label>
                        <input type="text" class="form-control" id="editAddressLatitude" name="latitude" required>
                    </div>

                    <div class="mb-3">
                        <label for="editAddressLongitude" class="form-label">Longitude</label>
                        <input type="text" class="form-control" id="editAddressLongitude" name="longitude" required>
                    </div>

                    <button type="submit" class="btn btn-primary">Save changes</button>
                </form>
            </div>
        </div>
    </div>
</div>

