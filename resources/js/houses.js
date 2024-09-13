import * as THREE from "three";
import { scene, mapHeight } from './map.js';
import { latLonToMapCoords } from "./utils.js";
import { createHouseLabel } from "./labels.js";

let allHouses = [];
let heightOffset;

async function fetchHouses() {
    try {
        const response = await fetch('/api/fetch-houses');
        if (!response.ok) {
            throw new Error('Failed to fetch houses');
        }
        const data = await response.json();
        window.houses = data;  // Store the fetched data in window.houses
        return data;
    } catch (error) {
        console.error('Error in fetchHouses:', error);
        throw error; // Rethrow the error so it can be handled in init
    }
}

// Function to create the house components
function createHouseComponents(materials, doorStyle, windowStyle) {
    const components = {};

    // House Base (Walls)
    components.base = new THREE.Mesh(new THREE.BoxGeometry(3, 2, 4), materials.wall);
    components.base.castShadow = true;
    components.base.receiveShadow = true;
    components.base.name = 'walls';
    components.base.userData.type = 'walls';

    // Gables
    components.gable1 = createHouseTriangle(materials, { x: -0.5, y: 1, z: 2 });
    components.gable2 = createHouseTriangle(materials, { x: -0.5, y: 1, z: -2 });

    // Roof
    components.roof1 = createRoof(materials, { x: -1, y: 1.51, z: 0 }, Math.PI * 0.5, Math.PI * 0.25);
    components.roof2 = createRoof(materials, { x: 1, y: 1.51, z: 0 }, Math.PI * 0.5, Math.PI * -0.25);

    // Door
    components.door = createDoor(materials, doorStyle);

    // Windows
    components.windows = createWindows(materials, windowStyle);

    return components;
}

function createHouseTriangle(materials, position) {
    const geometry = new THREE.BufferGeometry();
    const vertices = new Float32Array([-1, 0, 0, 0.5, 1.5, 0, 2, 0, 0]);
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.computeVertexNormals();

    const gable = new THREE.Mesh(geometry, materials.wall);
    gable.castShadow = true;
    gable.receiveShadow = true;
    gable.position.set(position.x, position.y, position.z);
    gable.userData.type = 'gable';
    gable.name = 'gable';

    return gable;
}

function createRoof(materials, position, rotationX, rotationY) {
    const roof = new THREE.Mesh(new THREE.PlaneGeometry(2.84, 4.5), materials.roof);
    roof.position.set(position.x, position.y, position.z);
    roof.rotation.set(rotationX, rotationY, 0);
    roof.castShadow = true;
    roof.receiveShadow = true;
    roof.name = 'roof';
    roof.userData.type = 'roof';

    return roof;
}

function createDoor(materials, doorStyle) {
    let door;
    if (doorStyle === 'fancy') {
        door = new THREE.Group();
        const doorBase = new THREE.Mesh(new THREE.PlaneGeometry(1, 1.2), materials.door);
        doorBase.position.set(0, -0.2, 0);
        const doorCurve = new THREE.Mesh(new THREE.CircleGeometry(0.5), materials.door);
        doorCurve.position.set(0, 0.4, 0);
        door.add(doorBase);
        door.add(doorCurve);
    } else {
        door = new THREE.Mesh(new THREE.PlaneGeometry(1, 1.6), materials.door);
    }
    door.position.set(0.5, -0.2, 2.1);
    door.name = "door";
    door.userData.type = 'door';
    return door;
}

function createWindows(materials, windowStyle) {
    const windows = [];
    if (windowStyle === 'rectangular') {
        windows.push(createRectangularWindow(materials, { x: -0.75, y: 0.1, z: 2.1 }));
        windows.push(createRectangularWindow(materials, { x: -1.6, y: 0.1, z: -1.1 }, Math.PI * 1.5));
        windows.push(createRectangularWindow(materials, { x: -1.6, y: 0.1, z: 1.1 }, Math.PI * 1.5));
    } else {
        const circleWindow = new THREE.Mesh(new THREE.CircleGeometry(0.5), materials.window);
        circleWindow.position.set(-0.75, 0.5, 2.1);
        circleWindow.name = 'circleWindow';
        circleWindow.userData.type = 'circleWindow';
        windows.push(circleWindow);
    }
    return windows;
}

