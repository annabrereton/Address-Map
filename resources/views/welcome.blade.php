<!DOCTYPE html>

<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title>Address Map</title>

    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet"
          integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
            integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz"
            crossorigin="anonymous"></script>
    @vite('resources/js/app.js')
    @vite('resources/css/app.css')

</head>


<body>

@include('edit_house_address')
@include('edit_tree')
@include('create_house')

<div id="alerts-wrapper"></div>

<div id="container">
    <!-- Button to Open Create House modal -->
    <a href="#" id="createHouse" class="btn btn-sm btn-primary" data-bs-toggle="modal"
       data-bs-target="#createHouseModal">Create House</a>
    <!-- Sidebar -->
    <div id="sidebar" class="sidebar">
        <div id="labelContainer" class="label-container"></div>
        <div id="coordsBox" class="coords-box text-center"></div>
    </div>
</div>


<!-- Display statuses -->
@if ($errors->any())
    <div class="alert alert-danger alert-dismissible auto-dismiss fade show">
        <ul class="m-0">
            @foreach ($errors->all() as $error)
                <li>{{ $error }}</li>
            @endforeach
        </ul>
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
@endif

@if (session('status'))
    <div class="alert alert-success alert-dismissible auto-dismiss fade show m-0">
        {{ __(session('status')) }}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
@endif

@if (session('success'))
    <div class="alert alert-success alert-dismissible auto-dismiss fade show m-0">
        {{ __(session('success')) }}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
@endif

<script>

    window.alerts = document.querySelectorAll('.auto-dismiss');
    window.alertsWrapper = document.getElementById('alerts-wrapper');

    // Function to dismiss each alert in order with a delay
    function dismissAlertsInOrder(alerts, delay) {
        alerts.forEach(function (element, index) {
            alertsWrapper.appendChild(element); // Add alerts to the alerts wrapper

            setTimeout(function () {
                element.style.display = 'none'; // Remove alert from view
            }, delay + (delay * index)); // Remove first alert by the delay and subsequent alerts by the delay * index
        });
    }

    // Call the function to dismiss alerts in sequence
    dismissAlertsInOrder(alerts, 3000); // 5 seconds delay between dismissals

</script>
</body>
</html>
