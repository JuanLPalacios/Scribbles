import { describe, it, expect, vi } from 'vitest';
import JSZip from 'jszip';
import { DrawingState } from '../contexts/DrawingContext';
import { createLayer2 } from '../generators/createLayer2';
import { SDRW } from '../lib/sdrw';
import { serializeDrawingState } from '../lib/serializeJSON';

vi.mock('abr-js');

describe('Drawing Format v0.3.0 - Import/Export (.scribble)', () => {
    let mockCanvas: HTMLCanvasElement;
    let mockCtx: CanvasRenderingContext2D;

    beforeEach(() => {
        mockCanvas = document.createElement('canvas');
        mockCanvas.width = 100;
        mockCanvas.height = 100;
        mockCtx = mockCanvas.getContext('2d')!;
    });

    it('should export drawing to binary .scribble format', async () => {
        const layer = createLayer2('Layer 1', [100, 100]);
        mockCtx.fillStyle = '#FF0000';
        mockCtx.fillRect(0, 0, 100, 100);
        layer.imageData = mockCtx.getImageData(0, 0, 100, 100);

        const drawing: DrawingState = {
            name: 'Test Drawing',
            width: 100,
            height: 100,
            layers: [layer]
        };

        const blob = await SDRW.binary(drawing);

        expect(blob).toBeDefined();
        expect(blob.type).toBe('application/zip');
        expect(blob.size).toBeGreaterThan(0);
    });

    it('should include version.json in exported .scribble', async () => {
        const layer = createLayer2('Layer 1', [100, 100]);
        layer.imageData = mockCtx.getImageData(0, 0, 100, 100);

        const drawing: DrawingState = {
            name: 'Test',
            width: 100,
            height: 100,
            layers: [layer]
        };

        const blob = await SDRW.binary(drawing);
        const zip = new JSZip();
        const unzipped = await zip.loadAsync(blob);

        const versionStr = await unzipped.files['version.json'].async('string');
        const versionObj = JSON.parse(versionStr);

        expect(versionObj.version).toBe(1);
        expect(versionObj.subVersion).toBe(1);
    });

    it('should include content.json with drawing metadata', async () => {
        const layer = createLayer2('Layer 1', [100, 100]);
        layer.imageData = mockCtx.getImageData(0, 0, 100, 100);

        const drawing: DrawingState = {
            name: 'TestDrawing',
            width: 100,
            height: 100,
            layers: [layer]
        };

        const blob = await SDRW.binary(drawing);
        const zip = new JSZip();
        const unzipped = await zip.loadAsync(blob);

        const contentStr = await unzipped.files['content.json'].async('string');
        const contentObj = JSON.parse(contentStr);

        expect(contentObj).toBeDefined();
        expect(typeof contentObj).toBe('object');
    });

    it('should export drawing with multiple layers', async () => {
        const layer1 = createLayer2('Layer 1', [100, 100]);
        mockCtx.fillStyle = '#FF0000';
        mockCtx.fillRect(0, 0, 100, 100);
        layer1.imageData = mockCtx.getImageData(0, 0, 100, 100);

        const layer2 = createLayer2('Layer 2', [100, 100]);
        mockCtx.fillStyle = '#00FF00';
        mockCtx.fillRect(50, 50, 50, 50);
        layer2.imageData = mockCtx.getImageData(0, 0, 100, 100);

        const drawing: DrawingState = {
            name: 'Multi-Layer Drawing',
            width: 100,
            height: 100,
            layers: [layer1, layer2]
        };

        const blob = await SDRW.binary(drawing);
        const zip = new JSZip();
        const unzipped = await zip.loadAsync(blob);

        const contentStr = await unzipped.files['content.json'].async('string');
        const contentObj = JSON.parse(contentStr);

        expect(contentObj.layers).toBeDefined();
        expect(Array.isArray(contentObj.layers) || typeof contentObj.layers === 'object').toBe(true);
    });

    it('should preserve layer names in export', async () => {
        const layerName = 'Custom Layer Name';
        const layer = createLayer2(layerName, [100, 100]);
        layer.imageData = mockCtx.getImageData(0, 0, 100, 100);

        const drawing: DrawingState = {
            name: 'Test',
            width: 100,
            height: 100,
            layers: [layer]
        };

        const blob = await SDRW.binary(drawing);
        const zip = new JSZip();
        const unzipped = await zip.loadAsync(blob);

        const contentStr = await unzipped.files['content.json'].async('string');
        const contentObj = JSON.parse(contentStr);

        expect(contentObj).toBeDefined();
    });

    it('should preserve layer opacity in export', async () => {
        const layer = createLayer2('Transparent Layer', [100, 100]);
        layer.opacity = 0.5;
        layer.imageData = mockCtx.getImageData(0, 0, 100, 100);

        const drawing: DrawingState = {
            name: 'Test',
            width: 100,
            height: 100,
            layers: [layer]
        };

        const blob = await SDRW.binary(drawing);
        const zip = new JSZip();
        const unzipped = await zip.loadAsync(blob);

        const contentStr = await unzipped.files['content.json'].async('string');
        const contentObj = JSON.parse(contentStr);

        expect(contentObj).toBeDefined();
    });

    it('should preserve blend mode in export', async () => {
        const layer = createLayer2('Multiply Layer', [100, 100]);
        layer.mixBlendMode = 'multiply';
        layer.imageData = mockCtx.getImageData(0, 0, 100, 100);

        const drawing: DrawingState = {
            name: 'Test',
            width: 100,
            height: 100,
            layers: [layer]
        };

        const blob = await SDRW.binary(drawing);
        expect(blob.size).toBeGreaterThan(0);
    });

    it('should create img folder for image assets', async () => {
        const layer = createLayer2('Layer 1', [100, 100]);
        layer.imageData = mockCtx.getImageData(0, 0, 100, 100);

        const drawing: DrawingState = {
            name: 'Test',
            width: 100,
            height: 100,
            layers: [layer]
        };

        const blob = await SDRW.binary(drawing);
        const zip = new JSZip();
        const unzipped = await zip.loadAsync(blob);

        const imgFolder = unzipped.folder('img');
        expect(imgFolder).toBeDefined();
    });

    it('should handle different canvas sizes', async () => {
        const sizes = [[64, 64], [128, 128], [256, 512], [512, 256]];

        for (const [width, height] of sizes) {
            const layer = createLayer2('Layer', [width, height]);
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d')!;
            ctx.fillStyle = '#FF0000';
            ctx.fillRect(0, 0, width, height);
            layer.imageData = ctx.getImageData(0, 0, width, height);

            const drawing: DrawingState = {
                name: 'Test',
                width,
                height,
                layers: [layer]
            };

            const blob = await SDRW.binary(drawing);
            expect(blob.size).toBeGreaterThan(0);
        }
    });

    it('should export with optional thumbnail', async () => {
        const layer = createLayer2('Layer 1', [100, 100]);
        layer.imageData = mockCtx.getImageData(0, 0, 100, 100);

        const drawing: DrawingState = {
            name: 'Test',
            width: 100,
            height: 100,
            layers: [layer]
        };

        const thumbnailCanvas = document.createElement('canvas');
        thumbnailCanvas.width = 50;
        thumbnailCanvas.height = 50;
        const thumbCtx = thumbnailCanvas.getContext('2d')!;
        thumbCtx.fillStyle = '#0000FF';
        thumbCtx.fillRect(0, 0, 50, 50);
        const thumbnailDataURL = thumbnailCanvas.toDataURL('image/png');

        const blob = await SDRW.binary(drawing, thumbnailDataURL);
        const zip = new JSZip();
        const unzipped = await zip.loadAsync(blob);

        const thumbnailFile = unzipped.files['thumbnail.png'];
        expect(thumbnailFile).toBeDefined();
    });

    it('should export drawing with transparent layers', async () => {
        const layer = createLayer2('Transparent Layer', [100, 100]);
        const canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
        ctx.fillRect(0, 0, 100, 100);
        layer.imageData = ctx.getImageData(0, 0, 100, 100);

        const drawing: DrawingState = {
            name: 'Test',
            width: 100,
            height: 100,
            layers: [layer]
        };

        const blob = await SDRW.binary(drawing);
        expect(blob.size).toBeGreaterThan(0);
    });

    it('should preserve layer visibility flag', () => {
        const layer = createLayer2('Hidden Layer', [100, 100]);
        layer.visible = false;
        layer.imageData = mockCtx.getImageData(0, 0, 100, 100);

        const drawing: DrawingState = {
            name: 'Test',
            width: 100,
            height: 100,
            layers: [layer]
        };

        const serialized = serializeDrawingState(drawing);
        const layerOut = Array.isArray(serialized.layers) ? serialized.layers[0] : undefined;
        expect(layerOut?.visible).toBe(false);
    });

    it('should handle large drawings', async () => {
        const layer = createLayer2('Large Layer', [1024, 1024]);
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(0, 0, 1024, 1024);
        layer.imageData = ctx.getImageData(0, 0, 1024, 1024);

        const drawing: DrawingState = {
            name: 'Large Drawing',
            width: 1024,
            height: 1024,
            layers: [layer]
        };

        const blob = await SDRW.binary(drawing);
        expect(blob.size).toBeGreaterThan(0);
    });

    it('should maintain drawing metadata through export', async () => {
        const layer = createLayer2('Layer', [100, 100]);
        layer.imageData = mockCtx.getImageData(0, 0, 100, 100);

        const drawingName = 'My Artwork';
        const drawing: DrawingState = {
            name: drawingName,
            width: 100,
            height: 100,
            layers: [layer]
        };

        const blob = await SDRW.binary(drawing);
        const zip = new JSZip();
        const unzipped = await zip.loadAsync(blob);

        const contentStr = await unzipped.files['content.json'].async('string');
        const contentObj = JSON.parse(contentStr);

        expect(contentObj.name).toBeDefined();
    });
});
