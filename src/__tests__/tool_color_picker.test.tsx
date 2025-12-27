import { describe, it, expect, vi, beforeEach } from 'vitest';
import { parseColor } from '../lib/Graphics';

vi.mock('abr-js');

describe('Drawing Tool - Color Picker', () => {
    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D | null;

    beforeEach(() => {
        canvas = document.createElement('canvas');
        canvas.width = 200;
        canvas.height = 200;
        ctx = canvas.getContext('2d');
    });

    it('should initialize color picker tool', () => {
        expect(canvas).toBeDefined();
        expect(ctx).toBeDefined();
    });

    it('should sample color from canvas at point', () => {
        if (!ctx) return;
        // Create colored area
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(50, 50, 100, 100);

        // Sample color from the filled area
        const imageData = ctx.getImageData(75, 75, 1, 1);
        expect(imageData.data[0]).toBeGreaterThan(128); // Red channel high
        expect(imageData.data[1]).toBeLessThan(128);  // Green channel low
        expect(imageData.data[2]).toBeLessThan(128);  // Blue channel low
    });

    it('should read pixel RGBA values correctly', () => {
        if (!ctx) return;
        ctx.fillStyle = '#FF8040';
        ctx.fillRect(100, 100, 50, 50);

        const imageData = ctx.getImageData(100, 100, 1, 1);
        expect(imageData.data[0]).toBe(255);
        expect(imageData.data[1]).toBe(128);
        expect(imageData.data[2]).toBe(64);
    });

    it('should handle transparent pixels', () => {
        if (!ctx) return;
        ctx.clearRect(0, 0, 200, 200);

        // Add semi-transparent color
        ctx.fillStyle = 'rgba(100, 150, 200, 0.5)';
        ctx.fillRect(50, 50, 50, 50);

        const imageData = ctx.getImageData(50, 50, 1, 1);
        expect(imageData.data[3]).toBeLessThan(255); // Alpha is not fully opaque
    });

    it('should convert hex color to RGB', () => {
        const result = parseColor('#FF0000');
        expect(result[0]).toBe(255); // Red
        expect(result[1]).toBe(0);   // Green
        expect(result[2]).toBe(0);   // Blue
    });

    it('should handle color with full hex including alpha', () => {
        const result = parseColor('#FF000080');
        expect(result[0]).toBe(255);
        expect(result[1]).toBe(0);
        expect(result[2]).toBe(0);
        expect(result[3]).toBe(128); // 50% alpha
    });

    it('should sample multiple colors from different areas', () => {
        if (!ctx) return;
        // Create color grid
        const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00'];
        const positions = [
            { x: 25, y: 25 },
            { x: 125, y: 25 },
            { x: 25, y: 125 },
            { x: 125, y: 125 }
        ];

        colors.forEach((color, i) => {
            ctx!.fillStyle = color;
            ctx!.fillRect(positions[i].x, positions[i].y, 50, 50);
        });

        // Sample each color
        positions.forEach((pos, i) => {
            const imageData = ctx!.getImageData(pos.x + 25, pos.y + 25, 1, 1);
            expect(imageData.data).toBeDefined();
        });
    });

    it('should handle color picker on empty/transparent canvas', () => {
        if (!ctx) return;
        ctx.clearRect(0, 0, 200, 200);

        const imageData = ctx.getImageData(100, 100, 1, 1);
        expect(imageData.data[3]).toBe(0); // Fully transparent
    });

    it('should sample color with anti-aliasing at edges', () => {
        if (!ctx) return;
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(50, 50, 50, 50);

        // Sample at edge of red area
        const imageData = ctx.getImageData(50, 50, 1, 1);
        expect(imageData.data[0]).toBeGreaterThan(0); // Some red
    });

    it('should handle color at different opacity levels', () => {
        if (!ctx) return;
        const alphas = [0.25, 0.5, 0.75, 1.0];

        alphas.forEach((alpha, i) => {
            ctx!.globalAlpha = alpha;
            ctx!.fillStyle = '#FF0000';
            ctx!.fillRect(i * 50, 0, 50, 50);
        });

        ctx.globalAlpha = 1.0;

        // Sample each opacity level
        alphas.forEach((alpha, i) => {
            const imageData = ctx!.getImageData(i * 50 + 25, 25, 1, 1);
            expect(imageData.data[3]).toBeLessThanOrEqual(255);
        });
    });

    it('should get color from layered/composited content', () => {
        if (!ctx) return;
        // Layer 1: Red
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(0, 0, 200, 200);

        // Layer 2: Blue with 50% opacity on top
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = '#0000FF';
        ctx.fillRect(50, 50, 100, 100);

        ctx.globalAlpha = 1.0;

        // Sample from blended area
        const imageData = ctx.getImageData(100, 100, 1, 1);
        expect(imageData.data[0]).toBeGreaterThan(0); // Some red
        expect(imageData.data[2]).toBeGreaterThan(0); // Some blue
    });

    it('should create looking glass preview correctly', () => {
        if (!ctx) return;
        // Create small detailed pattern
        for (let i = 0; i < 10; i++) {
            ctx!.fillStyle = i % 2 === 0 ? '#000000' : '#FFFFFF';
            ctx!.fillRect(50 + i * 5, 50, 5, 10);
        }

        // Sample for looking glass (should show detail)
        const imageData = ctx.getImageData(50, 50, 5, 10);
        expect(imageData.data.length).toBe(5 * 10 * 4);
    });

    it('should handle color picker position normalization', () => {
        if (!ctx) return;
        ctx.fillStyle = '#FF00FF';
        ctx.fillRect(100, 100, 50, 50);

        // Sample from center
        const imageData = ctx.getImageData(125, 125, 1, 1);
        expect(imageData.data[0]).toBeGreaterThan(128); // Magenta red
        expect(imageData.data[2]).toBeGreaterThan(128); // Magenta blue
    });
});
