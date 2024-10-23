import { useMemo } from 'react';
import { BrushRenderer, BrushRendererContext, NonRenderBrushFunctions } from '../contexts/BrushRendererContext';
import { createDrawable } from '../generators/createDrawable';
import { difference, dotProduct2D, length, createBezier, bezierArcLength, Point } from '../lib/Vectors2d';
import { DrawableState } from '../types/DrawableState';

export function AbstractSmoothSpacing<S extends NonRenderBrushFunctions<{ spacing: number; name: string; scribbleBrushType: number; }>>({ brush, children, renderer: { drawBezier, drawLine, setup } }: S) {
    const buffer = createDrawable({ size: [1, 1], options: { willReadFrequently: true } });
    useMemo(()=>console.log(buffer), [buffer]);
    const r = useMemo<BrushRenderer>(() => {
        let lastPoint: Point = [0, 0];
        let lastVector: Point = [0, 0];
        let lastSegments: Point[] = [];
        let finished = false;
        let offset = 0;
        let currentLength = 0;
        let lastStrokeLength = 0;
        let { spacing } = brush;
        let previewData:ImageData;

        const startStroke = (drawable: DrawableState, point: Point, color: string, alpha: number, width: number) => {
            const { ctx, canvas } = drawable;
            const { ctx: bufferCtx, canvas: bufferCanvas } = buffer;
            bufferCanvas.width = canvas.width;
            bufferCanvas.height = canvas.height;
            ctx.globalCompositeOperation = 'source-over';
            bufferCtx.globalCompositeOperation = 'source-over';
            finished = true;
            offset = 0;
            currentLength = 0;
            lastStrokeLength = 0;
            lastPoint = point;
            lastVector = [0, 0];
            lastSegments = [point];
            setup(drawable, buffer, buffer, point, color, alpha, width);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(bufferCanvas, 0, 0);
            previewData = bufferCtx.getImageData(0, 0, canvas.width, canvas.height);
        };

        const drawStroke = (drawable: DrawableState, point: Point, _color: string, _alpha: number, width: number) => {
            const { ctx, canvas } = drawable;
            const { ctx: bufferCtx, canvas: bufferCanvas } = buffer;
            const v2 = difference(point, lastPoint);
            finished = false;
            const dotProduct = dotProduct2D(v2, lastVector);
            const strokeLength = length(v2);
            if (dotProduct < -(((strokeLength==0)||(spacing==0))?0:(strokeLength+lastStrokeLength)/(spacing))) {
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
            if ((currentLength < spacing)) {
                //preview
                if (lastSegments.length > 2) {
                    const bezier = createBezier(lastSegments);
                    currentLength = bezierArcLength(bezier);
                    lastVector = difference(bezier[3], bezier[2]);
                    drawBezier(bufferCtx, bezier, width, offset, true);
                }
                else {
                    lastVector = v2;
                    const [p1, p2] = lastSegments;
                    drawLine(bufferCtx, [p1, p2], width, offset, true);
                }
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(bufferCanvas, 0, 0);
                bufferCtx.putImageData(previewData, 0, 0);
                finished = true;
                lastPoint = point;
                return;
            }
            currentLength = currentLength % spacing;
            if (lastSegments.length > 2) {
                const bezier = createBezier(lastSegments);
                lastVector = difference(bezier[3], bezier[2]);
                lastStrokeLength = length(lastVector);
                drawBezier(bufferCtx, bezier, width, offset);
                offset = (spacing==0)?0:(offset+bezierArcLength(bezier)) % spacing;
            }
            else {
                lastVector = v2;
                lastStrokeLength = strokeLength;
                const [p1, p2] = lastSegments;
                drawLine(bufferCtx, [p1, p2], width, offset);
                offset = (spacing==0)?0:(offset+strokeLength) % spacing;
            }
            finished = true;
            lastPoint = point;
            lastSegments = [point];
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(bufferCanvas, 0, 0);
            previewData = bufferCtx.getImageData(0, 0, canvas.width, canvas.height);
        };

        const endStroke = (drawable: DrawableState, point: Point, color: string, alpha: number, width: number) => {
            if (!finished) {
                const temp = spacing;
                spacing = 0;
                drawStroke(drawable, point, color, alpha, width);
                spacing = temp;
            }
            // FIXME: draw tip shape to create the illusion of the more complex brush
        };
        return { drawStroke, endStroke, startStroke };
    }, [brush, buffer, drawBezier, drawLine, setup]);
    return <BrushRendererContext.Provider value={r}>
        {children}
    </BrushRendererContext.Provider>;
}

