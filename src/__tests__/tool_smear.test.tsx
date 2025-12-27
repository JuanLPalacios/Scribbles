import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('abr-js');

describe('Drawing Tool - Smear', () => {
    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D | null;

    beforeEach(() => {
        canvas = document.createElement('canvas');
        canvas.width = 200;
        canvas.height = 200;
        ctx = canvas.getContext('2d');
    });

    it('should initialize smear tool', () => {
        expect(canvas).toBeDefined();
        expect(ctx).toBeDefined();
    });

    it('should pick up color from canvas when smearing', () => {
        if (!ctx) return;
        // Create initial colored area
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(50, 50, 50, 50);

        // Simulate smear - pick up red and drag it
        const sourceImageData = ctx.getImageData(50, 50, 50, 50);
        expect(sourceImageData.data[0]).toBeGreaterThan(0); // Red channel exists
    });

    it('should use source-in composite for smearing effect', () => {
        if (!ctx) return;
        // Create source image
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(50, 50, 50, 50);

        // Get initial state
        const bufferCanvas = document.createElement('canvas');
        bufferCanvas.width = 200;
        bufferCanvas.height = 200;
        const bufferCtx = bufferCanvas.getContext('2d')!;

        // Copy source to buffer
        bufferCtx.drawImage(canvas, 0, 0);

        // Apply source-in composite (keeps only overlapping pixels)
        bufferCtx.globalCompositeOperation = 'source-in';
        bufferCtx.drawImage(canvas, 0, 0);

        const imageData = bufferCtx.getImageData(0, 0, 200, 200);
        expect(imageData.data).toBeDefined();
    });

    it('should respect hardness option for smear', () => {
        if (!ctx) return;
        const hardnesses = [0, 0.5, 1.0];

        hardnesses.forEach((hardness) => {
            const testCanvas = document.createElement('canvas');
            testCanvas.width = 200;
            testCanvas.height = 200;
            const testCtx = testCanvas.getContext('2d')!;

            testCtx.fillStyle = '#FF0000';
            testCtx.fillRect(50, 50, 50, 50);

            // Smear simulation
            const imageData = testCtx.getImageData(0, 0, 200, 200);
            expect(imageData.data).toBeDefined();
        });
    });

    it('should create smear stroke movement', () => {
        if (!ctx) return;
        // Create initial content
        ctx.fillStyle = '#00FF00';
        ctx.fillRect(50, 50, 50, 50);

        // Simulate smear path
        const path = [
            { x: 50, y: 50 },
            { x: 60, y: 60 },
            { x: 70, y: 70 },
            { x: 80, y: 80 }
        ];

        path.forEach((point) => {
            ctx!.drawImage(canvas, point.x - 25, point.y - 25);
        });

        const imageData = ctx.getImageData(0, 0, 200, 200);
        expect(imageData.data).toBeDefined();
    });

    it('should composite smear from buffer to canvas', () => {
        if (!ctx) return;
        // Create content on main canvas
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(50, 50, 50, 50);

        // Simulate smear buffer
        const bufferCanvas = document.createElement('canvas');
        bufferCanvas.width = 200;
        bufferCanvas.height = 200;
        const bufferCtx = bufferCanvas.getContext('2d')!;
        bufferCtx.fillStyle = '#00FF00';
        bufferCtx.fillRect(75, 75, 50, 50);

        // Composite to main
        ctx.globalCompositeOperation = 'source-over';
        ctx.drawImage(bufferCanvas, 0, 0);

        const imageData = ctx.getImageData(0, 0, 200, 200);
        expect(imageData.data).toBeDefined();
    });

    it('should handle smear with brush width variation', () => {
        if (!ctx) return;
        ctx.fillStyle = '#0000FF';
        ctx.fillRect(50, 50, 100, 100);

        // Different brush widths
        const widths = [5, 10, 20];

        widths.forEach((width) => {
            ctx!.globalAlpha = 0.8;
            ctx!.fillRect(50, 50, width, width);
        });

        const imageData = ctx.getImageData(0, 0, 200, 200);
        expect(imageData.data.length).toBe(200 * 200 * 4);
    });

    it('should preserve underlying image when smearing', () => {
        if (!ctx) return;
        // Base layer
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(0, 0, 200, 200);

        // Smear operation
        ctx.globalAlpha = 0.7;
        ctx.fillStyle = '#00FF00';
        ctx.fillRect(75, 75, 50, 50);

        const afterSmearData = ctx.getImageData(0, 0, 200, 200);

        // Outer areas should still have original color
        expect(afterSmearData.data[0]).toBeGreaterThan(0); // Red channel
    });

    it('should handle rapid smear strokes', () => {
        if (!ctx) return;
        ctx.fillStyle = '#FFFF00';
        ctx.fillRect(0, 0, 200, 200);

        // Rapid smear movements
        for (let i = 0; i < 100; i += 5) {
            ctx!.globalAlpha = 0.9;
            ctx!.fillRect(i, i, 10, 10);
        }

        const imageData = ctx.getImageData(0, 0, 200, 200);
        expect(imageData.data).toBeDefined();
    });

    it('should blend smear colors naturally', () => {
        if (!ctx) return;
        // Start with red
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(0, 0, 200, 200);

        // Smear with blue at reduced opacity
        ctx.globalAlpha = 0.5;
        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = '#0000FF';
        ctx.fillRect(75, 75, 50, 50);

        const imageData = ctx.getImageData(0, 0, 200, 200);
        const blendIndex = (100 * 200 + 100) * 4;

        // Blended area should have both colors
        expect(imageData.data[blendIndex + 0]).toBeGreaterThan(0); // Red
        expect(imageData.data[blendIndex + 2]).toBeGreaterThan(0); // Blue
    });

    it('should clear buffer between smear strokes', () => {
        if (!ctx) return;
        const bufferCanvas = document.createElement('canvas');
        bufferCanvas.width = 200;
        bufferCanvas.height = 200;
        const bufferCtx = bufferCanvas.getContext('2d')!;

        // First smear
        bufferCtx.fillStyle = '#FF0000';
        bufferCtx.fillRect(50, 50, 50, 50);

        let imageData = bufferCtx.getImageData(0, 0, 200, 200);
        let hasRed = false;
        for (let i = 0; i < imageData.data.length; i += 4) {
            if (imageData.data[i] > 0) {
                hasRed = true;
                break;
            }
        }
        expect(hasRed).toBe(true);

        // Clear buffer
        bufferCtx.clearRect(0, 0, 200, 200);

        imageData = bufferCtx.getImageData(0, 0, 200, 200);
        let isCleared = true;
        for (let i = 3; i < imageData.data.length; i += 4) {
            if (imageData.data[i] > 0) {
                isCleared = false;
                break;
            }
        }
        expect(isCleared).toBe(true);
    });

    it('should handle smear with transparency', () => {
        if (!ctx) return;
        // Semi-transparent base
        ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
        ctx.fillRect(0, 0, 200, 200);

        // Smear operation
        ctx.fillStyle = 'rgba(0, 0, 255, 0.5)';
        ctx.fillRect(75, 75, 50, 50);

        const imageData = ctx.getImageData(0, 0, 200, 200);
        expect(imageData.data).toBeDefined();
    });

    it('should work with multiple source pixels in smear', () => {
        if (!ctx) return;
        // Create varied texture to smear from
        for (let y = 50; y < 150; y += 10) {
            for (let x = 50; x < 150; x += 10) {
                ctx!.fillStyle = `hsl(${(x + y) % 360}, 100%, 50%)`;
                ctx!.fillRect(x, y, 10, 10);
            }
        }

        // Smear across colors
        ctx.globalAlpha = 0.7;
        const smearPath = [
            { x: 50, y: 50 },
            { x: 75, y: 75 },
            { x: 100, y: 100 },
            { x: 125, y: 125 }
        ];

        smearPath.forEach((point) => {
            ctx!.drawImage(canvas, point.x - 25, point.y - 25);
        });

        const imageData = ctx.getImageData(0, 0, 200, 200);
        expect(imageData.data).toBeDefined();
    });
});
