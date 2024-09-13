// Setup event listeners: Set up and manage all event listeners for mouse and window events.

import { onMouseMove, onMouseClick, onContextMenu } from './mouseHandlers.js';
import { onKeyDown, onKeyUp } from './map.js';

function setupEventListeners() {
    // console.log("Setting up event listeners");
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('click', onMouseClick);
    // window.addEventListener('dblclick', onMouseDoubleClick);
    window.addEventListener('contextmenu', onContextMenu);
    document.addEventListener( 'keydown', onKeyDown );
    document.addEventListener( 'keyup', onKeyUp );
}

export {
    setupEventListeners
};
