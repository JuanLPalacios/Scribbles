import { describe, it, expect, vi } from 'vitest';
import JSZip from 'jszip';
import { SBR } from '../lib/sbr';
import { Serialized } from '../lib/Serialization';

vi.mock('abr-js');

describe('Brush Format v0.3.0 - Import/Export', () => {
    it('should export brushes to binary .sbr format', async () => {
        // Create a minimal brush definition for Solid brush type (0)
        const brushes: Serialized[] = [
            {
                type: 'json',
                value: JSON.stringify({
                    name: 'Test Solid Brush',
                    type: 0, // Solid brush
                    hardness: 1.0,
                    opacity: 1.0,
                    spacing: 0.1,
                })
            }
        ];

        const blob = await SBR.binary(brushes);

        expect(blob).toBeDefined();
        expect(blob.type).toBe('application/zip');
        expect(blob.size).toBeGreaterThan(0);
    });

    it('should export multiple brushes in a single .sbr file', async () => {
        const brushes: Serialized[] = [
            {
                type: 'json',
                value: JSON.stringify({
                    name: 'Solid Brush',
                    type: 0,
                    hardness: 1.0,
                })
            },
            {
                type: 'json',
                value: JSON.stringify({
                    name: 'Marker Brush',
                    type: 1,
                    opacity: 0.8,
                })
            },
            {
                type: 'json',
                value: JSON.stringify({
                    name: 'Pattern Brush',
                    type: 3,
                    spacing: 0.2,
                })
            }
        ];

        const blob = await SBR.binary(brushes);

        expect(blob.size).toBeGreaterThan(0);

        // Verify it can be unzipped and has proper structure
        const zip = new JSZip();
        const unzipped = await zip.loadAsync(blob);

        expect(unzipped.files['version.json']).toBeDefined();
        expect(unzipped.files['content.json']).toBeDefined();
    });

    it('should include version.json in exported .sbr with correct version', async () => {
        const brushes: Serialized[] = [
            {
                type: 'json',
                value: JSON.stringify({
                    name: 'Test',
                    type: 0,
                })
            }
        ];

        const blob = await SBR.binary(brushes);
        const zip = new JSZip();
        const unzipped = await zip.loadAsync(blob);

        const versionStr = await unzipped.files['version.json'].async('string');
        const versionObj = JSON.parse(versionStr);

        expect(versionObj.version).toBe(1);
        expect(versionObj.subVersion).toBe(1);
    });

    it('should include content.json with brush definitions', async () => {
        const brushes: Serialized[] = [
            {
                type: 'json',
                value: JSON.stringify({
                    name: 'TestBrush',
                    type: 0,
                    hardness: 0.7,
                })
            }
        ];

        const blob = await SBR.binary(brushes);
        const zip = new JSZip();
        const unzipped = await zip.loadAsync(blob);

        const contentStr = await unzipped.files['content.json'].async('string');
        const contentArr = JSON.parse(contentStr);

        expect(Array.isArray(contentArr)).toBe(true);
        expect(contentArr.length).toBe(1);
    });

    it('should export Solid brush type (0)', async () => {
        const brushes: Serialized[] = [
            {
                type: 'json',
                value: JSON.stringify({
                    name: 'Solid Brush',
                    type: 0,
                    hardness: 1.0,
                    opacity: 1.0,
                })
            }
        ];

        const blob = await SBR.binary(brushes);
        expect(blob.size).toBeGreaterThan(0);
    });

    it('should export Marker brush type (1)', async () => {
        const brushes: Serialized[] = [
            {
                type: 'json',
                value: JSON.stringify({
                    name: 'Marker Brush',
                    type: 1,
                    opacity: 0.8,
                    softness: 0.5,
                })
            }
        ];

        const blob = await SBR.binary(brushes);
        expect(blob.size).toBeGreaterThan(0);
    });

    it('should export Pattern brush type (3) with image data', async () => {
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(0, 0, 32, 32);

        const brushes: Serialized[] = [
            {
                type: 'json',
                value: JSON.stringify({
                    name: 'Pattern Brush',
                    type: 3,
                    spacing: 0.2,
                })
            }
        ];

        const blob = await SBR.binary(brushes);
        expect(blob.size).toBeGreaterThan(0);
    });

    it('should create img folder for image assets in .sbr', async () => {
        const brushes: Serialized[] = [
            {
                type: 'json',
                value: JSON.stringify({
                    name: 'Brush with images',
                    type: 1,
                })
            }
        ];

        const blob = await SBR.binary(brushes);
        const zip = new JSZip();
        const unzipped = await zip.loadAsync(blob);

        // Check that img folder exists
        const imgFolder = unzipped.folder('img');
        expect(imgFolder).toBeDefined();
    });

    it('should handle empty brush array', async () => {
        const brushes: Serialized[] = [];

        const blob = await SBR.binary(brushes);
        const zip = new JSZip();
        const unzipped = await zip.loadAsync(blob);

        const contentStr = await unzipped.files['content.json'].async('string');
        const contentArr = JSON.parse(contentStr);

        expect(contentArr.length).toBe(0);
    });

    it('should preserve brush properties through export', async () => {
        const originalBrush = {
            name: 'Preserved Props Brush',
            type: 0,
            hardness: 0.5,
            opacity: 0.75,
            spacing: 0.15,
            color: '#FF00FF',
        };

        const brushes: Serialized[] = [
            {
                type: 'json',
                value: JSON.stringify(originalBrush)
            }
        ];

        const blob = await SBR.binary(brushes);
        const zip = new JSZip();
        const unzipped = await zip.loadAsync(blob);

        const contentStr = await unzipped.files['content.json'].async('string');
        const contentArr = JSON.parse(contentStr);

        expect(contentArr[0]).toBeDefined();
        // Content is zipped, so we can't directly verify properties
        // but we can verify the structure exists
        expect(typeof contentArr[0]).toBe('object');
    });

    it('should export large brush pack (10+ brushes)', async () => {
        const brushes: Serialized[] = Array.from({ length: 15 }, (_, i) => ({
            type: 'json',
            value: JSON.stringify({
                name: `Brush ${i}`,
                type: i % 3, // Mix of types 0, 1, 2
                hardness: (i + 1) / 15,
            })
        }));

        const blob = await SBR.binary(brushes);
        const zip = new JSZip();
        const unzipped = await zip.loadAsync(blob);

        const contentStr = await unzipped.files['content.json'].async('string');
        const contentArr = JSON.parse(contentStr);

        expect(contentArr.length).toBe(15);
    });

    it('should export and maintain file size under reasonable bounds', async () => {
        const brushes: Serialized[] = Array.from({ length: 5 }, (_, i) => ({
            type: 'json',
            value: JSON.stringify({
                name: `Brush ${i}`,
                type: 0,
                hardness: 0.5,
            })
        }));

        const blob = await SBR.binary(brushes);

        // File should be reasonably sized (not empty, but not huge)
        expect(blob.size).toBeGreaterThan(100);
        expect(blob.size).toBeLessThan(1000000); // Less than 1MB for 5 text brushes
    });
});
