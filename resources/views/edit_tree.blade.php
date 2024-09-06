<!-- Edit Tree Modal -->
<div class="modal fade" id="editTreeModal" tabindex="-1" aria-labelledby="editTreeModalLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="editTreeModalLabel">Edit Tree <span id="treeToEditId"></span></h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <form id="editTreeForm" method="POST">
                    @csrf
                    @method('PUT')

                    <div class="input-group mb-3">
                        <span class="input-group-text" id="basic-addon1">Latitude</span>
                        <input type="text" class="form-control" id="treeLatitude" name="latitude" required>
                    </div>

                    <div class="input-group mb-3">
                        <span class="input-group-text" id="basic-addon1">Longitude</span>
                        <input type="text" class="form-control" id="treeLongitude" name="longitude" required>
                    </div>

                    <div class="input-group mb-3">
                        <span class="input-group-text" id="basic-addon1">Scale</span>
                        <select id="treeScale" name="scale" class="form-select" required>
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

                    <div class="input-group mb-3">
                        <span class="input-group-text" id="basic-addon1">Leaf Colour</span>
                        <input type="text" class="form-control" id="leafColour" name="leaf_colour" placeholder="Hex code" >
                    </div>

                    <div class="input-group mb-3">
                        <span class="input-group-text" id="basic-addon1">Trunk Colour</span>
                        <input type="text" class="form-control" id="trunkColour" name="trunk_colour" placeholder="Hex code" >
                    </div>

                    <button type="submit" class="btn btn-primary">Save changes</button>
                </form>
            </div>
        </div>
    </div>
</div>


