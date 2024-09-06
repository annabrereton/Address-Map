<div class="modal fade" id="editHouseAddressModal" tabindex="-1" aria-labelledby="editHouseAddressModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="editHouseAddressModalLabel">Edit House and Addresses</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <ul class="nav nav-tabs" id="editTab" role="tablist">
                    <li class="nav-item" role="presentation">
                        <button class="nav-link active" id="edit-house-tab" data-bs-toggle="tab" data-bs-target="#edit-house" type="button" role="tab" aria-controls="edit-house" aria-selected="true">House Details</button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="edit-addresses-tab" data-bs-toggle="tab" data-bs-target="#edit-addresses" type="button" role="tab" aria-controls="edit-addresses" aria-selected="false">Addresses</button>
                    </li>
                </ul>
                <div class="tab-content" id="editTabContent">
                    <!-- Edit House Tab -->
                    <div class="tab-pane fade show active" id="edit-house" role="tabpanel" aria-labelledby="edit-house-tab">
                        <form id="editHouseForm" method="POST">
                            @csrf
                            @method('PUT')
                            <input type="hidden" id="house_id" name="house_id">

                            <div class="row mt-3">
                                <div class="col-4">
                                    <div class="input-group mb-3">
                                        <span class="input-group-text" id="basic-addon1">Scale</span>
                                        <select id="editHouseScale" name="scale" class="form-select" required>
                                            <option value="" disabled selected>Select a scale</option>
                                            <option value="1">1</option>
                                            <option value="2">2</option>
                                            <option value="3">3</option>
                                            <option value="4">4</option>
                                            <option value="5">5</option>
                                            <option value="6">6</option>
                                            <option value="7">7</option>
                                            <option value="8">8</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="col-4">
                                    <div class="input-group mb-3">
                                        <span class="input-group-text" id="basic-addon1">Window Style</span>
                                        <input type="text" class="form-control" id="editWindowStyle" name="window_style" required>
                                    </div>
                                </div>
                                <div class="col-4">
                                    <div class="input-group mb-3">
                                        <span class="input-group-text" id="basic-addon1">Door Style</span>
                                        <input type="text" class="form-control" id="editDoorStyle" name="door_style" required>
                                    </div>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-4">
                                    <div class="input-group mb-3">
                                        <span class="input-group-text" id="basic-addon1">Wall Colour</span>
                                        <input type="text" class="form-control" id="editWallColour" name="wall_colour" required>
                                    </div>
                                </div>
                                <div class="col-4">
                                    <div class="input-group mb-3">
                                        <span class="input-group-text" id="basic-addon1">Door Colour</span>
                                        <input type="text" class="form-control" id="editDoorColour" name="door_colour" required>
                                    </div>
                                </div>
                                <div class="col-4">
                                    <div class="input-group mb-3">
                                        <span class="input-group-text" id="basic-addon1">Roof Colour</span>
                                        <input type="text" class="form-control" id="editRoofColour" name="roof_colour" required>
                                    </div>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-6">
                                    <div class="input-group mb-3">
                                        <span class="input-group-text" id="basic-addon1">Latitude</span>
                                        <input type="text" class="form-control" id="editLat" name="lat" required>
                                    </div>
                                </div>
                                <div class="col-6">
                                    <div class="input-group mb-3">
                                        <span class="input-group-text" id="basic-addon1">Longitude</span>
                                        <input type="text" class="form-control" id="editLon" name="lon" required>
                                    </div>
                                </div>
                            </div>
                            <button type="submit" class="btn btn-primary">Save Changes</button>
                        </form>
                    </div>

                    <!-- Addresses Tab -->
                    <div class="tab-pane fade" id="edit-addresses" role="tabpanel" aria-labelledby="edit-addresses-tab">
                        <h5 class="mt-3">New Address</h5>
                        <button class="btn btn-secondary mt-3" type="button" data-bs-toggle="collapse" data-bs-target="#addNewAddressForm" aria-expanded="false" aria-controls="addNewAddressForm">Add</button>
                        <div class="collapse mt-3" id="addNewAddressForm">
                            <form id="newAddressForm" method="POST" action="{{ route('address.store') }}">
                                @csrf
                                <input type="hidden" name="house_id" id="newAddressHouseId">
                                <div class="input-group mb-3">
                                    <span class="input-group-text" id="basic-addon1">Name/Number</span>
                                    <input type="text" class="form-control" id="newAddressName" name="name" required>
                                </div>
                                <div class="input-group mb-3">
                                    <span class="input-group-text" id="basic-addon1">Street</span>
                                    <input type="text" class="form-control" id="newAddressStreet" name="street" required>
                                </div>
                                <button type="submit" class="btn btn-primary">Add Address</button>
                            </form>
                        </div>
{{--                        <hr>--}}
                        <div id="addressesContainer">
                            <!-- Address forms will be dynamically inserted here -->
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>


{{--<!-- Edit Address Modal -->--}}
{{--<div class="modal fade" id="editAddressModal" tabindex="-1" aria-labelledby="editAddressModalLabel" aria-hidden="true">--}}
{{--    <div class="modal-dialog">--}}
{{--        <div class="modal-content">--}}
{{--            <div class="modal-header">--}}
{{--                <h5 class="modal-title" id="editAddressModalLabel">Edit Address</h5>--}}
{{--                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>--}}
{{--            </div>--}}
{{--            <div class="modal-body">--}}
{{--                <form id="editAddressForm" method="POST">--}}
{{--                    @csrf--}}
{{--                    @method('PUT')--}}

{{--                    <div class="mb-3">--}}
{{--                        <label for="editAddressName" class="form-label">Name/Number</label>--}}
{{--                        <input type="text" class="form-control" id="editAddressName" name="house" required>--}}
{{--                    </div>--}}

{{--                    <div class="mb-3">--}}
{{--                        <label for="editAddressStreet" class="form-label">Street</label>--}}
{{--                        <input type="text" class="form-control" id="editAddressStreet" name="street" required>--}}
{{--                    </div>--}}

{{--                    <div class="mb-3">--}}
{{--                        <label for="editAddressLatitude" class="form-label">Latitude</label>--}}
{{--                        <input type="text" class="form-control" id="editAddressLatitude" name="latitude" required>--}}
{{--                    </div>--}}

{{--                    <div class="mb-3">--}}
{{--                        <label for="editAddressLongitude" class="form-label">Longitude</label>--}}
{{--                        <input type="text" class="form-control" id="editAddressLongitude" name="longitude" required>--}}
{{--                    </div>--}}

{{--                    <button type="submit" class="btn btn-primary">Save changes</button>--}}
{{--                </form>--}}
{{--            </div>--}}
{{--        </div>--}}
{{--    </div>--}}
{{--</div>--}}

