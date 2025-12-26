// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import Modal from 'react-modal';

// Minimal canvas 2D context mock for tests running under jsdom
// Provides the methods used by drawing/tools code so events can be exercised.
if (typeof HTMLCanvasElement !== 'undefined') {
    const mockCtx = () => {
        const width = 1200;
        const height = 800;
        const imageData = {
            data: new Uint8ClampedArray(width * height * 4),
            width,
            height,
        } as ImageData;
        return {
            // state
            canvas: { width, height } as HTMLCanvasElement,
            // transforms & ops
            save: () => void 0,
            restore: () => void 0,
            resetTransform: () => void 0,
            setTransform: () => void 0,
            translate: () => void 0,
            rotate: () => void 0,
            scale: () => void 0,
            // drawing ops
            beginPath: () => void 0,
            closePath: () => void 0,
            stroke: () => void 0,
            fill: () => void 0,
            fillRect: (_x: number, _y: number, _w: number, _h: number) => void 0,
            strokeRect: (_x: number, _y: number, _w: number, _h: number) => void 0,
            rect: (_x: number, _y: number, _w: number, _h: number) => void 0,
            moveTo: (_x: number, _y: number) => void 0,
            lineTo: (_x: number, _y: number) => void 0,
            arc: (_x: number, _y: number, _r: number, _s: number, _e: number) => void 0,
            quadraticCurveTo: (_cpx: number, _cpy: number, _x: number, _y: number) => void 0,
            bezierCurveTo: (_cp1x: number, _cp1y: number, _cp2x: number, _cp2y: number, _x: number, _y: number) => void 0,
            setLineDash: (_segments: number[]) => void 0,
            drawImage: () => void 0,
            clearRect: () => void 0,
            putImageData: (_data: ImageData, _x: number, _y: number) => void 0,
            getImageData: (_x: number, _y: number, _w: number, _h: number) => imageData,
            createImageData: (w: number, h: number) => new ImageData(w, h),
        } as unknown as CanvasRenderingContext2D;
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (HTMLCanvasElement.prototype as any).getContext = function (_type: string) {
        return mockCtx();
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (HTMLCanvasElement.prototype as any).toDataURL = function () {
        return 'data:image/png;base64,';
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (HTMLCanvasElement.prototype as any).toBlob = function (callback: (blob: Blob | null) => void, _type?: string, _quality?: number) {
        const blob = new Blob([new Uint8Array([0])], { type: 'image/png' });
        callback(blob);
    };
}

// jsdom does not implement matchMedia; provide a simple mock used by QuickStart
if (typeof window !== 'undefined' && !('matchMedia' in window)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).matchMedia = (query: string) => ({
        matches: false,
        media: query,
        addListener: () => void 0,
        removeListener: () => void 0,
        addEventListener: () => void 0,
        removeEventListener: () => void 0,
        onchange: null,
        dispatchEvent: () => false,
    });
}

// Provide a minimal DOMPoint polyfill used by transform math
// eslint-disable-next-line @typescript-eslint/no-explicit-any
if (!(globalThis as any).DOMPoint) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).DOMPoint = class DOMPoint {
        x: number;
        y: number;
        z: number;
        w: number;
        constructor(x = 0, y = 0, z = 0, w = 1) {
            this.x = x;
            this.y = y;
            this.z = z;
            this.w = w;
        }
    };
}

// Provide a minimal ImageData polyfill for environments lacking Canvas API
// eslint-disable-next-line @typescript-eslint/no-explicit-any
if (!(globalThis as any).ImageData) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).ImageData = class ImageData {
        width: number;
        height: number;
        data: Uint8ClampedArray;
        constructor(width: number, height: number) {
            this.width = width;
            this.height = height;
            this.data = new Uint8ClampedArray(width * height * 4);
        }
    };
}

// Provide a minimal DOMMatrix polyfill sufficient for tests
// eslint-disable-next-line @typescript-eslint/no-explicit-any
if (!(globalThis as any).DOMMatrix) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).DOMMatrix = class DOMMatrix {
        a = 1;
        toString() {
            return 'matrix(1, 0, 0, 1, 0, 0)';
        }
        translate(_x = 0, _y = 0) {
            return this;
        }
        rotate(_deg = 0) {
            return this;
        }
        scale(s = 1) {
            this.a *= s;
            return this;
        }
        multiply(_m: unknown) {
            return this;
        }
        inverse() {
            return this;
        }
    };
}

// Provide a minimal PointerEvent polyfill for jsdom environments
// eslint-disable-next-line @typescript-eslint/no-explicit-any
if (!(globalThis as any).PointerEvent) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).PointerEvent = class PointerEvent extends Event {
        pointerId?: number;
        clientX?: number;
        clientY?: number;
        buttons?: number;
        button?: number;
        ctrlKey?: boolean;
        shiftKey?: boolean;
        altKey?: boolean;
        metaKey?: boolean;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        constructor(type: string, eventInitDict?: any) {
            super(type, eventInitDict);
            if (eventInitDict) {
                const {
                    pointerId,
                    clientX,
                    clientY,
                    buttons,
                    button,
                    ctrlKey,
                    shiftKey,
                    altKey,
                    metaKey,
                } = eventInitDict;
                this.pointerId = pointerId;
                this.clientX = clientX;
                this.clientY = clientY;
                this.buttons = buttons;
                this.button = button;
                this.ctrlKey = ctrlKey;
                this.shiftKey = shiftKey;
                this.altKey = altKey;
                this.metaKey = metaKey;
            }
        }
    };
}

// Configure react-modal app element to avoid aria warnings in tests
if (typeof document !== 'undefined') {
    Modal.setAppElement(document.body as unknown as HTMLElement);
}
