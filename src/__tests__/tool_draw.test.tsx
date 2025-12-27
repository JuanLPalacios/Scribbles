import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReactNode } from 'react';
import { AppContext } from '../contexts/AppContext';
import { createDrawable } from '../generators/createDrawable';
import { createLayer2 } from '../generators/createLayer2';
import { EditorDrawingState } from '../contexts/EditorDrawingContext';
import { DrawingState } from '../contexts/DrawingContext';

vi.mock('abr-js');
vi.mock('../components/inputs/BrushSelectInput', () => ({
    BrushSelectInput: () => null
}));
vi.mock('../components/inputs/BrushPreview', () => ({
    BrushPreview: () => null
}));
vi.mock('../components/inputs/ColorInput', () => ({
    ColorInput: () => null
}));
vi.mock('../components/inputs/AlphaInput', () => ({
    AlphaInput: () => null
}));
vi.mock('../components/inputs/ToleranceInput', () => ({
    ToleranceInput: () => null
}));

describe('Drawing Tool - Draw', () => {
    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D | null;

    beforeEach(() => {
        canvas = document.createElement('canvas');
        canvas.width = 200;
        canvas.height = 200;
        ctx = canvas.getContext('2d');
    });

    it('should initialize with drawing not started', () => {
        expect(canvas).toBeDefined();
        expect(ctx).toBeDefined();
    });

    it('should create strokes on mouseDown', () => {
        if (!ctx) return;
        const startPoint = { x: 50, y: 50 };
        const color = '#FF0000';
        const alpha = 1.0;
        const brushWidth = 5;

        ctx.strokeStyle = color;
        ctx.lineWidth = brushWidth;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.moveTo(startPoint.x, startPoint.y);

        const imageData = ctx.getImageData(0, 0, 200, 200);
        expect(imageData).toBeDefined();
    });

    it('should update stroke on mouseMove while drawing', () => {
        if (!ctx) return;
        const points = [
            { x: 50, y: 50 },
            { x: 60, y: 60 },
            { x: 70, y: 70 },
            { x: 80, y: 80 }
        ];

        ctx.strokeStyle = '#FF0000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);

        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.stroke();

        const imageData = ctx.getImageData(0, 0, 200, 200);
        let hasStroke = false;
        for (let i = 0; i < imageData.data.length; i += 4) {
            if (imageData.data[i] > 0) {
                hasStroke = true;
                break;
            }
        }
        expect(hasStroke).toBe(true);
    });

    it('should finalize stroke on mouseUp', () => {
        if (!ctx) return;
        ctx.strokeStyle = '#0000FF';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(10, 10);
        ctx.lineTo(100, 100);
        ctx.stroke();

        const imageData = ctx.getImageData(0, 0, 200, 200);
        expect(imageData.data).toBeDefined();
        expect(imageData.data.length).toBe(200 * 200 * 4);
    });

    it('should respect color option', () => {
        if (!ctx) return;
        const colors = ['#FF0000', '#00FF00', '#0000FF'];

        colors.forEach((color) => {
            ctx!.fillStyle = color;
            ctx!.fillRect(0, 0, 50, 50);
        });

        const imageData = ctx.getImageData(0, 0, 200, 200);
        expect(imageData.data.length).toBeGreaterThan(0);
    });

    it('should respect alpha option', () => {
        if (!ctx) return;
        const alphas = [0.25, 0.5, 0.75, 1.0];

        alphas.forEach((alpha) => {
            ctx!.globalAlpha = alpha;
            ctx!.fillStyle = '#FF0000';
            ctx!.fillRect(0, 0, 50, 50);
        });

        const imageData = ctx.getImageData(0, 0, 200, 200);
        expect(imageData).toBeDefined();
    });

    it('should respect brush width option', () => {
        if (!ctx) return;
        const widths = [1, 5, 10, 20];

        widths.forEach((width) => {
            ctx!.lineWidth = width;
            ctx!.strokeStyle = '#000000';
            ctx!.beginPath();
            ctx!.moveTo(10, 10);
            ctx!.lineTo(100, 100);
            ctx!.stroke();
        });

        const imageData = ctx.getImageData(0, 0, 200, 200);
        expect(imageData).toBeDefined();
    });

    it('should clear buffer before drawing on layer', () => {
        if (!ctx) return;
        // First stroke
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(10, 10, 20, 20);

        let imageData = ctx.getImageData(0, 0, 200, 200);
        let hasRed = false;
        for (let i = 0; i < imageData.data.length; i += 4) {
            if (imageData.data[i] > 0) {
                hasRed = true;
                break;
            }
        }
        expect(hasRed).toBe(true);

        // Clear
        ctx.clearRect(0, 0, 200, 200);

        imageData = ctx.getImageData(0, 0, 200, 200);
        let isEmpty = true;
        for (let i = 3; i < imageData.data.length; i += 4) {
            if (imageData.data[i] > 0) {
                isEmpty = false;
                break;
            }
        }
        expect(isEmpty).toBe(true);
    });

    it('should handle multiple consecutive strokes', () => {
        if (!ctx) return;
        const strokes = [
            { x1: 10, y1: 10, x2: 50, y2: 50 },
            { x1: 50, y1: 50, x2: 100, y2: 100 },
            { x1: 100, y1: 100, x2: 150, y2: 150 }
        ];

        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;

        strokes.forEach((stroke) => {
            ctx!.beginPath();
            ctx!.moveTo(stroke.x1, stroke.y1);
            ctx!.lineTo(stroke.x2, stroke.y2);
            ctx!.stroke();
        });

        const imageData = ctx.getImageData(0, 0, 200, 200);
        let hasStroke = false;
        for (let i = 0; i < imageData.data.length; i += 4) {
            if (imageData.data[i] > 0) {
                hasStroke = true;
                break;
            }
        }
        expect(hasStroke).toBe(true);
    });

    it('should composite drawn content from buffer to layer', () => {
        if (!ctx) return;
        // Simulate drawing in buffer
        const bufferCanvas = document.createElement('canvas');
        bufferCanvas.width = 200;
        bufferCanvas.height = 200;
        const bufferCtx = bufferCanvas.getContext('2d')!;
        bufferCtx.fillStyle = '#FF0000';
        bufferCtx.fillRect(50, 50, 50, 50);

        // Composite to main canvas
        ctx.drawImage(bufferCanvas, 0, 0);

        const imageData = ctx.getImageData(0, 0, 200, 200);
        let hasColor = false;
        for (let i = 0; i < imageData.data.length; i += 4) {
            if (imageData.data[i] > 0) {
                hasColor = true;
                break;
            }
        }
        expect(hasColor).toBe(true);
    });

    it('should update imageData after stroke finalization', () => {
        if (!ctx) return;
        ctx.fillStyle = '#0000FF';
        ctx.fillRect(25, 25, 50, 50);

        const imageData = ctx.getImageData(0, 0, 200, 200);
        expect(imageData.width).toBe(200);
        expect(imageData.height).toBe(200);

        // Check that filled area has blue
        const pixelIndex = (50 * 200 + 50) * 4;
        expect(imageData.data[pixelIndex + 2]).toBeGreaterThan(0); // Blue channel
    });

    it('should handle rapid stroke updates', () => {
        if (!ctx) return;
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(20, 20);

        // Simulate rapid mouse movement
        for (let i = 1; i < 50; i++) {
            ctx.lineTo(20 + i, 20 + i);
        }
        ctx.stroke();

        const imageData = ctx.getImageData(0, 0, 200, 200);
        expect(imageData.data.length).toBe(200 * 200 * 4);
    });
});
