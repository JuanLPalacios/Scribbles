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
        let finished = false;
        let currentLength = 0;

        const startStroke = (drawable: DrawableState, point: Point, color: string, alpha: number, width: number) => {
            finished = true;
            currentLength = 0;
            lastPoint = point;
            lastVector = [0, 0];
            lastSegments = [point];
            setup(drawable, point, color, alpha, width);
        };

        const drawStroke = (drawable: DrawableState, point: Point, _color: string, _alpha: number, width: number) => {
            const { ctx, canvas } = drawable;
            const { ctx: bufferCtx, canvas: bufferCanvas } = buffer;
            const { ctx: previewCtx, canvas: previewCanvas } = previewBuffer;
            const v2 = difference(point, lastPoint);
            finished = false;
            lastSegments.push(point);
            const dotProduct = dotProduct2D(v2, lastVector);
            lastVector = v2;
            const strokeLength = length(v2);
            currentLength += strokeLength;
            if ((dotProduct >= 0) || (currentLength < brush.spacing)) {
                previewCtx.clearRect(0, 0, canvas.width, canvas.height);
                previewCtx.drawImage(bufferCanvas, 0, 0);
                if (lastSegments.length > 2) {
                    const bezier = createBezier(lastSegments);
                    currentLength = bezierArcLength(bezier);
                    drawBezier(bezier, previewCtx, width, v2);
                }
                else {
                    drawLine(previewCtx, width, v2, point);
                }
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(previewCanvas, 0, 0);
                return;
            }
            currentLength = currentLength % brush.spacing;
            if (lastSegments.length > 2) {
                const bezier = createBezier(lastSegments);
                drawBezier(bezier, bufferCtx, width, v2);
            }
            else {
                drawLine(bufferCtx, width, v2, point);
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

