class KeyEventManager {
    constructor() {
        this.keyDownHandlers = [];
        this.keyUpHandlers = [];
    }

    addKeyDownHandler(handler) {
        this.keyDownHandlers.push(handler);
    }

    addKeyUpHandler(handler) {
        this.keyUpHandlers.push(handler);
    }

    handleKeyDown(event) {
        this.keyDownHandlers.forEach(handler => handler(event));
    }

    handleKeyUp(event) {
        this.keyUpHandlers.forEach(handler => handler(event));
    }

    setupListeners() {
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        document.addEventListener('keyup', this.handleKeyUp.bind(this));
    }
}

export const keyEventManager = new KeyEventManager();