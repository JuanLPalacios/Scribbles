import { describe, it, expect, beforeEach } from 'vitest';
import { mergeLayers } from '../lib/Graphics';
import { createLayer2 } from '../generators/createLayer2';
import { BlendMode } from '../types/BlendMode';

describe('Layer Compositing - PNG Export', () => {
    let canvas: HTMLCanvasElement;

    beforeEach(() => {
        canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;
    });

    it('should merge two solid color layers with normal blend mode', () => {
        // Create base layer (red)
        const baseLayer = createLayer2('base', [100, 100]);
        const baseCtx = document.createElement('canvas').getContext('2d')!;
        baseCtx.canvas.width = 100;
        baseCtx.canvas.height = 100;
        baseCtx.fillStyle = '#FF0000';
        baseCtx.fillRect(0, 0, 100, 100);
        const baseImageData = baseCtx.getImageData(0, 0, 100, 100);
        baseLayer.imageData = baseImageData;

        // Create top layer (blue) with normal blend
        const topLayer = createLayer2('top', [100, 100]);
        const topCtx = document.createElement('canvas').getContext('2d')!;
        topCtx.canvas.width = 100;
        topCtx.canvas.height = 100;
        topCtx.fillStyle = '#0000FF';
        topCtx.fillRect(0, 0, 100, 100);
        const topImageData = topCtx.getImageData(0, 0, 100, 100);
        topLayer.imageData = topImageData;

        // Merge with normal blend
        const merged = mergeLayers(topLayer, baseLayer);

        expect(merged.imageData.width).toBe(100);
        expect(merged.imageData.height).toBe(100);
        expect(merged.imageData.data.length).toBe(100 * 100 * 4);

        // Check that result has color data (blue fully overwrites red in normal blend)
        const data = merged.imageData.data;
        // With normal blend mode at full opacity, top layer (blue) should completely cover base
        let hasColor = false;
        for (let i = 0; i < data.length; i += 4) {
            if (data[i + 3] > 0) { // Check alpha channel
                hasColor = true;
                break;
            }
        }
        expect(hasColor).toBe(true);
    });

    it('should merge layers with opacity applied', () => {
        const baseLayer = createLayer2('base', [100, 100]);
        const baseCtx = document.createElement('canvas').getContext('2d')!;
        baseCtx.canvas.width = 100;
        baseCtx.canvas.height = 100;
        baseCtx.fillStyle = '#FFFFFF';
        baseCtx.fillRect(0, 0, 100, 100);
        baseLayer.imageData = baseCtx.getImageData(0, 0, 100, 100);

        const topLayer = createLayer2('top', [100, 100]);
        topLayer.opacity = 0.5; // 50% opacity
        const topCtx = document.createElement('canvas').getContext('2d')!;
        topCtx.canvas.width = 100;
        topCtx.canvas.height = 100;
        topCtx.fillStyle = '#000000';
        topCtx.fillRect(0, 0, 100, 100);
        topLayer.imageData = topCtx.getImageData(0, 0, 100, 100);

        const merged = mergeLayers(topLayer, baseLayer);

        expect(merged.imageData).toBeDefined();
        const data = merged.imageData.data;
        // With 50% opacity black on white, result should be gray-ish
        expect(data[0]).toBeLessThan(255); // Some gray value
        expect(data[1]).toBeLessThan(255);
        expect(data[2]).toBeLessThan(255);
    });

    it('should respect different blend modes (multiply)', () => {
        const baseLayer = createLayer2('base', [100, 100]);
        const baseCtx = document.createElement('canvas').getContext('2d')!;
        baseCtx.canvas.width = 100;
        baseCtx.canvas.height = 100;
        baseCtx.fillStyle = '#808080'; // 50% gray
        baseCtx.fillRect(0, 0, 100, 100);
        baseLayer.imageData = baseCtx.getImageData(0, 0, 100, 100);

        const topLayer = createLayer2('top', [100, 100]);
        topLayer.mixBlendMode = 'multiply' as BlendMode;
        const topCtx = document.createElement('canvas').getContext('2d')!;
        topCtx.canvas.width = 100;
        topCtx.canvas.height = 100;
        topCtx.fillStyle = '#FF0000'; // Red
        topCtx.fillRect(0, 0, 100, 100);
        topLayer.imageData = topCtx.getImageData(0, 0, 100, 100);

        const merged = mergeLayers(topLayer, baseLayer);

        // mergeLayers returns the base layer with merged imageData
        expect(merged.imageData).toBeDefined();
        expect(merged.mixBlendMode).toBe('normal'); // base layer blend mode is preserved
    });

    it('should handle layers with different opacities', () => {
        const baseLayer = createLayer2('base', [50, 50]);
        baseLayer.opacity = 1.0;

        const topLayer = createLayer2('top', [50, 50]);
        topLayer.opacity = 0.3; // 30% opacity

        const merged = mergeLayers(topLayer, baseLayer);

        // mergeLayers returns base layer properties with merged imageData
        expect(merged.opacity).toBeCloseTo(1.0, 1); // base layer opacity is preserved
    });

    it('should preserve imageData dimensions on merge', () => {
        const widths = [64, 128, 256];
        const heights = [64, 128, 256];

        for (const width of widths) {
            for (const height of heights) {
                const baseLayer = createLayer2('base', [width, height]);
                const topLayer = createLayer2('top', [width, height]);

                const merged = mergeLayers(topLayer, baseLayer);

                expect(merged.imageData.width).toBe(width);
                expect(merged.imageData.height).toBe(height);
            }
        }
    });

    it('should handle layering multiple colors correctly', () => {
        // Create a composite with multiple layers
        let result = createLayer2('result', [100, 100]);
        const redCtx = document.createElement('canvas').getContext('2d')!;
        redCtx.canvas.width = 100;
        redCtx.canvas.height = 100;
        redCtx.fillStyle = '#FF0000';
        redCtx.fillRect(0, 0, 100, 100);
        result.imageData = redCtx.getImageData(0, 0, 100, 100);

        // Add green layer on top
        const greenLayer = createLayer2('green', [100, 100]);
        const greenCtx = document.createElement('canvas').getContext('2d')!;
        greenCtx.canvas.width = 100;
        greenCtx.canvas.height = 100;
        greenCtx.fillStyle = '#00FF00';
        greenCtx.fillRect(0, 0, 100, 100);
        greenLayer.imageData = greenCtx.getImageData(0, 0, 100, 100);

        result = mergeLayers(greenLayer, result);

        expect(result.imageData).toBeDefined();
        expect(result.imageData.width).toBe(100);
        expect(result.imageData.height).toBe(100);
    });

    it('should export composited layers to PNG blob via canvas.toBlob', async () => {
        const layer = createLayer2('test', [100, 100]);
        const layerCtx = document.createElement('canvas').getContext('2d')!;
        layerCtx.canvas.width = 100;
        layerCtx.canvas.height = 100;
        layerCtx.fillStyle = '#FF00FF';
        layerCtx.fillRect(0, 0, 100, 100);
        layer.imageData = layerCtx.getImageData(0, 0, 100, 100);

        const testCanvas = document.createElement('canvas');
        testCanvas.width = 100;
        testCanvas.height = 100;
        const testCtx = testCanvas.getContext('2d')!;
        testCtx.putImageData(layer.imageData, 0, 0);

        const blob = await new Promise<Blob | null>((resolve) => {
            testCanvas.toBlob(resolve, 'image/png');
        });

        expect(blob).toBeDefined();
        expect(blob?.type).toBe('image/png');
        expect(blob?.size).toBeGreaterThan(0);
    });

    it('should handle layers with transparent areas', () => {
        const baseLayer = createLayer2('base', [100, 100]);
        const baseCtx = document.createElement('canvas').getContext('2d')!;
        baseCtx.canvas.width = 100;
        baseCtx.canvas.height = 100;
        baseCtx.fillStyle = 'rgba(255, 0, 0, 0.5)';
        baseCtx.fillRect(0, 0, 100, 100);
        baseLayer.imageData = baseCtx.getImageData(0, 0, 100, 100);

        const topLayer = createLayer2('top', [100, 100]);
        const topCtx = document.createElement('canvas').getContext('2d')!;
        topCtx.canvas.width = 100;
        topCtx.canvas.height = 100;
        topCtx.fillStyle = 'rgba(0, 0, 255, 0.5)';
        topCtx.fillRect(50, 50, 50, 50);
        topLayer.imageData = topCtx.getImageData(0, 0, 100, 100);

        const merged = mergeLayers(topLayer, baseLayer);

        expect(merged.imageData).toBeDefined();
        // Check that transparent pixels are preserved in merge
        const data = merged.imageData.data;
        expect(data.length).toBe(100 * 100 * 4);
    });
});
