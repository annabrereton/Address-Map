// Setup event listeners: Set up and manage all event listeners for mouse and window events.

import { onMouseClick, onContextMenu } from './mouseHandlers.js';

export function setupEventListeners() {
    // console.log("Setting up event listeners");
    window.addEventListener('click', onMouseClick);
    window.addEventListener('contextmenu', onContextMenu);
}
