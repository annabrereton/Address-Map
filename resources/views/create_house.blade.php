<!-- Create House Modal -->
<div class="modal fade" id="createHouseModal" tabindex="-1" aria-labelledby="createHouseModalLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="createHouseModalLabel">Create House</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <form id="createHouseForm" action="{{ route('house.store') }}" method="POST">
                    @csrf

                    <div class="input-group mb-3">
                        <span class="input-group-text" id="basic-addon1">Latitude</span>
                        <input type="text" class="form-control" id="houseLatitude" name="lat" required>
                    </div>

                    <div class="input-group mb-3">
                        <span class="input-group-text" id="basic-addon1">Longitude</span>
                        <input type="text" class="form-control" id="houseLongitude" name="lon" required>
                    </div>

                    <div class="input-group mb-3">
                        <span class="input-group-text" id="basic-addon1">Scale</span>
                        <select id="houseScale" name="scale" class="form-select" required>
                            <option value="" disabled selected>Select a scale</option>
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                        </select>
                    </div>

                    <div class="input-group mb-3">
                        <span class="input-group-text" id="basic-addon1">Wall Colour</span>
                        <input type="text" class="form-control" id="wallColour" name="wall_colour" placeholder="Hex code" >
                    </div>

                    <div class="input-group mb-3">
                        <span class="input-group-text" id="basic-addon1">Roof Colour</span>
                        <input type="text" class="form-control" id="roofColour" name="roof_colour" placeholder="Hex code" >
                    </div>

                    <div class="input-group mb-3">
                        <span class="input-group-text" id="basic-addon1">Door Colour</span>
                        <input type="text" class="form-control" id="doorColour" name="door_colour" placeholder="Hex code" >
                    </div>

                    <div class="input-group mb-3">
                        <span class="input-group-text" id="basic-addon1">Door Style</span>
                        <select id="doorStyle" name="door_style" class="form-select" required>
                            <option value="" disabled selected>Select a scale</option>
                            <option value="simple">Simple</option>
                            <option value="fancy">Fancy</option>
                        </select>
                    </div>

                    <div class="input-group mb-3">
                        <span class="input-group-text" id="basic-addon1">Window style</span>
                        <select id="windowStyle" name="window_style" class="form-select" required>
                            <option value="" disabled selected>Select a style</option>
                            <option value="simple">Rectangular</option>
                            <option value="fancy">Circular</option>
                        </select>
                    </div>

                    <div class="text-end">
                        <button type="submit" class="btn btn-primary">Save House</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>


