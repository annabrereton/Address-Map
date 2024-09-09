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

                    <div class="row">
                        <div class="col-6">
                            <div class="input-group mb-3">
                                <span class="input-group-text" id="basic-addon1">Latitude</span>
                                <input type="text" class="form-control" id="houseLatitude" name="lat" value="0.350000" required>
                            </div>
                        </div>
                        <div class="col-6">
                            <div class="input-group mb-3">
                                <span class="input-group-text" id="basic-addon1">Longitude</span>
                                <input type="text" class="form-control" id="houseLongitude" name="lon" value="0.600000" required>
                            </div>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-4">
                            <div class="input-group mb-3">
                                <span class="input-group-text" id="basic-addon1">Wall</span>
                                <input type="color" class="form-control" id="wallColour" name="wall_colour" placeholder="Hex code" value="#ffffff" >
                            </div>
                        </div>
                        <div class="col-4">
                            <div class="input-group mb-3">
                                <span class="input-group-text" id="basic-addon1">Roof</span>
                                <input type="color" class="form-control" id="roofColour" name="roof_colour" placeholder="Hex code" value="#e23f24" >
                            </div>
                        </div>
                        <div class="col-4">
                            <div class="input-group mb-3">
                                <span class="input-group-text" id="basic-addon1">Door</span>
                                <input type="color" class="form-control" id="doorColour" name="door_colour" placeholder="Hex code" value="#16499d" >
                            </div>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-6">
                            <div class="input-group mb-3">
                                <span class="input-group-text" id="basic-addon1">Door</span>
                                <select id="doorStyle" name="door_style" class="form-select" required>
                                    <option value="" disabled >Select</option>
                                    <option value="simple" selected>Simple</option>
                                    <option value="fancy">Fancy</option>
                                </select>
                            </div>
                        </div>
                        <div class="col-6">
                            <div class="input-group mb-3">
                                <span class="input-group-text" id="basic-addon1">Window</span>
                                <select id="windowStyle" name="window_style" class="form-select" required>
                                    <option value="" disabled >Select</option>
                                    <option value="rectangular" selected >Rectangular</option>
                                    <option value="circular">Circular</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div class="row">
                        <div class="input-group mb-3">
                            <span class="input-group-text" id="basic-addon1">Scale</span>
                            <select id="houseScale" name="scale" class="form-select" required>
                                <option value="" disabled >Select a scale</option>
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3" selected>3</option>
                                <option value="4">4</option>
                                <option value="5">5</option>
                                <option value="6">6</option>
                                <option value="7">7</option>
                                <option value="8">8</option>
                            </select>
                        </div>
                    </div>

                    <div class="text-end">
                        <button type="submit" class="btn btn-primary">Save House</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>