function createRectangularWindow(materials, position, rotationY = 0) {
    const window = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), materials.window);
    window.position.set(position.x, position.y, position.z);
    window.rotation.set(0, rotationY, 0);
    window.castShadow = true;
    window.receiveShadow = true;
    window.name = 'window';
    window.userData.type = 'window';
    return window;
}

// House creation
(function (HouseMod) {
    HouseMod.create = function ({
                                    wallColour = 0xffffff,
                                    roofColour = 0x202020,
                                    doorColour = 0xff0000,
                                    windowColour = 0x537d90,
                                    doorStyle = 'fancy',
                                    windowStyle = 'rectangular',
                                    scale = 3
                                } = {}) {
        const materials = {
            wall: new THREE.MeshStandardMaterial({ color: wallColour, side: THREE.DoubleSide }),
            roof: new THREE.MeshStandardMaterial({ color: roofColour, side: THREE.DoubleSide }),
            door: new THREE.MeshStandardMaterial({ color: doorColour }),
            window: new THREE.MeshStandardMaterial({ color: windowColour })
        };

        const house = new THREE.Group();
        house.scale.set(scale, scale, scale);
        house.userData.type = 'house';

        const components = createHouseComponents(materials, doorStyle, windowStyle);

        // Add all components to the house group
        house.add(components.base);
        house.add(components.gable1);
        house.add(components.gable2);
        house.add(components.roof1);
        house.add(components.roof2);
        house.add(components.door);
        components.windows.forEach(window => house.add(window));

        return house;
    };
}(window.HouseMod = window.HouseMod || {}));

// Function to render houses on the map
function renderHouses() {
    console.log(window.houses);
    window.houses.forEach(houseData => {
        const mapCoords = latLonToMapCoords(houseData.lat, houseData.lon);
        const scale = houseData.scale || 3;

        const house = HouseMod.create({
            wallColour: houseData.wallColour,
            roofColour: houseData.roofColour,
            doorColour: houseData.doorColour,
            windowColour: houseData.windowColour,
            doorStyle: houseData.doorStyle,
            windowStyle: houseData.windowStyle,
            scale: scale
        });

        // Position house according to saved coordinates and rotation
        heightOffset = (mapHeight / 2) + scale;
        house.position.set(mapCoords.x, heightOffset, mapCoords.y);
        console.log("House rotation: ", houseData.rotation);
        // house.rotation.y = houseData.rotation;
        house.rotateY(houseData.rotation);

        house.name = "house" + houseData.id;
        house.userData = { ...houseData };
        house.userData.type = 'house';

        scene.add(house);
        allHouses.push(house);

        const houseLabel = createHouseLabel(houseData, houseData.addresses);
        houseLabel.position.set(0, 0, houseLabel.scale.x * 7);
        houseLabel.name = 'houseLabel';
        houseLabel.visible = false;
        house.add(houseLabel);
    });
}

export { allHouses, fetchHouses, renderHouses, heightOffset };




