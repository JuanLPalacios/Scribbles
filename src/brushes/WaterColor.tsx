import { useMemo } from 'react';
import { BrushFunctions, Renderer } from '../contexts/BrushRendererContext';
import { createDrawable } from '../generators/createDrawable';
import { Point, distance2d } from '../lib/Vectors2d';
import { BrushList } from '../lib/BrushList';
import { AbstractSmoothSpacing } from '../abstracts/AbstractSmoothSpacing';

export type SerializedWaterColorBrush = {
    scribbleBrushType: BrushList.WaterColor,
    name: string
    spacing: number
    layers: number
    bleedRadius: number
    variance: number
}

// Gaussian random using Box-Muller transform
function gaussianRandom(mean = 0, variance = 1): number {
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return z0 * variance + mean;
}

// Deform polygon edges with recursive midpoint displacement
function deformPolygon(points: Point[], variance: number, depth = 2): Point[] {
    if (depth <= 0) return points;

    const newPoints: Point[] = [];
    for (let i = 0; i < points.length; i++) {
        const [x1, y1] = points[i];
        const [x2, y2] = points[(i + 1) % points.length];

        newPoints.push([x1, y1]);

        // Midpoint with Gaussian displacement
        const mx = (x1 + x2) / 2 + gaussianRandom(0, variance);
        const my = (y1 + y2) / 2 + gaussianRandom(0, variance);
        newPoints.push([mx, my]);
    }

    return deformPolygon(newPoints, variance * 0.6, depth - 1);
}

// Create base circle polygon
function createCirclePolygon(cx: number, cy: number, radius: number, segments = 12): Point[] {
    const points: Point[] = [];
    for (let i = 0; i < segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        points.push([
            cx + Math.cos(angle) * radius,
            cy + Math.sin(angle) * radius
        ]);
    }
    return points;
}

