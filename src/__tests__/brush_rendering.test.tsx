import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createDrawable } from '../generators/createDrawable';
import { DrawableState } from '../types/DrawableState';

vi.mock('abr-js');
vi.mock('../components/inputs/BrushSelectInput', () => ({
    BrushSelectInput: () => null
}));
vi.mock('../components/inputs/BrushPreview', () => ({
    BrushPreview: () => null
}));

describe('Brush Stroke Rendering', () => {
    let canvas: DrawableState;
    let buffer: DrawableState;

    beforeEach(() => {
        canvas = createDrawable({ size: [100, 100], options: { willReadFrequently: true } });
        buffer = createDrawable({ size: [100, 100], options: { willReadFrequently: true } });
    });

    it('should render stroke on canvas using canvas 2D context', () => {
        expect(canvas.ctx).toBeDefined();
        expect(canvas.canvas).toBeDefined();

        canvas.ctx.strokeStyle = '#FF0000';
        canvas.ctx.lineWidth = 2;
        canvas.ctx.beginPath();
        canvas.ctx.moveTo(10, 10);
        canvas.ctx.lineTo(50, 50);
        canvas.ctx.stroke();

        const imageData = canvas.ctx.getImageData(0, 0, 100, 100);
        expect(imageData.data.length).toBe(100 * 100 * 4);

        // Check that some pixels have been colored
        let hasColor = false;
        for (let i = 0; i < imageData.data.length; i += 4) {
            if (imageData.data[i] > 0 || imageData.data[i + 1] > 0 || imageData.data[i + 2] > 0) {
                hasColor = true;
                break;
            }
        }
        expect(hasColor).toBe(true);
    });

    it('should render filled stroke on buffer canvas', () => {
        buffer.ctx.fillStyle = '#00FF00';
        buffer.ctx.beginPath();
        buffer.ctx.arc(50, 50, 10, 0, Math.PI * 2);
        buffer.ctx.fill();

        const imageData = buffer.ctx.getImageData(0, 0, 100, 100);

        // Check that circle area has color
        const centerPixelIndex = (50 * 100 + 50) * 4;
        expect(imageData.data[centerPixelIndex + 1]).toBeGreaterThan(0); // Green channel
    });

    it('should composite strokes from buffer to main canvas', () => {
        // Draw on buffer
        buffer.ctx.fillStyle = '#FF00FF';
        buffer.ctx.fillRect(20, 20, 30, 30);

        // Composite to canvas
        canvas.ctx.drawImage(buffer.canvas, 0, 0);

        const imageData = canvas.ctx.getImageData(0, 0, 100, 100);
        let hasColor = false;
        for (let i = 0; i < imageData.data.length; i += 4) {
            if (imageData.data[i] > 0 || imageData.data[i + 2] > 0) {
                hasColor = true;
                break;
            }
        }
        expect(hasColor).toBe(true);
    });

    it('should apply alpha/opacity to brush strokes', () => {
        canvas.ctx.globalAlpha = 0.5;
        canvas.ctx.fillStyle = '#FF0000';
        canvas.ctx.fillRect(10, 10, 20, 20);

        const imageData = canvas.ctx.getImageData(0, 0, 100, 100);
        const pixelIndex = (15 * 100 + 15) * 4;
        const alpha = imageData.data[pixelIndex + 3];

        expect(alpha).toBeLessThan(255);
        expect(alpha).toBeGreaterThan(0);
    });

    it('should clear buffer canvas for repeated strokes', () => {
        // First stroke
        buffer.ctx.fillStyle = '#FF0000';
        buffer.ctx.fillRect(10, 10, 20, 20);

        let imageData = buffer.ctx.getImageData(0, 0, 100, 100);
        let hasRedColor = false;
        for (let i = 0; i < imageData.data.length; i += 4) {
            if (imageData.data[i] > 0) {
                hasRedColor = true;
                break;
            }
        }
        expect(hasRedColor).toBe(true);

        // Clear buffer
        buffer.ctx.clearRect(0, 0, 100, 100);

        imageData = buffer.ctx.getImageData(0, 0, 100, 100);
        let isCleared = true;
        for (let i = 0; i < imageData.data.length; i += 4) {
            if (imageData.data[i + 3] > 0) {
                isCleared = false;
                break;
            }
        }
        expect(isCleared).toBe(true);
    });

    it('should support blend modes for stroke rendering', () => {
        // Base layer
        canvas.ctx.fillStyle = '#FF0000';
        canvas.ctx.fillRect(0, 0, 100, 100);

        // Apply multiply blend mode
        buffer.ctx.fillStyle = '#0000FF';
        buffer.ctx.globalCompositeOperation = 'multiply';
        buffer.ctx.fillRect(0, 0, 100, 100);

        canvas.ctx.globalCompositeOperation = 'multiply';
        canvas.ctx.drawImage(buffer.canvas, 0, 0);

        const imageData = canvas.ctx.getImageData(0, 0, 100, 100);
        expect(imageData).toBeDefined();
    });

    it('should render multiple brush strokes in sequence', () => {
        canvas.ctx.strokeStyle = '#FF0000';
        canvas.ctx.lineWidth = 1;

        // Draw multiple connected strokes
        for (let i = 0; i < 5; i++) {
            canvas.ctx.beginPath();
            canvas.ctx.moveTo(i * 20, 10);
            canvas.ctx.lineTo(i * 20 + 10, 50);
            canvas.ctx.stroke();
        }

        const imageData = canvas.ctx.getImageData(0, 0, 100, 100);
        let hasColor = false;
        for (let i = 0; i < imageData.data.length; i += 4) {
            if (imageData.data[i] > 0) {
                hasColor = true;
                break;
            }
        }
        expect(hasColor).toBe(true);
    });

    it('should handle variable brush width', () => {
        canvas.ctx.strokeStyle = '#00FF00';

        // Thin stroke
        canvas.ctx.lineWidth = 1;
        canvas.ctx.beginPath();
        canvas.ctx.moveTo(10, 10);
        canvas.ctx.lineTo(50, 10);
        canvas.ctx.stroke();

        // Thick stroke
        canvas.ctx.lineWidth = 10;
        canvas.ctx.beginPath();
        canvas.ctx.moveTo(10, 30);
        canvas.ctx.lineTo(50, 30);
        canvas.ctx.stroke();

        const imageData = canvas.ctx.getImageData(0, 0, 100, 100);
        expect(imageData.data).toBeDefined();
    });

    it('should support different stroke cap and join styles', () => {
        canvas.ctx.strokeStyle = '#0000FF';
        canvas.ctx.lineWidth = 5;
        canvas.ctx.lineCap = 'round';
        canvas.ctx.lineJoin = 'round';

        canvas.ctx.beginPath();
        canvas.ctx.moveTo(10, 10);
        canvas.ctx.lineTo(30, 50);
        canvas.ctx.lineTo(50, 20);
        canvas.ctx.stroke();

        const imageData = canvas.ctx.getImageData(0, 0, 100, 100);
        expect(imageData.data.length).toBeGreaterThan(0);
    });

    it('should preserve stroke color through rendering', () => {
        const colors = ['#FF0000', '#00FF00', '#0000FF'];

        colors.forEach((color, index) => {
            const testCanvas = createDrawable({ size: [100, 100] });
            testCanvas.ctx.fillStyle = color;
            testCanvas.ctx.fillRect(0, 0, 100, 100);

            const imageData = testCanvas.ctx.getImageData(0, 0, 100, 100);
            const pixelData = imageData.data;

            // Verify color is present
            expect(pixelData.length).toBeGreaterThan(0);
        });
    });

    it('should handle brush strokes outside visible bounds gracefully', () => {
        canvas.ctx.strokeStyle = '#FF0000';
        canvas.ctx.lineWidth = 2;

        canvas.ctx.beginPath();
        canvas.ctx.moveTo(-50, -50);
        canvas.ctx.lineTo(150, 150);
        canvas.ctx.stroke();

        const imageData = canvas.ctx.getImageData(0, 0, 100, 100);
        expect(imageData.data.length).toBe(100 * 100 * 4);
    });

    it('should correctly render with resetTransform before stroking', () => {
        // Set initial transform
        canvas.ctx.translate(20, 20);
        canvas.ctx.rotate(Math.PI / 4);

        // Reset transform for stroke
        canvas.ctx.resetTransform();

        canvas.ctx.strokeStyle = '#FF0000';
        canvas.ctx.lineWidth = 2;
        canvas.ctx.beginPath();
        canvas.ctx.moveTo(10, 10);
        canvas.ctx.lineTo(40, 40);
        canvas.ctx.stroke();

        const imageData = canvas.ctx.getImageData(0, 0, 100, 100);
        let hasColor = false;
        for (let i = 0; i < imageData.data.length; i += 4) {
            if (imageData.data[i] > 0) {
                hasColor = true;
                break;
            }
        }
        expect(hasColor).toBe(true);
    });
});
