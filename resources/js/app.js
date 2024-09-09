// Import necessary components from other files
import './bootstrap';
import '../css/app.css';
// import './axiosConfig';  // This imports and configures Axios
import { setupEventListeners } from './eventListeners.js';
import { setupScene, setupControls, addLights, setupMapMesh, setupRaycaster, animate, handleResize } from './map.js';
import { loadTreeModel } from './trees.js';
import { createHouses} from './houses.js';


// Initialize application
function init() {
    setupScene();
    setupMapMesh();
    addLights();
    createHouses();
    loadTreeModel();
    setupEventListeners();
    setupRaycaster();
    setupControls();
    animate();
    window.addEventListener('resize', handleResize);
}

init();
