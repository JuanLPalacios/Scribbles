import { useMemo } from 'react';
import { BrushRenderer, BrushRendererContext, NonRenderBrushFunctions } from '../contexts/BrushRendererContext';
import { createDrawable } from '../generators/createDrawable';
import { difference, dotProduct2D, length, createBezier, bezierArcLength, Point } from '../lib/Vectors2d';
import { DrawableState } from '../types/DrawableState';

export function AbstractSmoothSpacing<S extends NonRenderBrushFunctions<{ spacing: number; name: string; scribbleBrushType: number; }>>({ brush, children, renderer: { drawBezier, drawLine, setup } }: S) {
    const buffer = createDrawable({ size: [1, 1] });
    const previewBuffer: DrawableState = createDrawable({ size: [1, 1] });
    const r = useMemo<BrushRenderer>(() => {
        let lastPoint: Point = [0, 0];
        let lastVector: Point = [0, 0];
        let lastSegments: Point[] = [];
        let finished = false;
        let offset = 0;
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
            offset = 0;
            currentLength = 0;
            lastStrokeLength = 0;
            lastPoint = point;
            lastVector = [0, 0];
            lastSegments = [point];
            setup(drawable, buffer, previewBuffer, point, color, alpha, width);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(bufferCanvas, 0, 0);
        };

        const drawStroke = (drawable: DrawableState, point: Point, _color: string, _alpha: number, width: number) => {
            const { ctx, canvas } = drawable;
            const { ctx: bufferCtx, canvas: bufferCanvas } = buffer;
            const { ctx: previewCtx, canvas: previewCanvas } = previewBuffer;
            const v2 = difference(point, lastPoint);
            finished = false;
            const dotProduct = dotProduct2D(v2, lastVector);
            const strokeLength = length(v2);
            if (dotProduct < -(((strokeLength==0)||(brush.spacing==0))?0:(strokeLength+lastStrokeLength)/(brush.spacing))) {
                if (lastSegments.length > 2) {
                    const bezier = createBezier(lastSegments);
                    lastVector = difference(bezier[3], bezier[2]);
                    lastStrokeLength = length(lastVector);
                    drawBezier(bufferCtx, bezier, width, offset);
                }
                else if (lastSegments.length > 1){
                    lastStrokeLength = strokeLength;
                    const [p1, p2] = lastSegments;
                    drawLine(bufferCtx, [p1, p2], width, offset);
                }
                finished = true;
                lastSegments = [lastPoint];
                currentLength = 0;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(bufferCanvas, 0, 0);
            }
            currentLength += strokeLength;
            lastSegments.push(point);
            if ((currentLength < brush.spacing)) {
                previewCtx.clearRect(0, 0, canvas.width, canvas.height);
                previewCtx.drawImage(bufferCanvas, 0, 0);
                if (lastSegments.length > 2) {
                    const bezier = createBezier(lastSegments);
                    currentLength = bezierArcLength(bezier);
                    lastVector = difference(bezier[3], bezier[2]);
                    drawBezier(previewCtx, bezier, width, offset, true);
                }
                else {
                    lastVector = v2;
                    const [p1, p2] = lastSegments;
                    drawLine(previewCtx, [p1, p2], width, offset, true);
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
                drawBezier(bufferCtx, bezier, width, offset);
                offset = (offset+bezierArcLength(bezier)) % brush.spacing;
            }
            else {
                lastVector = v2;
                lastStrokeLength = strokeLength;
                const [p1, p2] = lastSegments;
                drawLine(bufferCtx, [p1, p2], width, offset);
                offset = (offset+strokeLength) % brush.spacing;
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

