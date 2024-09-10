// Load tree model

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from "three";
import {mapHeight, scene} from './map.js';
import { latLonToMapCoords } from "./utils.js";
import {convertIntegerToScale} from "./utils.js";

// const trees = window.trees || [];

let trunkMesh, leavesMesh;
const dummy = new THREE.Object3D();
const treeInstanceData = []; // Initialize treeInstanceData as an empty array or object to store the tree data associated with each instance


async function fetchTrees() {
    try {
        const response = await fetch('/api/fetch-trees');
        if (!response.ok) {
            throw new Error('Failed to fetch trees');
        }
        const data = await response.json();
        // console.log(data);
        window.trees = data;  // Store the fetched data in window.trees
        return data;
    } catch (error) {
        console.error('Error in fetchTrees:', error);
        throw error; // Rethrow the error so it can be handled in init
    }
}


function loadTreeModel() {
    const treeLoader = new GLTFLoader();
    treeLoader.load('/assets/tree.glb', function (gltf) {
        console.log('Loaded GLTF file:', gltf.scene);

        const trunkMeshGLTF = gltf.scene.getObjectByName('treetrunk');
        const leavesMeshGLTF = gltf.scene.getObjectByName('treeleaves');

        if (!trunkMeshGLTF || !leavesMeshGLTF) {
            console.error('Error: Trunk or Leaves mesh not found in the GLTF file');
            return;
        }

        const trunkGeometry = trunkMeshGLTF.geometry.clone();
        const leavesGeometry = leavesMeshGLTF.geometry.clone();

        const defaultTransform = new THREE.Matrix4()
            .makeRotationX(Math.PI)
            .multiply(new THREE.Matrix4().makeScale(7, 7, 7));

        trunkGeometry.applyMatrix4(defaultTransform);
        leavesGeometry.applyMatrix4(defaultTransform);

        const trunkMaterial = trunkMeshGLTF.material.clone();  // Clone to allow modifications
        const leavesMaterial = leavesMeshGLTF.material.clone();  // Clone to allow modifications

        // Ensure the material settings allow the color to show as intended
        leavesMaterial.transparent = false;  // Disable transparency
        leavesMaterial.color = new THREE.Color(0xffffff);  // Set base color to white
        if (leavesMaterial.map) {
            leavesMaterial.map = null;  // Remove any texture map
        }

        trunkMesh = new THREE.InstancedMesh(trunkGeometry, trunkMaterial, trees.length);
        leavesMesh = new THREE.InstancedMesh(leavesGeometry, leavesMaterial, trees.length);

        trunkMesh.castShadow = true;
        trunkMesh.receiveShadow = true;
        leavesMesh.castShadow = true;
        leavesMesh.receiveShadow = true;

        trunkMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        leavesMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

        scene.add(trunkMesh);
        scene.add(leavesMesh);
        // console.log(trunkMesh)

        trunkMesh.instanceMatrix.needsUpdate = true;
        leavesMesh.instanceMatrix.needsUpdate = true;

        // Iterate through the trees variable to position according to db values
        trees.forEach((tree, index) => {
            // Convert the tree's latitude and longitude to map coordinates
            const treeCoords = latLonToMapCoords(tree.lat, tree.lon);
            // console.log(treeCoords);  // Debug: Log the calculated map coordinates

            // Convert integer scale to decimal
            const scale = convertIntegerToScale(tree.scale);
            const heightOffset = (mapHeight / 2) + scale;

            dummy.position.set(treeCoords.x, 9, treeCoords.y); // Set the x, y position of the dummy object based on the map coordinates
            dummy.rotation.z = Math.PI;  // Rotate to match the map's orientation
            dummy.scale.set(scale, scale, scale); // Set the dummy's scale
            dummy.updateMatrix(); // Update the dummy's matrix and apply it to the instance

            trunkMesh.setMatrixAt(index, dummy.matrix);
            leavesMesh.setMatrixAt(index, dummy.matrix);

            // Set colors from database
            const trunkColor = new THREE.Color(tree.trunk_colour || '#8B4513');  // Default to a brown color if not set
            const leavesColor = new THREE.Color(tree.leaf_colour || '#00FF00');  // Default to green if not set

            trunkMesh.setColorAt(index, trunkColor);
            leavesMesh.setColorAt(index, leavesColor);

            // Store the tree ID and other relevant data
            treeInstanceData[index] = { id: tree.id, data: tree };
        });

        // Ensure the instanced meshes are updated
        trunkMesh.instanceMatrix.needsUpdate = true;
        leavesMesh.instanceMatrix.needsUpdate = true;
        trunkMesh.instanceColor.needsUpdate = true;
        leavesMesh.instanceColor.needsUpdate = true;

        console.log("Tree Instance Data: ", treeInstanceData);

    }, undefined, function (error) {
        console.error('An error occurred while loading the GLTF model:', error);
    });
}


export {
    trunkMesh, leavesMesh, treeInstanceData, fetchTrees, loadTreeModel
}
