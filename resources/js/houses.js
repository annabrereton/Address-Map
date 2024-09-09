import * as THREE from "three";
import { scene, mapHeight } from './map.js';
import { latLonToMapCoords } from "./utils.js";

const houses = window.houses || [];

let allHouses = [];

// Iterate over houses variable and create the house using the db data
function createHouses() {
    houses.forEach(houseData => {
        console.log(houseData);

        const mapCoords = latLonToMapCoords(houseData.lat, houseData.lon);
        const scale = houseData.scale || 1;

        const house = HouseMod.create({wallColour: houseData.wallColour,
            roofColour: houseData.roofColour,
            doorColour: houseData.doorColour,
            windowColour: houseData.windowColour,
            doorStyle: houseData.doorStyle,
            windowStyle: houseData.windowStyle,
            scale: scale
        });

        const heightOffset = (mapHeight / 2) + scale;
        house.position.set(mapCoords.x, heightOffset, mapCoords.y);

        house.name = "house" + houseData.id;
        house.userData.id = houseData.id;
        house.userData.type = "house";
        house.userData.lat = houseData.lat;
        house.userData.lon = houseData.lon;
        house.userData.scale = houseData.scale;
        house.userData.doorStyle = houseData.doorStyle;
        house.userData.windowStyle = houseData.windowStyle;
        house.userData.doorColour = houseData.doorColour;
        house.userData.roofColour = houseData.roofColour;
        house.userData.wallColour = houseData.wallColour;
        house.userData.addresses = houseData.addresses; // Add addresses to house userData

        scene.add(house);
        console.log("House created with address: ", house.userData.addresses)
        allHouses.push(house);
    });
}

(function (HouseMod) {
    // CREATE SIMPLE DOOR
    var SimpleDoor = function (materials) {
        return new THREE.Mesh(new THREE.PlaneGeometry(1, 1.6), materials.door);
    };

    // CREATE FANCY DOOR
    var FancyDoor = function(materials) {
        materials = materials || materials_default;
        let doorBaseGeometry = new THREE.PlaneGeometry(1, 1.2);
        let doorBase = new THREE.Mesh(doorBaseGeometry, materials.door);
        doorBase.position.set(0, -0.2, 0);
        let doorCurveGeometry = new THREE.CircleGeometry(0.5);
        let doorCurve = new THREE.Mesh(doorCurveGeometry, materials.door);
        doorCurve.position.set(0, 0.4, 0);
        let doorGroup = new THREE.Group();
        doorGroup.add(doorBase);
        doorGroup.add(doorCurve);
        doorGroup.name = "fancyDoor"
        doorGroup.userData.type = 'door';
        return doorGroup;
    };

    // CREATE CIRCULAR WINDOW
    var WindowCircle = function (materials) {
        return new THREE.Mesh(new THREE.CircleGeometry(0.5), materials.window);
    };

    // CREATE HOUSE TRIANGLE/GABLE PART
    var HouseTriangle = function (materials) {
        var geometry = new THREE.BufferGeometry(); // THREE.BufferGeometry is used to define a custom geometry
        var vertices = new Float32Array([ // vertices array defines three vertices of the triangle in 3D space
            -1, 0, 0, // Vertex 1
            0.5, 1.5, 0, // Vertex 2
            2, 0, 0 // Vertex 3
        ]);
        geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        geometry.computeVertexNormals();
        return new THREE.Mesh(geometry, materials.wall);
    };

    // CREATE HOUSE
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

        // HOUSE GROUP
        var house = new THREE.Group();
        house.scale.set(scale, scale, scale);
        house.castShadow = true;
        house.receiveShadow = true;
        house.userData.type = 'house';

        // HOUSE BASE
        var base = new THREE.Mesh(new THREE.BoxGeometry(3, 2, 4), materials.wall);
        base.castShadow = true;
        base.receiveShadow = true;
        base.name = 'walls';
        base.userData.type = 'walls';
        house.add(base);

        // HOUSE TRIANGLE/GABLE PARTS
        var tri1 = HouseTriangle(materials);
        tri1.castShadow = true;
        tri1.receiveShadow = true;
        tri1.position.set(-0.5, 1, 2);
        tri1.userData.type = 'gable1';
        house.add(tri1);

        var tri2 = HouseTriangle(materials);
        tri2.castShadow = true;
        tri2.receiveShadow = true;
        tri2.position.set(-0.5, 1, -2);
        tri2.userData.type = 'gable2';
        house.add(tri2);

        // ROOF
        var roof1 = new THREE.Mesh(new THREE.PlaneGeometry(2.84, 4.5), materials.roof);
        roof1.position.set(-1, 1.51, 0);
        roof1.rotation.set(Math.PI * 0.5, Math.PI * 0.25, 0);
        roof1.castShadow = true;
        roof1.receiveShadow = true;
        roof1.name = 'roof1';
        roof1.userData.type = 'roof1';
        house.add(roof1);

        var roof2 = new THREE.Mesh(new THREE.PlaneGeometry(2.84, 4.5), materials.roof);
        roof2.position.set(1, 1.51, 0);
        roof2.rotation.set(Math.PI * 0.5, Math.PI * -0.25, 0);
        roof2.castShadow = true;
        roof2.receiveShadow = true;
        roof2.name = 'roof2';
        roof2.userData.type = 'roof2';
        house.add(roof2);

        // DOOR
        let door = doorStyle === 'fancy' ? FancyDoor(materials) : SimpleDoor(materials);
        door.position.set(0.5, -0.2, 2.1);
        door.name = "simpleDoor"
        door.userData.type = 'door';
        house.add(door);

        // WINDOWS
        let window1, window2, window3;
        if (windowStyle === 'rectangular') {
            window1 = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), materials.window);
            window1.position.set(-0.75, 0.1, 2.1);
            house.add(window1);

            window2 = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), materials.window);
            window2.position.set(-1.6, 0.1, -1.1);
            window2.rotation.set(Math.PI * 0.5, Math.PI * 1.5, 0);
            house.add(window2);

            window3 = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), materials.window);
            window3.position.set(-1.6, 0.1, 1.1);
            window3.rotation.set(Math.PI * 0.5, Math.PI * 1.5, 0);
            house.add(window3);
        } else {
            let circleWindow1 = WindowCircle(materials);
            circleWindow1.position.set(-0.75, 0.5, 2.1);
            house.add(circleWindow1);
        }

        // HOUSE SHADOWS
        house.castShadow = true;
        house.receiveShadow = true;

        return house;
    };
}(window.HouseMod = window.HouseMod || {}));


export {
    createHouses, allHouses
}
