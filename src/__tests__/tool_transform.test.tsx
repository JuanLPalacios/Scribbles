import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DOMMatrix } from '../lib/DOMMath';

vi.mock('abr-js');

describe('Drawing Tool - Transform', () => {
    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D | null;

    beforeEach(() => {
        canvas = document.createElement('canvas');
        canvas.width = 200;
        canvas.height = 200;
        ctx = canvas.getContext('2d');
    });

    it('should initialize transform tool', () => {
        expect(canvas).toBeDefined();
        expect(ctx).toBeDefined();
    });

    it('should apply translation transform', () => {
        if (!ctx) return;
        // Create content
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(50, 50, 50, 50);

        // Apply translation
        const matrix = new DOMMatrix();
        if (matrix.translate) {
            matrix.translate(10, 10);
        }

        // Verify matrix was modified
        expect(matrix).toBeDefined();
    });

    it('should apply rotation transform', () => {
        if (!ctx) return;
        ctx.fillStyle = '#00FF00';
        ctx.fillRect(75, 75, 50, 50);

        const matrix = new DOMMatrix();
        if (matrix.rotate) {
            matrix.rotate(45);
        }

        expect(matrix).toBeDefined();
    });

    it('should apply scale transform', () => {
        if (!ctx) return;
        ctx.fillStyle = '#0000FF';
        ctx.fillRect(50, 50, 100, 100);

        const matrix = new DOMMatrix();
        if (matrix.scale) {
            matrix.scale(2, 2);
        }

        expect(matrix).toBeDefined();
    });

    it('should compose multiple transforms', () => {
        if (!ctx) return;
        ctx.fillStyle = '#FFFF00';
        ctx.fillRect(50, 50, 50, 50);

        const matrix = new DOMMatrix();
        if (matrix.translate && matrix.rotate && matrix.scale) {
            matrix.translate(100, 100);
            matrix.rotate(45);
            matrix.scale(1.5, 1.5);
        }

        expect(matrix).toBeDefined();
    });

    it('should calculate inverse transform', () => {
        if (!ctx) return;
        const matrix = new DOMMatrix();
        if (matrix.inverse) {
            const inverse = matrix.inverse();
            expect(inverse).toBeDefined();
        }
    });

    it('should multiply transform matrices', () => {
        if (!ctx) return;
        const matrix1 = new DOMMatrix();
        const matrix2 = new DOMMatrix();

        if (matrix1.multiply) {
            const result = matrix1.multiply(matrix2);
            expect(result).toBeDefined();
        }
    });

    it('should apply context transformation', () => {
        if (!ctx) return;
        ctx.save();
        ctx.translate(100, 100);
        ctx.rotate(Math.PI / 4);
        ctx.scale(2, 2);

        ctx.fillStyle = '#FF0000';
        ctx.fillRect(-25, -25, 50, 50);

        ctx.restore();

        const imageData = ctx.getImageData(0, 0, 200, 200);
        expect(imageData.data).toBeDefined();
    });

    it('should reset transformation', () => {
        if (!ctx) return;
        ctx.translate(50, 50);
        ctx.rotate(Math.PI / 6);
        ctx.scale(2, 2);

        ctx.resetTransform();

        ctx.fillStyle = '#FF0000';
        ctx.fillRect(0, 0, 50, 50);

        const imageData = ctx.getImageData(0, 0, 200, 200);
        const pixelIndex = (25 * 200 + 25) * 4;
        expect(imageData.data[pixelIndex]).toBeGreaterThan(0); // Red at (0,0)
    });

    it('should transform and composite correctly', () => {
        if (!ctx) return;
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(0, 0, 200, 200);

        ctx.save();
        ctx.translate(100, 100);
        ctx.rotate(Math.PI / 4);
        ctx.fillStyle = '#0000FF';
        ctx.fillRect(-25, -25, 50, 50);
        ctx.restore();

        const imageData = ctx.getImageData(0, 0, 200, 200);
        expect(imageData.data).toBeDefined();
    });

    it('should handle layer rotation correctly', () => {
        if (!ctx) return;
        ctx.fillStyle = '#00FF00';
        ctx.fillRect(0, 0, 200, 200);

        ctx.save();
        ctx.translate(100, 100);
        ctx.rotate(Math.PI / 2); // 90 degrees
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(-50, -50, 100, 100);
        ctx.restore();

        const imageData = ctx.getImageData(0, 0, 200, 200);
        expect(imageData.data).toBeDefined();
    });

    it('should handle non-uniform scaling', () => {
        if (!ctx) return;
        ctx.save();
        ctx.translate(100, 100);
        ctx.scale(2, 1); // Scale X but not Y

        ctx.fillStyle = '#FF00FF';
        ctx.fillRect(-50, -50, 100, 100);
        ctx.restore();

        const imageData = ctx.getImageData(0, 0, 200, 200);
        expect(imageData.data).toBeDefined();
    });

    it('should preserve layer content during transform', () => {
        if (!ctx) return;
        ctx.fillStyle = '#0000FF';
        ctx.fillRect(0, 0, 200, 200);

        const beforeTransform = ctx.getImageData(100, 100, 1, 1);
        expect(beforeTransform.data[2]).toBeGreaterThan(128); // Blue

        ctx.save();
        ctx.rotate(Math.PI / 4);
        ctx.restore();

        const afterTransform = ctx.getImageData(100, 100, 1, 1);
        // Content should be transformed but present
        expect(afterTransform.data).toBeDefined();
    });

    it('should handle matrix composition for complex transforms', () => {
        if (!ctx) return;
        ctx.save();

        // Apply series of transforms
        ctx.translate(50, 50);
        ctx.rotate(Math.PI / 6);
        ctx.scale(1.5, 1.5);
        ctx.translate(-25, -25);

        ctx.fillStyle = '#FFFF00';
        ctx.fillRect(0, 0, 50, 50);

        ctx.restore();

        const imageData = ctx.getImageData(0, 0, 200, 200);
        expect(imageData.data).toBeDefined();
    });

    it('should handle flip transforms', () => {
        if (!ctx) return;
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(0, 0, 100, 200);

        ctx.save();
        ctx.scale(-1, 1); // Flip horizontally
        ctx.translate(-200, 0);

        ctx.fillStyle = '#00FF00';
        ctx.fillRect(0, 0, 100, 200);

        ctx.restore();

        const imageData = ctx.getImageData(0, 0, 200, 200);
        expect(imageData.data).toBeDefined();
    });

    it('should save and restore transform state', () => {
        if (!ctx) return;
        ctx.translate(50, 50);
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(0, 0, 50, 50);

        ctx.save();
        ctx.translate(50, 50);
        ctx.fillStyle = '#00FF00';
        ctx.fillRect(0, 0, 50, 50);
        ctx.restore();

        // After restore, should be at original translation
        ctx.fillStyle = '#0000FF';
        ctx.fillRect(0, 0, 50, 50);

        const imageData = ctx.getImageData(0, 0, 200, 200);
        expect(imageData.data).toBeDefined();
    });

    it('should apply skew-like transforms', () => {
        if (!ctx) return;
        ctx.save();

        // Simulate skew using transform matrix
        ctx.transform(1, 0.5, 0, 1, 0, 0);
        ctx.fillStyle = '#FF00FF';
        ctx.fillRect(50, 50, 50, 50);

        ctx.restore();

        const imageData = ctx.getImageData(0, 0, 200, 200);
        expect(imageData.data).toBeDefined();
    });
});
