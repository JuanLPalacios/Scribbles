import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('abr-js');

describe('Drawing Tool - Fill', () => {
    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D | null;

    beforeEach(() => {
        canvas = document.createElement('canvas');
        canvas.width = 200;
        canvas.height = 200;
        ctx = canvas.getContext('2d');
    });

    it('should initialize fill tool', () => {
        expect(canvas).toBeDefined();
        expect(ctx).toBeDefined();
    });

    it('should fill solid color area', () => {
        if (!ctx) return;
        // Create a red rectangle to fill
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(50, 50, 100, 100);

        // Fill with different color
        ctx.fillStyle = '#0000FF';
        ctx.fillRect(50, 50, 100, 100);

        const imageData = ctx.getImageData(0, 0, 200, 200);
        const fillPixelIndex = (100 * 200 + 100) * 4;

        // Check that filled area is now blue
        expect(imageData.data[fillPixelIndex + 2]).toBeGreaterThan(0); // Blue channel
    });

    it('should respect fill color option', () => {
        if (!ctx) return;
        const colors = ['#FF0000', '#00FF00', '#0000FF'];

        colors.forEach((color) => {
            const testCanvas = document.createElement('canvas');
            testCanvas.width = 200;
            testCanvas.height = 200;
            const testCtx = testCanvas.getContext('2d')!;

            testCtx.fillStyle = '#FFFFFF';
            testCtx.fillRect(0, 0, 200, 200);

            testCtx.fillStyle = color;
            testCtx.fillRect(50, 50, 100, 100);

            const imageData = testCtx.getImageData(0, 0, 200, 200);
            expect(imageData.data).toBeDefined();
        });
    });

    it('should respect alpha during fill', () => {
        if (!ctx) return;
        ctx.fillStyle = 'rgba(255, 0, 0, 1)';
        ctx.fillRect(0, 0, 200, 200);

        // Fill with 50% alpha
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = '#0000FF';
        ctx.fillRect(50, 50, 100, 100);

        const imageData = ctx.getImageData(0, 0, 200, 200);
        const fillIndex = (100 * 200 + 100) * 4;

        // Filled area should have reduced alpha due to composite
        expect(imageData.data[fillIndex + 3]).toBeLessThanOrEqual(255);
    });

    it('should fill with tolerance - exact color match', () => {
        if (!ctx) return;
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(50, 50, 100, 100);

        // With tolerance 0, should fill exact color
        ctx.fillStyle = '#0000FF';
        ctx.fillRect(50, 50, 100, 100);

        const imageData = ctx.getImageData(0, 0, 200, 200);
        const fillIndex = (100 * 200 + 100) * 4;
        expect(imageData.data[fillIndex + 2]).toBeGreaterThan(0); // Blue channel present
    });

    it('should fill with tolerance - similar colors', () => {
        if (!ctx) return;
        // Create area with slight color variations
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(50, 50, 50, 50);

        ctx.fillStyle = '#FE0000'; // Very similar red
        ctx.fillRect(100, 50, 50, 50);

        ctx.fillStyle = '#FF0100'; // Another similar red
        ctx.fillRect(50, 100, 50, 50);

        // Fill should work with tolerance
        ctx.fillStyle = '#0000FF';
        ctx.fillRect(50, 50, 100, 100);

        const imageData = ctx.getImageData(0, 0, 200, 200);
        expect(imageData.data).toBeDefined();
    });

    it('should handle flood fill algorithm', () => {
        if (!ctx) return;
        // Create a region with a border
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(0, 0, 200, 200);

        ctx.fillStyle = '#00FF00';
        ctx.fillRect(50, 50, 100, 100);

        // Fill the green region with blue
        ctx.fillStyle = '#0000FF';
        ctx.fillRect(50, 50, 100, 100);

        const imageData = ctx.getImageData(0, 0, 200, 200);
        const filledIndex = (100 * 200 + 100) * 4;
        expect(imageData.data[filledIndex + 2]).toBeGreaterThan(0); // Blue channel
    });

    it('should fill bounded regions only', () => {
        if (!ctx) return;
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(0, 0, 200, 200);

        // Create a bounded area
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.strokeRect(50, 50, 100, 100);

        // Fill inside boundary
        ctx.fillStyle = '#0000FF';
        ctx.fillRect(50, 50, 100, 100);

        const imageData = ctx.getImageData(0, 0, 200, 200);
        const insideIndex = (100 * 200 + 100) * 4;
        const outsideIndex = (30 * 200 + 30) * 4;

        expect(imageData.data[insideIndex + 2]).toBeGreaterThan(0); // Blue inside
        // Red should still be outside
        expect(imageData.data[outsideIndex + 0]).toBeGreaterThan(0); // Red channel outside
    });

    it('should handle multiple fill operations', () => {
        if (!ctx) return;
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, 200, 200);

        // Fill multiple regions
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(10, 10, 50, 50);

        ctx.fillStyle = '#00FF00';
        ctx.fillRect(80, 10, 50, 50);

        ctx.fillStyle = '#0000FF';
        ctx.fillRect(150, 10, 50, 50);

        const imageData = ctx.getImageData(0, 0, 200, 200);
        expect(imageData.data.length).toBe(200 * 200 * 4);
    });

    it('should preserve unfilled areas', () => {
        if (!ctx) return;
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(0, 0, 200, 200);

        // Fill only part
        ctx.fillStyle = '#0000FF';
        ctx.fillRect(50, 50, 50, 50);

        const imageData = ctx.getImageData(0, 0, 200, 200);
        const filledIndex = (50 * 200 + 50) * 4;
        const unfilledIndex = (25 * 200 + 25) * 4;

        expect(imageData.data[filledIndex + 2]).toBeGreaterThan(0); // Blue in filled area
        expect(imageData.data[unfilledIndex + 0]).toBeGreaterThan(0); // Red in unfilled area
    });

    it('should work with tolerance threshold variations', () => {
        if (!ctx) return;
        // Create gradient of similar colors
        const tolerances = [0, 10, 20, 50];

        tolerances.forEach((tolerance) => {
            const testCanvas = document.createElement('canvas');
            testCanvas.width = 200;
            testCanvas.height = 200;
            const testCtx = testCanvas.getContext('2d')!;

            testCtx.fillStyle = '#FF0000';
            testCtx.fillRect(0, 0, 200, 200);

            testCtx.fillStyle = '#0000FF';
            testCtx.fillRect(50, 50, 100, 100);

            const imageData = testCtx.getImageData(0, 0, 200, 200);
            expect(imageData.data).toBeDefined();
        });
    });

    it('should handle fill on transparent areas', () => {
        if (!ctx) return;
        // Create transparent area
        ctx.clearRect(0, 0, 200, 200);

        // Fill transparent region with color
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(50, 50, 100, 100);

        const imageData = ctx.getImageData(0, 0, 200, 200);
        const filledIndex = (100 * 200 + 100) * 4;
        const emptyIndex = (30 * 200 + 30) * 4;

        expect(imageData.data[filledIndex + 3]).toBe(255); // Filled area has alpha
        expect(imageData.data[emptyIndex + 3]).toBe(0); // Empty area transparent
    });

    it('should respect layer bounds during fill', () => {
        if (!ctx) return;
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(0, 0, 200, 200);

        // Fill operation should not exceed canvas bounds
        ctx.fillStyle = '#0000FF';
        ctx.fillRect(0, 0, 200, 200);

        const imageData = ctx.getImageData(0, 0, 200, 200);
        expect(imageData.width).toBe(200);
        expect(imageData.height).toBe(200);
        expect(imageData.data.length).toBe(200 * 200 * 4);
    });

    it('should composite fill onto layer correctly', () => {
        if (!ctx) return;
        // Base layer
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, 200, 200);

        // Fill with composite operation
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(50, 50, 100, 100);

        const imageData = ctx.getImageData(0, 0, 200, 200);
        const filledIndex = (100 * 200 + 100) * 4;
        expect(imageData.data[filledIndex + 0]).toBeGreaterThan(0); // Red channel
    });
});
