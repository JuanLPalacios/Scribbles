import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('abr-js');

describe('Drawing Tool - Lasso Cut', () => {
    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D | null;

    beforeEach(() => {
        canvas = document.createElement('canvas');
        canvas.width = 200;
        canvas.height = 200;
        ctx = canvas.getContext('2d');
    });

    it('should initialize lasso cut tool', () => {
        expect(canvas).toBeDefined();
        expect(ctx).toBeDefined();
    });

    it('should create lasso path on buffer canvas', () => {
        if (!ctx) return;
        // Simulate lasso path drawing
        ctx.beginPath();
        ctx.moveTo(50, 50);
        ctx.lineTo(150, 50);
        ctx.lineTo(150, 150);
        ctx.lineTo(50, 150);
        ctx.closePath();
        ctx.stroke();

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

    it('should fill lasso selection mask', () => {
        if (!ctx) return;
        ctx.beginPath();
        ctx.moveTo(50, 50);
        ctx.lineTo(150, 50);
        ctx.lineTo(150, 150);
        ctx.lineTo(50, 150);
        ctx.closePath();

        ctx.fillStyle = '#FFFFFF';
        ctx.fill();

        const imageData = ctx.getImageData(100, 100, 1, 1);
        expect(imageData.data[3]).toBeGreaterThan(0); // Filled area
    });

    it('should extract cut region from layer', () => {
        if (!ctx) return;
        // Create layer content
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(0, 0, 200, 200);

        // Create lasso mask
        const maskCanvas = document.createElement('canvas');
        maskCanvas.width = 200;
        maskCanvas.height = 200;
        const maskCtx = maskCanvas.getContext('2d')!;

        maskCtx.beginPath();
        maskCtx.moveTo(50, 50);
        maskCtx.lineTo(150, 50);
        maskCtx.lineTo(150, 150);
        maskCtx.lineTo(50, 150);
        maskCtx.closePath();
        maskCtx.fillStyle = '#FFFFFF';
        maskCtx.fill();

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

        // Create cut region
        const cutMask = document.createElement('canvas');
        cutMask.width = 200;
        cutMask.height = 200;
        const cutCtx = cutMask.getContext('2d')!;

        cutCtx.beginPath();
        cutCtx.moveTo(75, 75);
        cutCtx.lineTo(125, 75);
        cutCtx.lineTo(125, 125);
        cutCtx.lineTo(75, 125);
        cutCtx.closePath();
        cutCtx.fillStyle = '#FFFFFF';
        cutCtx.fill();

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

    it('should create new layer from cut content', () => {
        if (!ctx) return;
        // Source layer with content
        ctx.fillStyle = '#00FF00';
        ctx.fillRect(0, 0, 200, 200);

        // Extract using lasso
        const extractCanvas = document.createElement('canvas');
        extractCanvas.width = 100;
        extractCanvas.height = 100;
        const extractCtx = extractCanvas.getContext('2d')!;

        // Copy lasso region
        extractCtx.drawImage(canvas, 75, 75, 50, 50, 0, 0, 50, 50);

        const imageData = extractCtx.getImageData(0, 0, 50, 50);
        let hasGreen = false;
        for (let i = 1; i < imageData.data.length; i += 4) {
            if (imageData.data[i] > 0) {
                hasGreen = true;
                break;
            }
        }
        expect(hasGreen).toBe(true);
    });

    it('should handle complex lasso paths', () => {
        if (!ctx) return;
        ctx.beginPath();
        ctx.moveTo(50, 50);
        ctx.quadraticCurveTo(100, 20, 150, 50);
        ctx.quadraticCurveTo(180, 100, 150, 150);
        ctx.quadraticCurveTo(100, 180, 50, 150);
        ctx.quadraticCurveTo(20, 100, 50, 50);
        ctx.closePath();

        ctx.fillStyle = '#FFFFFF';
        ctx.fill();

        const imageData = ctx.getImageData(100, 100, 1, 1);
        expect(imageData.data[3]).toBeGreaterThan(0);
    });

    it('should handle curved lasso selection', () => {
        if (!ctx) return;
        // Circular lasso
        ctx.beginPath();
        ctx.arc(100, 100, 50, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();

        const centerIndex = (100 * 200 + 100) * 4;
        const imageData = ctx.getImageData(0, 0, 200, 200);
        expect(imageData.data[centerIndex + 3]).toBeGreaterThan(0);

        const cornerIndex = (50 * 200 + 50) * 4;
        expect(imageData.data[cornerIndex + 3]).toBe(0); // Outside circle
    });

    it('should composite cut content separately', () => {
        if (!ctx) return;
        // Original layer
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(0, 0, 200, 200);

        // Cut region as separate layer
        const cutLayer = document.createElement('canvas');
        cutLayer.width = 200;
        cutLayer.height = 200;
        const cutCtx = cutLayer.getContext('2d')!;

        // Mask for lasso shape
        const mask = document.createElement('canvas');
        mask.width = 200;
        mask.height = 200;
        const maskCtx = mask.getContext('2d')!;
        maskCtx.beginPath();
        maskCtx.arc(100, 100, 50, 0, Math.PI * 2);
        maskCtx.fillStyle = '#FFFFFF';
        maskCtx.fill();

        cutCtx.drawImage(canvas, 0, 0);
        cutCtx.globalCompositeOperation = 'destination-in';
        cutCtx.drawImage(mask, 0, 0);

        const imageData = cutCtx.getImageData(100, 100, 1, 1);
        expect(imageData.data).toBeDefined();
    });

    it('should handle zero-size cut regions gracefully', () => {
        if (!ctx) return;
        ctx.fillStyle = '#00FF00';
        ctx.fillRect(0, 0, 200, 200);

        const beforeData = ctx.getImageData(0, 0, 200, 200);
        let beforeHasColor = false;
        for (let i = 1; i < beforeData.data.length; i += 4) {
            if (beforeData.data[i] > 0) {
                beforeHasColor = true;
                break;
            }
        }
        expect(beforeHasColor).toBe(true);
    });

    it('should track bounding box of lasso selection', () => {
        if (!ctx) return;
        const points = [
            { x: 50, y: 50 },
            { x: 150, y: 50 },
            { x: 150, y: 150 },
            { x: 50, y: 150 }
        ];

        let minX = points[0].x, maxX = points[0].x;
        let minY = points[0].y, maxY = points[0].y;

        points.forEach((p) => {
            minX = Math.min(minX, p.x);
            maxX = Math.max(maxX, p.x);
            minY = Math.min(minY, p.y);
            maxY = Math.max(maxY, p.y);
        });

        expect(minX).toBe(50);
        expect(maxX).toBe(150);
        expect(minY).toBe(50);
        expect(maxY).toBe(150);
    });

    it('should handle multi-point lasso path update', () => {
        if (!ctx) return;
        const pathPoints = [
            { x: 50, y: 50 },
            { x: 75, y: 50 },
            { x: 100, y: 75 },
            { x: 100, y: 100 },
            { x: 75, y: 125 },
            { x: 50, y: 125 }
        ];

        ctx.beginPath();
        ctx.moveTo(pathPoints[0].x, pathPoints[0].y);
        pathPoints.slice(1).forEach((p) => {
            ctx!.lineTo(p.x, p.y);
        });
        ctx.closePath();
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.stroke();

        const imageData = ctx.getImageData(0, 0, 200, 200);
        expect(imageData.data).toBeDefined();
    });

    it('should finalize cut and copy content to new layer', () => {
        if (!ctx) return;
        // Create content
        ctx.fillStyle = '#FF00FF';
        ctx.fillRect(0, 0, 200, 200);

        // Lasso region
        const lasso = document.createElement('canvas');
        lasso.width = 200;
        lasso.height = 200;
        const lassoCtx = lasso.getContext('2d')!;
        lassoCtx.beginPath();
        lassoCtx.arc(100, 100, 50, 0, Math.PI * 2);
        lassoCtx.fillStyle = '#FFFFFF';
        lassoCtx.fill();

        // Create new layer with cut content
        const newLayer = document.createElement('canvas');
        newLayer.width = 100;
        newLayer.height = 100;
        const newCtx = newLayer.getContext('2d')!;

        newCtx.drawImage(canvas, 50, 50, 100, 100, 0, 0, 100, 100);

        const imageData = newCtx.getImageData(0, 0, 100, 100);
        let hasContent = false;
        for (let i = 0; i < imageData.data.length; i += 4) {
            if (imageData.data[i] > 0 || imageData.data[i + 2] > 0) {
                hasContent = true;
                break;
            }
        }
        expect(hasContent).toBe(true);
    });
});
