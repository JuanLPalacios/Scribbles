import { useMemo } from 'react';
import { createDrawable } from '../generators/createDrawable';
import { Bezier, bezierArcLength, createBezier, createPerpendicularVector, length } from '../lib/Vectors2d';
import { DrawableState } from '../types/DrawableState';
import { Point } from '../types/Point';
import { BrushRenderer, BrushRendererContext } from '../contexts/BrushRendererContext';
import { BrushFunctions } from '../contexts/BrushRendererContext';
import { BrushList } from '../lib/BrushList';
import { dotProduct2D, vectorProjection, difference } from '../lib/Vectors2d';

export type SerializedSolidBrush = {
    scribbleBrushType: BrushList.Solid,
    name:string
    angle: number,
    diameter: number,
    hardness: number,
    roundness: number,
    spacing: number
}

export const SolidC = (({ brush, children }:BrushFunctions<SerializedSolidBrush>)=>{
    const buffer = createDrawable({ size: [1, 1] });
    const previewBuffer:DrawableState = createDrawable({ size: [1, 1] });
    const strokeAngle = useMemo<Point >(()=>[Math.sin(brush.angle*Math.PI/180), -Math.cos(brush.angle*Math.PI/180)], [brush.angle]);
    const r = useMemo<BrushRenderer>(() => {
        let lastPoint:Point =  [0, 0];
        let lastVector:Point =  [0, 0];
        let lastSegments:Point[] =  [];
        let finished = false;
        let idealSpacing = 0;
        let currentLength = 0;
        const drawLine = (bufferCtx: CanvasRenderingContext2D, width: number, v1: Point, v2: Point, point: Point)=>{
            bufferCtx.beginPath();
            bufferCtx.moveTo(...lastPoint);
            bufferCtx.lineWidth = width * (1 - (1 - brush.roundness) * vectorProjection(v1, v2));
            bufferCtx.filter = `blur(${~~(width * (1 - brush.hardness) / 2)}px)`;
            bufferCtx.lineTo(...point);
            bufferCtx.stroke();
        };

        const drawBezier = ([[p0x, p0y], [p1x, p1y], [p2x, p2y], [x, y]]:Bezier, bufferCtx: CanvasRenderingContext2D, width: number, v1: Point, v2: Point)=>{
            bufferCtx.beginPath();
            bufferCtx.moveTo(...lastPoint);
            const previousWidth = bufferCtx.lineWidth;
            bufferCtx.lineWidth = width * (1 - (1 - brush.roundness) * vectorProjection(v1, v2));
            bufferCtx.filter = `blur(${~~(width * (1 - brush.hardness) / 2)}px)`;
            const [w0x, w0y] = createPerpendicularVector([p1x - p0x, p1y - p0y], previousWidth / 2);
            const [w1x, w1y] = createPerpendicularVector([p2x - x, p2y - y], bufferCtx.lineWidth / 2);
            bufferCtx.moveTo(p0x + w0x, p0y + w0y);
            bufferCtx.bezierCurveTo(p1x + w0x, p1y + w0y, p2x - w1x, p2y - w1y, x - w1x, y - w1y);
            bufferCtx.lineTo(x + w1x, y + w1y);
            bufferCtx.bezierCurveTo(p2x + w1x, p2y + w1y, p1x - w0x, p1y - w0y, p0x - w0x, p0y - w0y);
            bufferCtx.fill();
            bufferCtx.beginPath();
            bufferCtx.arc(p0x, p0y, previousWidth / 2, 0, 2 * Math.PI);
            bufferCtx.fill();
            bufferCtx.beginPath();
            bufferCtx.arc(x, y, bufferCtx.lineWidth / 2, 0, 2 * Math.PI);
            bufferCtx.fill();
        };
        const startStroke = (drawable:DrawableState, point:Point, color:string, alpha:number, width:number)=>{
            const { ctx, canvas } = drawable;
            const { ctx: bufferCtx, canvas: bufferCanvas } = buffer;
            const { ctx: previewCtx, canvas: previewCanvas } = previewBuffer;
            finished = true;
            currentLength = 0;
            idealSpacing = brush.spacing*(1 + width) / (1 + width*brush.roundness);
            bufferCanvas.width = canvas.width;
            bufferCanvas.height = canvas.height;
            previewCanvas.width = canvas.width;
            previewCanvas.height = canvas.height;
            bufferCtx.lineCap = 'round';
            bufferCtx.lineJoin = 'round';
            bufferCtx.strokeStyle = color;
            bufferCtx.fillStyle = color;
            bufferCtx.lineWidth = width*brush.roundness;
            previewCtx.lineCap = 'round';
            previewCtx.lineJoin = 'round';
            previewCtx.strokeStyle = color;
            previewCtx.fillStyle = color;
            previewCtx.lineWidth = width*brush.roundness;
            ctx.globalCompositeOperation = 'source-over';
            bufferCtx.globalCompositeOperation = 'source-over';
            previewCtx.globalCompositeOperation = 'source-over';
            ctx.globalAlpha = alpha;
            lastPoint = point;
            lastVector = [0, 0];
            lastSegments = [point];
            bufferCtx.filter = `blur(${~~(width*(1-brush.hardness)/2)}px)`;
            bufferCtx.beginPath();
            bufferCtx.moveTo(...point);
            bufferCtx.lineTo(...point);
            previewCtx.filter = `blur(${~~(width*(1-brush.hardness)/2)}px)`;
            previewCtx.beginPath();
            previewCtx.moveTo(...point);
            previewCtx.lineTo(...point);
            // FIXME: draw tip shape to create the illusion of the more complex brush
            bufferCtx.stroke();
            previewCtx.stroke();
            ctx.drawImage(bufferCanvas, 0, 0);
        };

        const drawStroke = (drawable:DrawableState, point:Point, _color:string, _alpha:number, width:number)=>{
            const { ctx, canvas } = drawable;
            const { ctx: bufferCtx, canvas: bufferCanvas } = buffer;
            const { ctx: previewCtx, canvas: previewCanvas } = previewBuffer;
            const v2 = difference(point, lastPoint);
            const v1 = strokeAngle;
            finished = false;
            lastSegments.push(point);
            const dotProduct = dotProduct2D(v2, lastVector);
            lastVector = v2;
            const strokeLength = length(v2);
            currentLength += strokeLength;
            if ((dotProduct>=0)||(currentLength<idealSpacing)) {
                previewCtx.clearRect(0, 0, canvas.width, canvas.height);
                previewCtx.drawImage(bufferCanvas, 0, 0);
                if (lastSegments.length > 2) {
                    const bezier = createBezier(lastSegments);
                    currentLength = bezierArcLength(bezier);
                    drawBezier(bezier, previewCtx, width, v1, v2);
                }
                else {
                    drawLine(previewCtx, width, v1, v2, point);
                }
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(previewCanvas, 0, 0);
                return;
            }
            currentLength = currentLength%brush.spacing;
            if (lastSegments.length > 2) {
                const bezier = createBezier(lastSegments);
                drawBezier(bezier, bufferCtx, width, v1, v2);
            }
            else {
                drawLine(bufferCtx, width, v1, v2, point);
            }
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(previewCanvas, 0, 0);
            finished = true;
            lastPoint = point;
            lastSegments = [point];
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(bufferCanvas, 0, 0);
        };

        const endStroke = (drawable:DrawableState, point:Point, color:string, alpha:number, width:number)=>{
            const { ctx, } = drawable;
            if(!finished) {
                const temp = brush.spacing;
                brush.spacing = 0;
                drawStroke(drawable, point, color, alpha, width);
                brush.spacing = temp;
            }
            // FIXME: draw tip shape to create the illusion of the more complex brush
            ctx?.restore();
        };
        return { drawStroke, endStroke, startStroke };
    }, [brush, buffer, previewBuffer, strokeAngle]);
    return <BrushRendererContext.Provider value={r}>
        {children}
    </BrushRendererContext.Provider>;
});

