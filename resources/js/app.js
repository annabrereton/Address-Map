import './bootstrap';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

document.addEventListener('DOMContentLoaded', function() {
    // Access addresses from global window object
    const addresses = window.addresses || []; // Default to an empty array if addresses is not defined

    // Basic scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Set up camera position
    camera.position.z = 400;

    // Map dimensions in world units (meters)
    const mapDiameter = 300;        // Diameter in meters
    const mapHeight = 10;           // Height of the cylinder
    const mapRadius = mapDiameter / 2;

    // Define fake coordinate bounds (for demonstration purposes)
    const latBottomLeft = 0;
    const lonBottomLeft = 0;
    const latTopRight = 1;
    const lonTopRight = 1;

    // Function to convert latitude and longitude to map coordinates
    function latLonToMapCoords(lat, lon) {
    const normalizedLat = (lat - latBottomLeft) / (latTopRight - latBottomLeft);
    const normalizedLon = (lon - lonBottomLeft) / (lonTopRight - lonBottomLeft);

    const x = normalizedLon * mapDiameter - mapRadius;
    const y = normalizedLat * mapDiameter - mapRadius;

    return {x, y};
}

    // Create a cylinder geometry for the map
    const geometry = new THREE.CylinderGeometry(mapRadius, mapRadius, mapHeight, 64);
    const material = new THREE.MeshStandardMaterial({color: 0x00ff00, side: THREE.DoubleSide});
    const mapMesh = new THREE.Mesh(geometry, material);
    mapMesh.receiveShadow = true;

    // Rotate the cylinder to make it horizontal
    mapMesh.rotation.x = Math.PI / 2;       // Rotate 90 degrees along X-axis
    scene.add(mapMesh);

    // Create markers for each address
    const markerMaterial = new THREE.MeshStandardMaterial({color: 0x0000ff});         // Blue cubes

    let allHouses = [];

    addresses.forEach(address => {
        // console.log(address.house + ' ' + address.street);
    const mapCoords = latLonToMapCoords(address.lat, address.lon);
    const markerGeometry = new THREE.BoxGeometry(10, 10, 10);       // Cube size
    const house = new THREE.Mesh(markerGeometry, markerMaterial);
    house.castShadow = true;
    house.receiveShadow = true;
    house.userData.type = house;
    house.userData.address = address.house + ' ' + address.street;
    house.userData.lat = address.lat;
    house.userData.lon = address.lon;
    house.position.set(mapCoords.x, mapCoords.y, mapHeight / 2 + 5);       // Adjust Z position to sit on top of the cylinder
    scene.add(house);
    allHouses.push(house);
    });

    // CREATE RAYCASTER FOR DETECTING CLICKS
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // ADD DOM ELEMENT TO DISPLAY ADDRESS
    const addressCard = document.createElement('div');
    addressCard.style.position = 'absolute';
    addressCard.style.backgroundColor = 'white';
    addressCard.style.padding = '10px';
    addressCard.style.border = '1px solid black';
    addressCard.style.borderRadius = '5px';
    addressCard.style.fontFamily = 'Arial, sans-serif'; // Set font to sans-serif
    addressCard.style.display = 'none'; // Start hidden
    document.body.appendChild(addressCard);

    // UPDATE MOUSE VARIABLE ON MOUSE MOVE
    window.addEventListener('mousemove', (event) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    });

    // HANDLE CLICKS
    window.addEventListener('click', (event) => {
        // Update the raycaster based on the current mouse position
        raycaster.setFromCamera(mouse, camera);

        // Calculate objects intersecting the ray
        const intersects = raycaster.intersectObjects(allHouses);

        console.log("Number of intersects:", intersects.length);
        console.log(intersects);

        if (intersects.length > 0) {
            const object = intersects[0].object; // Take the first object only [0]

            // Display the address in the address card
            if (object.userData && object.userData.address) {
                addressCard.innerHTML = `
                    <p><strong>Address:</strong> ${object.userData.address}</p>
                    <p><strong>Lat:</strong> ${object.userData.lat}</p>
                    <p><strong>Lon:</strong> ${object.userData.lon}</p>
                `;
                addressCard.style.left = `${event.clientX}px`;
                addressCard.style.top = `${event.clientY}px`;
                addressCard.style.display = 'block';
            } else {
                addressCard.style.display = 'none';
            }
        } else {
            // Hide the address card if no object was clicked
            addressCard.style.display = 'none';
        }

    });

    // Ambient light (soft, scattered light)
    const ambientLight = new THREE.AmbientLight(0x404040, 1.5);         // Soft white light, slightly stronger
    scene.add(ambientLight);

    // Directional light (sharp, directional shadows)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(100, 200, 100);
    directionalLight.target.position.set(0, 0, 0);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.camera.left = -150;
    directionalLight.shadow.camera.right = 150;
    directionalLight.shadow.camera.top = 150;
    directionalLight.shadow.camera.bottom = -150;
    scene.add(directionalLight);
    scene.add(directionalLight.target);

    // Visual helpers
    // const lightHelper = new THREE.DirectionalLightHelper(directionalLight, 5);
    // scene.add(lightHelper);
    // scene.add(new THREE.CameraHelper(directionalLight.shadow.camera));

    // Controls to navigate the scene
    const controls = new OrbitControls(camera, renderer.domElement);

    function animate() {
    requestAnimationFrame(animate);
    controls.update();      // Required for controls to work
    renderer.render(scene, camera);
}
    animate();

    // Handle window resize
    window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});
})
;