// import * as THREE from "three";
// import {scene, mapHeight, allObjects} from './map.js';
// import { latLonToMapCoords } from "./utils.js";
// import {createHouseLabel} from "./labels.js";
//
// let allHouses = [];
//
// async function fetchHouses() {
//     try {
//         const response = await fetch('/api/fetch-houses');
//         if (!response.ok) {
//             throw new Error('Failed to fetch houses');
//         }
//         const data = await response.json();
//         // console.log(data);
//         window.houses = data;  // Store the fetched data in window.houses
//         return data;
//     } catch (error) {
//         console.error('Error in fetchHouses:', error);
//         throw error; // Rethrow the error so it can be handled in init
//     }
// }
//
// // Function to create house objects on the map
// function renderHouses() {
//     window.houses.forEach(houseData => {
//
//         const mapCoords = latLonToMapCoords(houseData.lat, houseData.lon);
//         const scale = houseData.scale || 3;
//
//         const house = HouseMod.create({
//             wallColour: houseData.wallColour,
//             roofColour: houseData.roofColour,
//             doorColour: houseData.doorColour,
//             windowColour: houseData.windowColour,
//             doorStyle: houseData.doorStyle,
//             windowStyle: houseData.windowStyle,
//             scale: scale
//         });
//
//         const heightOffset = (mapHeight / 2) + scale;
//         house.position.set(mapCoords.x, heightOffset, mapCoords.y);
//
//         house.name = "house" + houseData.id;
//         house.userData = { ...houseData };  // Store all house data in userData
//         house.userData.type = 'house';  // Additionally set userData.type to identify parent houseGroup objects with raycaster
//
//         scene.add(house);
//         // console.log("House UserData: ", house.userData);
//         allHouses.push(house);
//         // allObjects.push(house); // Add each house to the draggable objects array
//
//         const houseLabel = createHouseLabel(houseData, houseData.addresses);
//         const labelOffset = houseLabel.scale.x * 7;
//         // console.log("Offset: ", labelOffset);
//         houseLabel.position.set(0, 0, labelOffset);
//         houseLabel.name = 'houseLabel';
//         houseLabel.visible = false;
//         house.add(houseLabel);
//         // console.log("HouseLabel: ", houseLabel);
//     });
// }
//
// (function (HouseMod) {
//     // CREATE SIMPLE DOOR
//     var SimpleDoor = function (materials) {
//         return new THREE.Mesh(new THREE.PlaneGeometry(1, 1.6), materials.door);
//     };
//
//     // CREATE FANCY DOOR
//     var FancyDoor = function(materials) {
//         materials = materials || materials_default;
//         let doorBaseGeometry = new THREE.PlaneGeometry(1, 1.2);
//         let doorBase = new THREE.Mesh(doorBaseGeometry, materials.door);
//         doorBase.position.set(0, -0.2, 0);
//         let doorCurveGeometry = new THREE.CircleGeometry(0.5);
//         let doorCurve = new THREE.Mesh(doorCurveGeometry, materials.door);
//         doorCurve.position.set(0, 0.4, 0);
//         let doorGroup = new THREE.Group();
//         doorGroup.add(doorBase);
//         doorGroup.add(doorCurve);
//         doorGroup.name = "fancyDoor"
//         return doorGroup;
//     };
//
//     // CREATE CIRCULAR WINDOW
//     var WindowCircle = function (materials) {
//         return new THREE.Mesh(new THREE.CircleGeometry(0.5), materials.window);
//     };
//
//     // CREATE HOUSE TRIANGLE/GABLE PART
//     var HouseTriangle = function (materials) {
//         var geometry = new THREE.BufferGeometry(); // THREE.BufferGeometry is used to define a custom geometry
//         var vertices = new Float32Array([ // vertices array defines three vertices of the triangle in 3D space
//             -1, 0, 0, // Vertex 1
//             0.5, 1.5, 0, // Vertex 2
//             2, 0, 0 // Vertex 3
//         ]);
//         geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
//         geometry.computeVertexNormals();
//         return new THREE.Mesh(geometry, materials.wall);
//     };
//
//     // CREATE HOUSE
//     HouseMod.create = function ({
//                                     wallColour = 0xffffff,
//                                     roofColour = 0x202020,
//                                     doorColour = 0xff0000,
//                                     windowColour = 0x537d90,
//                                     doorStyle = 'fancy',
//                                     windowStyle = 'rectangular',
//                                     scale = 3
//                                 } = {}) {
//         const materials = {
//             wall: new THREE.MeshStandardMaterial({ color: wallColour, side: THREE.DoubleSide }),
//             roof: new THREE.MeshStandardMaterial({ color: roofColour, side: THREE.DoubleSide }),
//             door: new THREE.MeshStandardMaterial({ color: doorColour }),
//             window: new THREE.MeshStandardMaterial({ color: windowColour })
//         };
//
//         // HOUSE GROUP
//         var house = new THREE.Group();
//         house.scale.set(scale, scale, scale);
//         house.castShadow = true;
//         house.receiveShadow = true;
//         house.userData.type = 'house';
//
//         // HOUSE BASE
//         var base = new THREE.Mesh(new THREE.BoxGeometry(3, 2, 4), materials.wall);
//         base.castShadow = true;
//         base.receiveShadow = true;
//         base.name = 'walls';
//         base.userData.type = 'walls';
//         house.add(base);
//
//         // HOUSE TRIANGLE/GABLE PARTS
//         var tri1 = HouseTriangle(materials);
//         tri1.castShadow = true;
//         tri1.receiveShadow = true;
//         tri1.position.set(-0.5, 1, 2);
//         tri1.userData.type = 'gable1';
//         tri1.name = 'gable1';
//         house.add(tri1);
//
//         var tri2 = HouseTriangle(materials);
//         tri2.castShadow = true;
//         tri2.receiveShadow = true;
//         tri2.position.set(-0.5, 1, -2);
//         tri2.userData.type = 'gable2';
//         tri2.name = 'gable2';
//         house.add(tri2);
//
//         // ROOF
//         var roof1 = new THREE.Mesh(new THREE.PlaneGeometry(2.84, 4.5), materials.roof);
//         roof1.position.set(-1, 1.51, 0);
//         roof1.rotation.set(Math.PI * 0.5, Math.PI * 0.25, 0);
//         roof1.castShadow = true;
//         roof1.receiveShadow = true;
//         roof1.name = 'roof1';
//         roof1.userData.type = 'roof1';
//         house.add(roof1);
//
//         var roof2 = new THREE.Mesh(new THREE.PlaneGeometry(2.84, 4.5), materials.roof);
//         roof2.position.set(1, 1.51, 0);
//         roof2.rotation.set(Math.PI * 0.5, Math.PI * -0.25, 0);
//         roof2.castShadow = true;
//         roof2.receiveShadow = true;
//         roof2.name = 'roof2';
//         roof2.userData.type = 'roof2';
//         house.add(roof2);
//
//         // DOOR
//         let door = doorStyle === 'fancy' ? FancyDoor(materials) : SimpleDoor(materials);
//         door.position.set(0.5, -0.2, 2.1);
//         door.name = "door"
//         door.userData.type = 'door';
//         house.add(door);
//
//         // WINDOWS
//         let window1, window2, window3;
//         if (windowStyle === 'rectangular') {
//             window1 = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), materials.window);
//             window1.position.set(-0.75, 0.1, 2.1);
//             window1.name = 'window1';
//             window1.userData.type = 'window1';
//             house.add(window1);
//
//             window2 = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), materials.window);
//             window2.position.set(-1.6, 0.1, -1.1);
//             window2.rotation.set(Math.PI * 0.5, Math.PI * 1.5, 0);
//             window2.userData.type = 'window2';
//             window2.name = 'window2';
//             house.add(window2);
//
//             window3 = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), materials.window);
//             window3.position.set(-1.6, 0.1, 1.1);
//             window3.rotation.set(Math.PI * 0.5, Math.PI * 1.5, 0);
//             window3.userData.type = 'window3';
//             window3.name = 'window3';
//             house.add(window3);
//         } else {
//             let circleWindow1 = WindowCircle(materials);
//             circleWindow1.position.set(-0.75, 0.5, 2.1);
//             circleWindow1.name = 'circleWindow1'
//             circleWindow1.userData.type = 'circleWindow1';
//             house.add(circleWindow1);
//         }
//
//         // HOUSE SHADOWS
//         house.castShadow = true;
//         house.receiveShadow = true;
//
//         return house;
//     };
// }(window.HouseMod = window.HouseMod || {}));
//
//
// export {
//     allHouses, fetchHouses, renderHouses
// }