export const WaterColor = (({ brush, children }: BrushFunctions<SerializedWaterColorBrush>) => {
    const layerBuffers = useMemo(() =>
        Array.from({ length: brush.layers || 50 }, () =>
            createDrawable({ size: [1, 1], options: { willReadFrequently: true } })
        ), [brush.layers]
    );

    const textureBuffer = createDrawable({ size: [1, 1] });

    const r = useMemo<Renderer>(() => {
        let currentLayerIndex = 0;

        // Generate texture mask with random circles for pigment variation
        function generateTextureMask(ctx: CanvasRenderingContext2D, width: number, height: number, density = 50) {
            ctx.clearRect(0, 0, width, height);
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, width, height);

            ctx.globalCompositeOperation = 'destination-out';
            for (let i = 0; i < density; i++) {
                const x = Math.random() * width;
                const y = Math.random() * height;
                const radius = Math.random() * 3 + 1;
                const opacity = Math.random() * 0.3;

                ctx.globalAlpha = opacity;
                ctx.beginPath();
                ctx.arc(x, y, radius, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalCompositeOperation = 'source-over';
            ctx.globalAlpha = 1;
        }

        // Draw deformed polygon with recursive edge displacement
        function drawDeformedStroke(ctx: CanvasRenderingContext2D, center: Point, radius: number, color: string, alpha: number, variance: number) {
            const [cx, cy] = center;
            const basePolygon = createCirclePolygon(cx, cy, radius, 16);
            const deformed = deformPolygon(basePolygon, variance, 2);

            ctx.fillStyle = color;
            ctx.globalAlpha = alpha;
            ctx.beginPath();
            ctx.moveTo(...deformed[0]);
            for (let i = 1; i < deformed.length; i++) {
                ctx.lineTo(...deformed[i]);
            }
            ctx.closePath();
            ctx.fill();
        }

        return {
            drawLine(bufferCtx, line, width, _offset, preview) {
                if (preview) {
                    const [, point] = line;
                    drawDeformedStroke(bufferCtx, point, width / 2, bufferCtx.strokeStyle as string, 0.15, brush.variance || 2);
                    return;
                }

                const [p1, p2] = line;
                const dist = distance2d(p1, p2);
                const steps = Math.max(Math.ceil(dist / 5), 1);

                for (let step = 0; step <= steps; step++) {
                    const t = step / steps;
                    const x = p1[0] + (p2[0] - p1[0]) * t;
                    const y = p1[1] + (p2[1] - p1[1]) * t;

                    // Stack multiple layers for bleed effect
                    const layersPerPoint = Math.min(3, brush.layers);
                    for (let layer = 0; layer < layersPerPoint; layer++) {
                        const layerBuffer = layerBuffers[(currentLayerIndex + layer) % layerBuffers.length];
                        const variance = (brush.variance || 2) * (1 + layer * 0.3);
                        const radiusVariation = 1 + gaussianRandom(0, 0.1);
                        const layerRadius = (width / 2) * radiusVariation * (1 + layer * 0.2);

                        if (!layerBuffer.ctx) continue;
                        drawDeformedStroke(layerBuffer.ctx, [x, y], layerRadius, layerBuffer.ctx.fillStyle as string, 0.08, variance);
                    }
                }

                currentLayerIndex = (currentLayerIndex + 3) % layerBuffers.length;

                // Composite all layers back to main buffer
                layerBuffers.forEach(layerBuffer => {
                    if (layerBuffer.ctx) {
                        bufferCtx.drawImage(layerBuffer.canvas, 0, 0);
                    }
                });
            },

            drawBezier(bufferCtx, bezier, width, _offset, preview) {
                if (preview) {
                    const [, , , point] = bezier;
                    drawDeformedStroke(bufferCtx, point, width / 2, bufferCtx.strokeStyle as string, 0.15, brush.variance || 2);
                    return;
                }

                const [[p0x, p0y], [p1x, p1y], [p2x, p2y], [p3x, p3y]] = bezier;
                const steps = 20;

                for (let step = 0; step <= steps; step++) {
                    const t = step / steps;
                    const t2 = t * t;
                    const t3 = t2 * t;
                    const mt = 1 - t;
                    const mt2 = mt * mt;
                    const mt3 = mt2 * mt;

                    const x = mt3 * p0x + 3 * mt2 * t * p1x + 3 * mt * t2 * p2x + t3 * p3x;
                    const y = mt3 * p0y + 3 * mt2 * t * p1y + 3 * mt * t2 * p2y + t3 * p3y;

                    // Stack multiple layers with variance inheritance
                    const layersPerPoint = Math.min(3, brush.layers);
                    for (let layer = 0; layer < layersPerPoint; layer++) {
                        const layerBuffer = layerBuffers[(currentLayerIndex + layer) % layerBuffers.length];
                        const variance = (brush.variance || 2) * (1 + layer * 0.3);
                        const radiusVariation = 1 + gaussianRandom(0, 0.1);
                        const layerRadius = (width / 2) * radiusVariation * (1 + layer * 0.2);

                        if (!layerBuffer.ctx) continue;
                        drawDeformedStroke(layerBuffer.ctx, [x, y], layerRadius, layerBuffer.ctx.fillStyle as string, 0.08, variance);
                    }
                }

                currentLayerIndex = (currentLayerIndex + 3) % layerBuffers.length;

                // Composite all layers back to main buffer
                layerBuffers.forEach(layerBuffer => {
                    if (layerBuffer.ctx) {
                        bufferCtx.drawImage(layerBuffer.canvas, 0, 0);
                    }
                });
            },

            setup(drawable, buffer, previewBuffer, point, color, alpha, width) {
                const { ctx } = drawable;
                const { ctx: bufferCtx, canvas: bufferCanvas } = buffer;
                const { ctx: previewCtx } = previewBuffer;
                const { ctx: textureCtx, canvas: textureCanvas } = textureBuffer;

                // Setup all layer buffers
                layerBuffers.forEach(layerBuffer => {
                    layerBuffer.canvas.width = bufferCanvas.width;
                    layerBuffer.canvas.height = bufferCanvas.height;
                    if (!layerBuffer.ctx) return;
                    layerBuffer.ctx.clearRect(0, 0, bufferCanvas.width, bufferCanvas.height);
                    layerBuffer.ctx.fillStyle = color;
                    layerBuffer.ctx.globalCompositeOperation = 'source-over';
                });

                // Setup texture mask for pigment variation
                textureCanvas.width = bufferCanvas.width;
                textureCanvas.height = bufferCanvas.height;
                if (textureCtx) {
                    generateTextureMask(textureCtx, bufferCanvas.width, bufferCanvas.height, 100);
                }

                ctx.globalAlpha = alpha;
                ctx.globalCompositeOperation = 'source-over';
                bufferCtx.globalCompositeOperation = 'source-over';
                bufferCtx.fillStyle = color;
                bufferCtx.strokeStyle = color;
                previewCtx.fillStyle = color;
                previewCtx.strokeStyle = color;

                // Draw initial deformed stamp
                drawDeformedStroke(bufferCtx, point, width / 2, color, 0.15, brush.variance || 2);

                currentLayerIndex = 0;
            }
        };
    }, [brush.layers, brush.variance, layerBuffers, textureBuffer]);

    return <AbstractSmoothSpacing brush={brush} renderer={r}>
        {children}
    </AbstractSmoothSpacing>;
});
