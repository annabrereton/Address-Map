export class Map2D {
    constructor(canvasId, mapDiameter, THREE) {
        // This is the constructor. It's called when we create a new Map2D object.
        // It sets up the initial properties of our 2D map.
        this.canvas = document.getElementById(canvasId); // Get the HTML canvas element
        this.ctx = this.canvas.getContext('2d'); // Get the 2D drawing context
        this.mapDiameter = mapDiameter; // Store the diameter of our map
        this.THREE = THREE; // Store the Three.js library for later use
        this.cameraRotation = 0; // Initialize camera rotation
        this.updateDimensions(); // Call method to set up canvas dimensions
    }

    updateDimensions() {
        // This method sets up the canvas size and calculates the scale
        this.canvas.width = this.canvas.offsetWidth; // Set canvas width
        this.canvas.height = this.canvas.offsetHeight; // Set canvas height
        // Calculate scale to fit the map in the canvas
        this.scale = Math.min(this.canvas.width, this.canvas.height) / this.mapDiameter;
        // Calculate the center of the canvas
        this.offsetX = this.canvas.width / 2;
        this.offsetY = this.canvas.height / 2;
    }

    clear() {
        // This method clears the entire canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawMapCircle(colour = '0x00ff00') {
        // This method draws the circular border of our map
        this.ctx.beginPath();
        this.ctx.arc(this.offsetX, this.offsetY, this.mapDiameter * this.scale / 2, 0, 2 * Math.PI);
        this.ctx.strokeStyle = 'black';
        this.ctx.lineWidth = 2;
        this.ctx.fillStyle = colour;
        this.ctx.fill();
        this.ctx.stroke();
    }

    drawCircle(x, z, radius, color) {
        // This method draws a circle (used for trees)
        const canvasX = this.toCanvasX(z, x);
        const canvasY = this.toCanvasY(x, z);
        this.ctx.beginPath();
        this.ctx.arc(canvasX, canvasY, radius * this.scale, 0, 2 * Math.PI);
        this.ctx.fillStyle = color;
        this.ctx.fill();
    }

    drawSquare(x, z, size, color) {
        // This method draws a square (used for houses)
        const canvasX = this.toCanvasX(z, x);
        const canvasY = this.toCanvasY(x, z);
        const scaledSize = size * this.scale;
        const halfSize = scaledSize / 2;
        this.ctx.fillStyle = color;
        this.ctx.fillRect(canvasX - halfSize, canvasY - halfSize, scaledSize, scaledSize);
    }

    toCanvasX(z, x) {
        // This method converts 3D z-coordinate to 2D x-coordinate
        return (z + this.mapDiameter / 2) * this.scale;
    }

    toCanvasY(x, z) {
        // This method converts 3D x-coordinate to 2D y-coordinate
        return (this.mapDiameter / 2 - x) * this.scale;
    }

    update(objects, cameraRotation) {
        // This method updates the entire 2D map
        this.clear(); // Clear the canvas
        this.ctx.save(); // Save the current canvas state
        // The next three lines rotate the entire canvas
        this.ctx.translate(this.offsetX, this.offsetY);
        this.ctx.rotate(-cameraRotation);
        this.ctx.translate(-this.offsetX, -this.offsetY);

        this.drawMapCircle('lightgreen'); // Draw the map border
        // Loop through all objects and draw them
        objects.forEach(obj => {
            if (obj.userData && obj.userData.type) {
                switch(obj.userData.type) {
                    case 'house':
                        this.drawSquare(obj.position.x, obj.position.z, 6, 'red');
                        break;
                    case 'tree':
                        this.drawTreeGroup(obj);
                        break;
                    case 'mapMesh':
                        // Don't draw mapMesh, we already drew the circle
                        break;
                    default:
                        console.log('Unknown object type:', obj.userData.type);
                        this.drawCircle(obj.position.x, obj.position.z, 3, 'blue');
                }
            } else {
                console.log('Object without userData or type:', obj);
            }
        });
        this.ctx.restore(); // Restore the canvas state
    }

    drawTreeGroup(group) {
        // This method draws a group of trees
        const groupPosition = new this.THREE.Vector3();
        group.getWorldPosition(groupPosition);

        group.children.forEach(child => {
            if (child.isInstancedMesh) {
                const tempPosition = new this.THREE.Vector3();
                const tempQuaternion = new this.THREE.Quaternion();
                const tempScale = new this.THREE.Vector3();
                const tempMatrix = new this.THREE.Matrix4();

                for (let i = 0; i < child.count; i++) {
                    child.getMatrixAt(i, tempMatrix);
                    tempMatrix.decompose(tempPosition, tempQuaternion, tempScale);
                    
                    // Combine group position with instance position
                    const worldPosition = new this.THREE.Vector3().addVectors(groupPosition, tempPosition);
                    
                    this.drawCircle(worldPosition.x, worldPosition.z, 3, '#296529');
                }
            }
        });
    }
}