<!DOCTYPE html>

<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title>Address Map</title>

    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>
    @vite('resources/js/app.js')
    @vite('resources/css/app.css')
</head>


<body>

@include('edit_address')
@include('edit_tree')
@include('create_house')

    <div id="container"></div>

    <script>
        {{--window.addresses = @json($addresses);--}}
        window.trees = @json($trees);
        window.houses = @json($houses);
    </script>

    <!-- Button to Open Create House modal -->
    <a href="#" id="createHouse" class="btn btn-sm btn-primary" data-bs-toggle="modal"
   data-bs-target="#createHouseModal">Create House</a>


    <!-- Form to add a house/address -->
    <div id="updateContainer" class="card">
        <form id="houseForm" action="{{ route('address.store') }}" method="post">
            @csrf

            <h5 class="ms-2 mb-3">Add an address:</h5>

            <div class="input-group mb-3">
                <span class="input-group-text" id="basic-addon1">Name</span>
                <input type="text" class="form-control" id="house" name="house" placeholder="Name/number" required>
            </div>

            <div class="input-group mb-3">
                <span class="input-group-text" id="basic-addon1">Street</span>
                <input type="text" class="form-control" id="street" name="street" placeholder="Street address" required>
            </div>

            <div class="input-group mb-3">
                <span class="input-group-text" id="basic-addon1">Latitude</span>
                <input type="text" class="form-control" id="latitude" name="latitude" placeholder="Decimal coordinates" required>
            </div>

            <div class="input-group mb-3">
                <span class="input-group-text" id="basic-addon1">Longitude</span>
                <input type="text" class="form-control" id="longitude" name="longitude" placeholder="Decimal coordinates" required>
            </div>

            <button type="submit">Add</button>
        </form>
    </div>

    <!-- Display statuses -->
    @if ($errors->any())
        <div class="alert alert-danger alert-dismissible fade show">
            <ul class="m-0">
                @foreach ($errors->all() as $error)
                    <li>{{ $error }}</li>
                @endforeach
            </ul>
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    @endif

    @if (session('status'))
        <div class="alert alert-success alert-dismissible fade show m-0">
            {{ __(session('status')) }}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    @endif

    @if (session('success'))
        <div class="alert alert-success alert-dismissible fade show m-0">
            {{ __(session('success')) }}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    @endif


</body>
</html>
