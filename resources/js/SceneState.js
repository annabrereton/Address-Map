import * as THREE from 'three';
import { createTreeLabel, createHouseLabel } from './labels.js';
import { mapCoordsToLatLon } from './utils.js';
import { setupDragControls, disposeDragControls, render, checkIntersection } from './map.js';
import { treeInstanceData } from './trees.js';

export class SCENESTATE {
    constructor() {
        this.states = {
            VIEW: 'view',
            HOUSE_SELECTED: 'houseSelected',
            TREE_SELECTED: 'treeSelected'
        };
        this.currentState = this.states.VIEW;
        this.selectedObject = null;
        this.isDragging = false;  
        this.isRotating = false; 
        this.mouse = new THREE.Vector2();
        this.currentLabel = null;
        this.mouseMoveHandler = this.handleMouseMove.bind(this);
        this.keyHandlersInitialized = false;
        this.initMouseMoveHandler();
    }


    transition(newState, data = {}) {
          // Prevent transitioning to the same state
        if (this.currentState === newState) {
            console.log(`Already in state: ${newState}`);
            return; // Exit the function if the state is the same
        }

        console.log(`Transitioning from ${this.currentState} to ${newState}`);

        if (this.currentState !== this.states.VIEW) {
            console.log(`Deselecting current object. State was ${this.currentState}`);
            this._exitState(this.currentState);
        }

        this.currentState = newState; // Update the current state
        console.log("Updated current state to:", this.currentState); // Log the updated state


        if (newState !== this.states.VIEW) {
            // Only enter a new state if it's not VIEW
            console.log("calling _enterState", newState, data);
            this._enterState(newState, data);
        } else {
            console.log("Entered VIEW state");
            this.selectedObject = null;
            console.log("Entered view state, selectedbject ", this.selectedObject);
        }

        render();
    }

    _exitState(state) {
        console.log(`Exiting state: ${state}`);
        this._clearLabels();
        this._unhighlightObject(this.selectedObject);
        if (state === this.states.HOUSE_SELECTED) {
            this._detachKeyHandlers();
        }
        // if (state === this.states.HOUSE_DRAGGING || state === this.states.HOUSE_ROTATING) {
        //     this._disposeDragControls();
        // }
    }

    _enterState(state, data) {
        console.log(`Entering state: ${state}. Data: `, data);
        this.currentState = state;
        this.selectedObject = data.object;
        console.log("Selected Object: ", this.selectedObject);
        this._highlightObject(this.selectedObject);
        this._displayLabel(this.selectedObject);

        if (state === this.states.HOUSE_SELECTED) {
            this._attachKeyHandlers();  // Attach key handlers for drag/rotate
        }
    }

    _attachKeyHandlers() {
        if (!this.keyHandlersInitialized) {
            document.addEventListener('keydown', (event) => this.handleKeyDown(event));
            document.addEventListener('keyup', (event) => this.handleKeyUp(event));
            this.keyHandlersInitialized = true;
            console.log('Key handlers attached');
        }
    }

    _detachKeyHandlers() {
        if (this.keyHandlersInitialized) {
            document.removeEventListener('keydown', (event) => this.handleKeyDown(event));
            document.removeEventListener('keyup', (event) => this.handleKeyUp(event));
            this.keyHandlersInitialized = false;
            console.log('Key handlers detached');
        }
    }

    dragHouse() {
        if (this.currentState === this.states.HOUSE_SELECTED) {
            this.isDragging = true;
            console.log("Started dragging", this.selectedObject);
            this._enableDragControls(false); // False indicates no rotation
        }
    }
    
    rotateHouse() {
        if (this.currentState === this.states.HOUSE_SELECTED) {
            this.isRotating = true;
            console.log("Started rotating", this.selectedObject);
            this._enableDragControls(true); // True indicates rotation mode
        }
    }
    
    stopDraggingOrRotating() {
        this.isDragging = false;
        this.isRotating = false;
        console.log("Stopped dragging/rotating");
        this._disposeDragControls();
        render();
    }

    _displayLabel(object) {
        this._clearLabels();
        console.log("Displaying label for: ", object.name);

        if (object.userData && object.userData.type === 'house') {
            console.log("Creating house label", object.userData);
            const houseLabel = createHouseLabel(object.userData);
            labelContainer.appendChild(houseLabel);
            this.currentLabel = houseLabel;
            console.log("House label displayed", houseLabel);
            }
            else if (object.type === 'tree') {
            const treeLabel = createTreeLabel(object.data);
            labelContainer.appendChild(treeLabel);
            this.currentLabel = treeLabel;
            console.log("Tree label displayed", treeLabel);
        }
    }

    _clearLabels() {
        console.log("Clearing labels", this.currentLabel);
        const labelContainer = document.getElementById('labelContainer');
        if (labelContainer) {
            labelContainer.innerHTML = '';
        }
        this.currentLabel = null;
    }

    _highlightObject(object) {
        if (object) {
            if (object.type === 'tree') {
                // Highlight the specific tree instance
                const color = new THREE.Color(0xfff000);
                object.mesh.children.forEach(child => {
                    if (child.isInstancedMesh) {
                        child.setColorAt(object.instanceId, color);
                        child.instanceColor.needsUpdate = true;
                    }
                });
            } else {
                // Existing logic for non-instanced objects (houses)
                object.traverse((child) => {
                    if (child.isMesh) {
                        child.material.emissive.setHex(0x555555);
                        child.material.needsUpdate = true;
                    }
                });
            }
            render();
        }
    }
    
