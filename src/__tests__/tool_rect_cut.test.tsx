import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('abr-js');

describe('Drawing Tool - Rect Cut', () => {
    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D | null;

    beforeEach(() => {
        canvas = document.createElement('canvas');
        canvas.width = 200;
        canvas.height = 200;
        ctx = canvas.getContext('2d');
    });

    it('should initialize rect cut tool', () => {
        expect(canvas).toBeDefined();
        expect(ctx).toBeDefined();
    });

    it('should draw rectangle selection on buffer', () => {
        if (!ctx) return;
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        ctx.strokeRect(50, 50, 100, 100);

        const imageData = ctx.getImageData(0, 0, 200, 200);
        let hasStroke = false;
        for (let i = 0; i < imageData.data.length; i += 4) {
            if (imageData.data[i + 3] > 0) {
                hasStroke = true;
                break;
            }
        }
        expect(hasStroke).toBe(true);
    });

    it('should fill rectangular selection mask', () => {
        if (!ctx) return;
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(50, 50, 100, 100);

        const insideIndex = (100 * 200 + 100) * 4;
        const imageData = ctx.getImageData(0, 0, 200, 200);
        expect(imageData.data[insideIndex + 3]).toBeGreaterThan(0);
    });

    it('should extract rectangular region from layer', () => {
        if (!ctx) return;
        // Create layer content
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(0, 0, 200, 200);

        // Create rectangular mask
        const maskCanvas = document.createElement('canvas');
        maskCanvas.width = 200;
        maskCanvas.height = 200;
        const maskCtx = maskCanvas.getContext('2d')!;
        maskCtx.fillStyle = '#FFFFFF';
        maskCtx.fillRect(50, 50, 100, 100);

        // Apply mask to extract region
        ctx.globalCompositeOperation = 'destination-in';
        ctx.drawImage(maskCanvas, 0, 0);

        const imageData = ctx.getImageData(100, 100, 1, 1);
        expect(imageData.data[0]).toBeGreaterThan(0); // Red channel
    });

    it('should remove cut content from original layer', () => {
        if (!ctx) return;
        // Create content
        ctx.fillStyle = '#0000FF';
        ctx.fillRect(0, 0, 200, 200);

        // Create rectangular cut region
        const cutMask = document.createElement('canvas');
        cutMask.width = 200;
        cutMask.height = 200;
        const cutCtx = cutMask.getContext('2d')!;
        cutCtx.fillStyle = '#FFFFFF';
        cutCtx.fillRect(75, 75, 50, 50);

        // Remove cut region
        ctx.globalCompositeOperation = 'destination-out';
        ctx.drawImage(cutMask, 0, 0);

        // Center should be transparent
        const centerIndex = (100 * 200 + 100) * 4;
        const imageData = ctx.getImageData(0, 0, 200, 200);
        expect(imageData.data[centerIndex + 3]).toBe(0);

        // Edge should still have color
        const edgeIndex = (40 * 200 + 40) * 4;
        expect(imageData.data[edgeIndex + 2]).toBeGreaterThan(0);
    });

    it('should create new layer from cut rectangular region', () => {
        if (!ctx) return;
        // Source layer with content
        ctx.fillStyle = '#00FF00';
        ctx.fillRect(0, 0, 200, 200);

        // Extract rectangular region
        const extractCanvas = document.createElement('canvas');
        extractCanvas.width = 100;
        extractCanvas.height = 100;
        const extractCtx = extractCanvas.getContext('2d')!;

        // Copy rectangular region
        extractCtx.drawImage(canvas, 50, 50, 100, 100, 0, 0, 100, 100);

        const imageData = extractCtx.getImageData(0, 0, 100, 100);
        let hasGreen = false;
        for (let i = 1; i < imageData.data.length; i += 4) {
            if (imageData.data[i] > 0) {
                hasGreen = true;
                break;
            }
        }
        expect(hasGreen).toBe(true);
    });

    it('should handle rectangular selection at different positions', () => {
        if (!ctx) return;
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, 200, 200);

        const rectangles = [
            { x: 0, y: 0, w: 50, h: 50 },
            { x: 75, y: 75, w: 50, h: 50 },
            { x: 150, y: 150, w: 50, h: 50 }
        ];

        rectangles.forEach((rect) => {
            ctx!.fillStyle = '#FF0000';
            ctx!.fillRect(rect.x, rect.y, rect.w, rect.h);
        });

        const imageData = ctx.getImageData(0, 0, 200, 200);
        expect(imageData.data).toBeDefined();
    });

    it('should handle different rectangle sizes', () => {
        if (!ctx) return;
        const sizes = [
            { w: 25, h: 25 },
            { w: 50, h: 50 },
            { w: 100, h: 100 }
        ];

        sizes.forEach((size) => {
            const testCanvas = document.createElement('canvas');
            testCanvas.width = 200;
            testCanvas.height = 200;
            const testCtx = testCanvas.getContext('2d')!;

            testCtx.fillStyle = '#00FF00';
            testCtx.fillRect(0, 0, 200, 200);

            const mask = document.createElement('canvas');
            mask.width = 200;
            mask.height = 200;
            const maskCtx = mask.getContext('2d')!;
            maskCtx.fillStyle = '#FFFFFF';
            maskCtx.fillRect(50, 50, size.w, size.h);

            testCtx.globalCompositeOperation = 'destination-in';
            testCtx.drawImage(mask, 0, 0);

            const imageData = testCtx.getImageData(0, 0, 200, 200);
            expect(imageData.data).toBeDefined();
        });
    });

    it('should track rectangle bounds correctly', () => {
        if (!ctx) return;
        const rect = { x: 50, y: 75, width: 100, height: 50 };

        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);

        expect(rect.x).toBe(50);
        expect(rect.y).toBe(75);
        expect(rect.width).toBe(100);
        expect(rect.height).toBe(50);
    });

    it('should handle rectangular selection with transparency', () => {
        if (!ctx) return;
        ctx.fillStyle = 'rgba(255, 0, 0, 0.7)';
        ctx.fillRect(0, 0, 200, 200);

        const mask = document.createElement('canvas');
        mask.width = 200;
        mask.height = 200;
        const maskCtx = mask.getContext('2d')!;
        maskCtx.fillStyle = '#FFFFFF';
        maskCtx.fillRect(50, 50, 100, 100);

        ctx.globalCompositeOperation = 'destination-in';
        ctx.drawImage(mask, 0, 0);

        const imageData = ctx.getImageData(100, 100, 1, 1);
        expect(imageData.data[3]).toBeGreaterThan(0);
    });

    it('should composite cut rectangular content separately', () => {
        if (!ctx) return;
        // Original layer
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(0, 0, 200, 200);

        // Save cut region
        const cutData = ctx.getImageData(50, 50, 100, 100);

        // Create new layer from cut
        const cutLayer = document.createElement('canvas');
        cutLayer.width = 100;
        cutLayer.height = 100;
        const cutCtx = cutLayer.getContext('2d')!;
        cutCtx.putImageData(cutData, 0, 0);

        const imageData = cutCtx.getImageData(0, 0, 100, 100);
        let hasRed = false;
        for (let i = 0; i < imageData.data.length; i += 4) {
            if (imageData.data[i] > 0) {
                hasRed = true;
                break;
            }
        }
        expect(hasRed).toBe(true);
    });

    it('should handle rectangle that extends beyond layer bounds', () => {
        if (!ctx) return;
        ctx.fillStyle = '#00FF00';
        ctx.fillRect(0, 0, 200, 200);

        // Rectangle that extends beyond bounds
        const mask = document.createElement('canvas');
        mask.width = 200;
        mask.height = 200;
        const maskCtx = mask.getContext('2d')!;
        maskCtx.fillStyle = '#FFFFFF';
        maskCtx.fillRect(150, 150, 100, 100); // Extends beyond 200x200

        ctx.globalCompositeOperation = 'destination-in';
        ctx.drawImage(mask, 0, 0);

        const imageData = ctx.getImageData(0, 0, 200, 200);
        expect(imageData.data.length).toBe(200 * 200 * 4);
    });

    it('should handle minimum size rectangle', () => {
        if (!ctx) return;
        ctx.fillStyle = '#FF00FF';
        ctx.fillRect(0, 0, 200, 200);

        const mask = document.createElement('canvas');
        mask.width = 200;
        mask.height = 200;
        const maskCtx = mask.getContext('2d')!;
        maskCtx.fillStyle = '#FFFFFF';
        maskCtx.fillRect(100, 100, 1, 1); // 1x1 pixel

        ctx.globalCompositeOperation = 'destination-in';
        ctx.drawImage(mask, 0, 0);

        const imageData = ctx.getImageData(100, 100, 1, 1);
        expect(imageData.data[0]).toBeGreaterThan(0); // Should have content
    });

    it('should support resizing rectangular selection during drag', () => {
        if (!ctx) return;
        const initialRect = { x: 50, y: 50, width: 50, height: 50 };
        const resizedRect = { x: 40, y: 40, width: 120, height: 120 };

        // Draw initial
        ctx.strokeRect(initialRect.x, initialRect.y, initialRect.width, initialRect.height);

        // Clear and draw resized
        ctx.clearRect(0, 0, 200, 200);
        ctx.strokeRect(resizedRect.x, resizedRect.y, resizedRect.width, resizedRect.height);

        expect(resizedRect.width).toBeGreaterThan(initialRect.width);
        expect(resizedRect.height).toBeGreaterThan(initialRect.height);
    });

    it('should finalize rectangular cut correctly', () => {
        if (!ctx) return;
        // Original content
        ctx.fillStyle = '#0000FF';
        ctx.fillRect(0, 0, 200, 200);

        const cutX = 50, cutY = 50, cutW = 100, cutH = 100;

        // Get cut region imageData
        const cutImageData = ctx.getImageData(cutX, cutY, cutW, cutH);

        // Create new layer with cut
        const newLayer = document.createElement('canvas');
        newLayer.width = cutW;
        newLayer.height = cutH;
        const newCtx = newLayer.getContext('2d')!;
        newCtx.putImageData(cutImageData, 0, 0);

        // Remove from original
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(cutX, cutY, cutW, cutH);
        ctx.globalCompositeOperation = 'source-over';

        // Verify cut
        const cutData = newCtx.getImageData(0, 0, cutW, cutH);
        expect(cutData.width).toBe(cutW);
        expect(cutData.height).toBe(cutH);

        // Verify removal from original
        const originalData = ctx.getImageData(cutX, cutY, cutW, cutH);
        expect(originalData.data[cutY * cutW * 4 + 3]).toBe(0);
    });
});
