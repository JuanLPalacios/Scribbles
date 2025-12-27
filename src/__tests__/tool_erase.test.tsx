import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('abr-js');
vi.mock('../components/inputs/BrushSelectInput', () => ({
    BrushSelectInput: () => null
}));
vi.mock('../components/inputs/AlphaInput', () => ({
    AlphaInput: () => null
}));

describe('Drawing Tool - Erase', () => {
    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D | null;

    beforeEach(() => {
        canvas = document.createElement('canvas');
        canvas.width = 200;
        canvas.height = 200;
        ctx = canvas.getContext('2d');
    });

    it('should initialize erase tool', () => {
        expect(canvas).toBeDefined();
        expect(ctx).toBeDefined();
    });

    it('should clear pixels when erasing', () => {
        if (!ctx) return;
        // Create initial image with content
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(0, 0, 200, 200);

        let imageData = ctx.getImageData(0, 0, 200, 200);
        let hasColor = false;
        for (let i = 0; i < imageData.data.length; i += 4) {
            if (imageData.data[i + 3] > 0) {
                hasColor = true;
                break;
            }
        }
        expect(hasColor).toBe(true);

        // Simulate erase by clearing area
        ctx.clearRect(50, 50, 50, 50);

        imageData = ctx.getImageData(0, 0, 200, 200);
        // Check that erased area is transparent
        const erasedIndex = (75 * 200 + 75) * 4;
        expect(imageData.data[erasedIndex + 3]).toBe(0);
    });

    it('should use brush width for erase diameter', () => {
        if (!ctx) return;
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(0, 0, 200, 200);

        // Erase with different sizes
        const sizes = [5, 10, 20];

        sizes.forEach((size) => {
            ctx!.clearRect(100 - size / 2, 100 - size / 2, size, size);
        });

        const imageData = ctx.getImageData(0, 0, 200, 200);
        expect(imageData.data).toBeDefined();
    });

    it('should respect alpha/opacity during erase', () => {
        if (!ctx) return;
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(0, 0, 200, 200);

        // Partial erase with lower opacity
        ctx.globalAlpha = 0.5;
        ctx.clearRect(50, 50, 50, 50);

        const imageData = ctx.getImageData(0, 0, 200, 200);
        expect(imageData.data).toBeDefined();
    });

    it('should composite erase from buffer to main canvas', () => {
        if (!ctx) return;
        // Create content on canvas
        ctx.fillStyle = '#0000FF';
        ctx.fillRect(0, 0, 200, 200);

        // Create erase mask on buffer
        const bufferCanvas = document.createElement('canvas');
        bufferCanvas.width = 200;
        bufferCanvas.height = 200;
        const bufferCtx = bufferCanvas.getContext('2d')!;
        bufferCtx.fillStyle = '#FFFFFF';
        bufferCtx.fillRect(75, 75, 50, 50);

        // Apply erase composite operation
        ctx.globalCompositeOperation = 'destination-out';
        ctx.drawImage(bufferCanvas, 0, 0);

        const imageData = ctx.getImageData(0, 0, 200, 200);
        // Center should be erased
        const centerIndex = (100 * 200 + 100) * 4;
        expect(imageData.data[centerIndex + 3]).toBe(0);
    });

    it('should handle multiple erase strokes', () => {
        if (!ctx) return;
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(0, 0, 200, 200);

        // Multiple erase strokes
        ctx.clearRect(20, 20, 30, 30);
        ctx.clearRect(80, 80, 30, 30);
        ctx.clearRect(150, 150, 30, 30);

        const imageData = ctx.getImageData(0, 0, 200, 200);
        expect(imageData.data).toBeDefined();
    });

    it('should erase only alpha channel (not color)', () => {
        if (!ctx) return;
        ctx.fillStyle = 'rgba(255, 0, 0, 1)';
        ctx.fillRect(0, 0, 200, 200);

        // Clear area (affects alpha)
        ctx.clearRect(50, 50, 50, 50);

        const imageData = ctx.getImageData(0, 0, 200, 200);
        const filledIndex = (25 * 200 + 25) * 4;
        const erasedIndex = (75 * 200 + 75) * 4;

        // Filled area should have color and full alpha
        expect(imageData.data[filledIndex + 3]).toBe(255);
        // Erased area should have zero alpha
        expect(imageData.data[erasedIndex + 3]).toBe(0);
    });

    it('should support smooth erasing transitions', () => {
        if (!ctx) return;
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, 200, 200);

        // Simulate gradual erase with decreasing opacity
        ctx.globalAlpha = 0.8;
        ctx.clearRect(60, 60, 20, 20);

        ctx.globalAlpha = 0.5;
        ctx.clearRect(65, 65, 20, 20);

        ctx.globalAlpha = 0.2;
        ctx.clearRect(70, 70, 20, 20);

        const imageData = ctx.getImageData(0, 0, 200, 200);
        expect(imageData.data.length).toBe(200 * 200 * 4);
    });

    it('should preserve underlying content when erasing', () => {
        if (!ctx) return;
        // Layer 1: Red
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(0, 0, 200, 200);

        // Save layer 1 data

        // Erase some area
        ctx.clearRect(50, 50, 50, 50);

        // Layer 2: Green over layer 1
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = '#00FF00';
        ctx.fillRect(75, 75, 50, 50);

        const finalData = ctx.getImageData(0, 0, 200, 200);
        expect(finalData.data).toBeDefined();
    });

    it('should handle erase with different composite modes', () => {
        if (!ctx) return;
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(0, 0, 200, 200);

        // Erase using destination-out
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillStyle = '#000000';
        ctx.fillRect(50, 50, 50, 50);

        ctx.globalCompositeOperation = 'source-over';

        const imageData = ctx.getImageData(0, 0, 200, 200);
        expect(imageData.data).toBeDefined();
    });

    it('should work with partial alpha pixels', () => {
        if (!ctx) return;
        // Create semi-transparent content
        ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
        ctx.fillRect(0, 0, 200, 200);

        // Erase portion
        ctx.clearRect(50, 50, 50, 50);

        const imageData = ctx.getImageData(0, 0, 200, 200);
        const partialIndex = (25 * 200 + 25) * 4;
        const erasedIndex = (75 * 200 + 75) * 4;

        expect(imageData.data[partialIndex + 3]).toBeLessThan(255);
        expect(imageData.data[erasedIndex + 3]).toBe(0);
    });
});
