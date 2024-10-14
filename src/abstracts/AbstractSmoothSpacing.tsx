import { useMemo } from 'react';
import { BrushRenderer, BrushRendererContext, NonRenderBrushFunctions } from '../contexts/BrushRendererContext';
import { createDrawable } from '../generators/createDrawable';
import { difference, dotProduct2D, length, createBezier, bezierArcLength } from '../lib/Vectors2d';
import { DrawableState } from '../types/DrawableState';
import { Point } from '../types/Point';

export function AbstractSmoothSpacing<S extends NonRenderBrushFunctions<{ spacing: number; name: string; scribbleBrushType: number; }>>({ brush, children, renderer: { drawBezier, drawLine, setup } }: S) {
    const buffer = createDrawable({ size: [1, 1] });
    const previewBuffer: DrawableState = createDrawable({ size: [1, 1] });
    const r = useMemo<BrushRenderer>(() => {
        let lastPoint: Point = [0, 0];
        let lastVector: Point = [0, 0];
        let lastSegments: Point[] = [];
        let lastVectors: Point[] = [];
        let finished = false;
        let currentLength = 0;
        let lastStrokeLength = 0;

        const startStroke = (drawable: DrawableState, point: Point, color: string, alpha: number, width: number) => {
            const { ctx, canvas } = drawable;
            const { ctx: bufferCtx, canvas: bufferCanvas } = buffer;
            const { ctx: previewCtx, canvas: previewCanvas } = previewBuffer;
            bufferCanvas.width = canvas.width;
            bufferCanvas.height = canvas.height;
            previewCanvas.width = canvas.width;
            previewCanvas.height = canvas.height;
            ctx.globalCompositeOperation = 'source-over';
            bufferCtx.globalCompositeOperation = 'source-over';
            previewCtx.globalCompositeOperation = 'source-over';
            finished = true;
            currentLength = 0;
            lastStrokeLength = 0;
            lastPoint = point;
            lastVector = [0, 0];
            lastSegments = [point];
            lastVectors = [lastVector];
            setup(drawable, buffer, previewBuffer, point, color, alpha, width);
        };

        const drawStroke = (drawable: DrawableState, point: Point, _color: string, _alpha: number, width: number) => {
            const { ctx, canvas } = drawable;
            const { ctx: bufferCtx, canvas: bufferCanvas } = buffer;
            const { ctx: previewCtx, canvas: previewCanvas } = previewBuffer;
            const v2 = difference(point, lastPoint);
            finished = false;
            const dotProduct = dotProduct2D(v2, lastVector);
            const lastVector2 = lastVector;
            const strokeLength = length(v2);
            currentLength += strokeLength;
            if (dotProduct < -(((strokeLength==0)||(brush.spacing==0))?0:(strokeLength+lastStrokeLength)/(brush.spacing))) {
                currentLength = currentLength % brush.spacing;
                if (lastSegments.length > 2) {
                    const bezier = createBezier(lastSegments);
                    lastVector = difference(bezier[3], bezier[2]);
                    lastStrokeLength = length(lastVector);
                    drawBezier(bezier, bufferCtx, width, lastVector);
                }
                else {
                    lastStrokeLength = strokeLength;
                    drawLine(bufferCtx, width, lastVector, lastPoint);
                }
                finished = true;
                lastSegments = [lastPoint];
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(bufferCanvas, 0, 0);
            }
            lastSegments.push(point);
            if ((currentLength < brush.spacing)) {
                previewCtx.clearRect(0, 0, canvas.width, canvas.height);
                previewCtx.drawImage(bufferCanvas, 0, 0);
                if (lastSegments.length > 2) {
                    const bezier = createBezier(lastSegments);
                    currentLength = bezierArcLength(bezier);
                    lastVector = difference(bezier[3], bezier[2]);
                    drawBezier(bezier, previewCtx, width, lastVector, true);
                }
                else {
                    console.log(v2, lastVector2, dotProduct);
                    lastVector = v2;
                    drawLine(previewCtx, width, lastVector, point, true);
                }
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(previewCanvas, 0, 0);
                finished = true;
                lastPoint = point;
                return;
            }
            currentLength = currentLength % brush.spacing;
            if (lastSegments.length > 2) {
                const bezier = createBezier(lastSegments);
                lastVector = difference(bezier[3], bezier[2]);
                lastStrokeLength = length(lastVector);
                drawBezier(bezier, bufferCtx, width, lastVector);
            }
            else {
                lastVector = v2;
                lastStrokeLength = strokeLength;
                drawLine(bufferCtx, width, lastVector, point);
            }
            finished = true;
            lastPoint = point;
            lastSegments = [point];
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(bufferCanvas, 0, 0);
        };

        const endStroke = (drawable: DrawableState, point: Point, color: string, alpha: number, width: number) => {
            const { ctx, } = drawable;
            if (!finished) {
                const temp = brush.spacing;
                brush.spacing = 0;
                drawStroke(drawable, point, color, alpha, width);
                brush.spacing = temp;
            }
            // FIXME: draw tip shape to create the illusion of the more complex brush
            ctx?.restore();
        };
        return { drawStroke, endStroke, startStroke };
    }, [brush, buffer, drawBezier, drawLine, previewBuffer, setup]);
    return <BrushRendererContext.Provider value={r}>
        {children}
    </BrushRendererContext.Provider>;
}

