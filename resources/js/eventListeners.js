// Setup event listeners: Set up and manage all event listeners for mouse and window events.

import { onMouseMove, onMouseClick, onMouseDoubleClick, onContextMenu } from './mouseHandlers.js';

function setupEventListeners() {
    // console.log("Setting up event listeners");
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('click', onMouseClick);
    window.addEventListener('dblclick', onMouseDoubleClick);
    window.addEventListener('contextmenu', onContextMenu);
}

export {
    setupEventListeners
};
