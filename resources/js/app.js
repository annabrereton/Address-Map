// Import necessary components from other files
import './bootstrap';
import '../css/app.css';
import { setupEventListeners } from './eventListeners.js';
import {
    setupScene,
    setupOrbitControls,
    addLights,
    setupMapMesh,
    animate,
    handleResize,
    sceneState
} from './map.js';
import { fetchTrees, loadTreeModel } from './trees.js';
import { fetchHouses, renderHouses } from './houses.js';


// Initialize application
async function init() {
    setupScene();
    setupMapMesh();
    addLights();
    setupOrbitControls();

    sceneState.initMouseMoveHandler();

    // Fetch houses and wait for the promise to resolve
    try {
        await fetchHouses(); // Ensure fetchHouses completes before proceeding
        renderHouses();      // Now create houses based on the fetched data
    } catch (error) {
        console.error('Error fetching houses:', error);
    }

    // Fetch trees and wait for the promise to resolve
    try {
        await fetchTrees(); // Ensure fetchHouses completes before proceeding
        loadTreeModel();      // Now load trees based on the fetched data
    } catch (error) {
        console.error('Error fetching trees:', error);
    }

    setupEventListeners();


    animate();
    window.addEventListener('resize', handleResize);
}

init();