    _unhighlightObject(object) {
        if (object) {
            if (object.type === 'tree') {
                // Unhighlight the specific tree instance
                object.mesh.children.forEach((child, index) => {
                    if (child.isInstancedMesh) {
                        const color = new THREE.Color(index === 0 ? object.data.data.trunk_colour || '#8B4513' : object.data.data.leaf_colour || '#00FF00');
                        child.setColorAt(object.instanceId, color);
                        child.instanceColor.needsUpdate = true;
                    }
                });
            } else {
                // Existing logic for non-instanced objects (houses)
                object.traverse((child) => {
                    if (child.isMesh) {
                        child.material.emissive.setHex(0x000000);
                        child.material.needsUpdate = true;
                    }
                });
            }
            render(); // Call render after unhighlighting
        }
    }

    _enableDragControls(isRotating) {
        console.log("Enabling drag controls", isRotating, "For ", this.selectedObject);
        this.dragControlsEnabled = true;
        setupDragControls([this.selectedObject], this.selectedObject.position.y, isRotating);
    }

    _disposeDragControls() {
        this.dragControlsEnabled = false;
        disposeDragControls();
    }

    handleKeyDown(event) {
        console.log("Key down", event.key, "Current State: ", this.currentState);
        if (event.key === 'd' && this.currentState === this.states.HOUSE_SELECTED && !this.isDragging) {
            this.dragHouse(); // Start dragging
        } else if (event.key === 'r' && this.currentState === this.states.HOUSE_SELECTED && !this.isRotating) {
            this.rotateHouse(); // Start rotating
        }
    }
    
    handleKeyUp(event) {
        console.log("Key up", event.key, "Current State: ", this.currentState);
        if ((event.key === 'd' && this.isDragging) || (event.key === 'r' && this.isRotating)) {
            this.stopDraggingOrRotating(); // Stop dragging or rotating on key up
        }
    }

    initMouseMoveHandler() {
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
    }

    handleMouseMove(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        const intersection = this._checkIntersection();
        if (intersection && intersection.point) {
            this.updateCoordsDisplay(intersection.point.x, intersection.point.z);
        } else {
            // Update with default values when not intersecting
            this.updateCoordsDisplay(0, 0);
        }
    }

    handleClick(event) {
        if ((this.isRotating === true) || (this.isDragging === true)) {
            console.log("Click ignored while dragging/rotating");
            return;
        }
        const intersection = this._checkIntersection();
        const intersectedObject = this.identifyObject(intersection);
        console.log("Intersected object:", intersectedObject);
        console.log("Current state:", this.currentState);
        console.log("Selected object:", this.selectedObject);
    
        if (this.selectedObject) {
            if (this._isSameObject(intersectedObject, this.selectedObject)) {
                console.log("Deselecting object");
                this.handleObjectSelection(this.selectedObject); // This will deselect the object
            } else {
                console.log("Ignoring click on different object");
                return;
            }
        } else if (intersectedObject) {
            // No object is currently selected, but we've clicked on an object
            this.handleObjectSelection(intersectedObject);
        }
    }
    
    identifyObject(intersection) {
        if (!intersection) return null;

        let clickedObject = intersection.object;

        // Handle house selection
        let parent = clickedObject.parent;
        console.log("Parent: ", parent);
        while (parent) {
            if (parent.userData && parent.userData.type === 'house') {
                console.log("It's a house");
                return parent;
            }
            parent = parent.parent;
        }
    
        // Handle tree selection
        let treeGroup = clickedObject;
        while (treeGroup && treeGroup.userData.type !== 'tree') {
            treeGroup = treeGroup.parent;
        }
    
        if (treeGroup && treeGroup.userData.type === 'tree') {
            console.log("Tree selected: ", treeGroup);
            const instanceIndex = intersection.instanceId;
            const treeData = treeInstanceData[instanceIndex];
            console.log("Tree Data: ", treeData);
            
            return {
                instanceId: instanceIndex,
                mesh: treeGroup,
                data: treeData,
                type: 'tree'
            };
        }
        return null;
    }

    handleObjectSelection(selectedObject) {
        console.log("Handling object selection", selectedObject);
        if (this.currentState === this.states.VIEW) {
            // Only allow selection when in VIEW state
            if (selectedObject.userData && selectedObject.userData.type === 'house') {
                this.transition(this.states.HOUSE_SELECTED, { object: selectedObject });
            } else if (selectedObject.type === 'tree') {
                this.transition(this.states.TREE_SELECTED, { object: selectedObject });
            }
        } else if (this._isSameObject(selectedObject, this.selectedObject)) {
            // Clicking on the same object deselects it
            this.transition(this.states.VIEW);
        }
        // Ignore clicks on other objects when an object is already selected
    }

    _isSameObject(obj1, obj2) {
        if (!obj1 || !obj2) return false;
        
        console.log("Comparing objects:", obj1, obj2);
        
        if (obj1.type === 'tree' && obj2.type === 'tree') {
            console.log("Comparing tree objects:");
            console.log("instanceId match:", obj1.instanceId === obj2.instanceId);
            console.log("mesh match:", obj1.mesh === obj2.mesh);
            return obj1.instanceId === obj2.instanceId && obj1.mesh === obj2.mesh;
        }
        
        console.log("Direct comparison result:", obj1 === obj2);
        return obj1 === obj2;
    }

    _checkIntersection() {
        return checkIntersection(this.mouse);
    }

    _identifyObject(intersection) {
        return identifyObject(intersection);
    }

    updateCoordsDisplay(x, z) {
        const { lat, lon } = mapCoordsToLatLon(x, z);
        const coordsBox = document.getElementById('coordsBox');
        if (coordsBox) {
            coordsBox.textContent = `Lat: ${lat.toFixed(6)}, Lon: ${lon.toFixed(6)}`;
            // console.log("Updating coords display", lat, lon);
        }
    }

    _checkIntersection() {
        return checkIntersection(this.mouse);
    }

}