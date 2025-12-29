// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import Modal from 'react-modal';

// Canvas 2D context: provided by the canvas npm package via jsdom.
// The canvas package (v3.2.0+) provides real canvas bindings for Node.js/jsdom tests.
// If native binding issues occur on Windows, run `npm rebuild canvas` to recompile.
// No custom mock needed; all canvas API methods work natively.

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
        matrixTransform(matrix: any) {
            // Simple identity transform if matrix is not a valid DOMMatrix
            if (!matrix) return new (globalThis as any).DOMPoint(this.x, this.y, this.z, this.w);
            // Return new point without actual transformation for tests
            return new (globalThis as any).DOMPoint(this.x, this.y, this.z, this.w);
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

// Stub HTMLCanvasElement.toBlob to avoid blocking on native canvas work in tests
// This returns a tiny PNG blob immediately instead of performing heavy serialization
if (typeof HTMLCanvasElement !== 'undefined') {
    HTMLCanvasElement.prototype.toBlob = function (callback: BlobCallback | null, _type?: string, _quality?: number) {
        // Return a minimal PNG blob synchronously to maintain the callback contract
        // IMPORTANT: Must provide a non-null blob to avoid hanging promises in sdrw.ts zipDataV1S1
        if (callback) {
            callback(new Blob([new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])], { type: 'image/png' }));
        }
    };

    // Stub toDataURL to avoid slow native PNG encoding in tests
    HTMLCanvasElement.prototype.toDataURL = function (_type?: string, _quality?: number): string {
        // Return a minimal 1x1 PNG data URL
        return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    };
}
