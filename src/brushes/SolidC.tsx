import { useMemo } from 'react';
import { createDrawable } from '../generators/createDrawable';
import { createBezier, createPerpendicularVector } from '../lib/DOMMath';
import { DrawableState } from '../types/DrawableState';
import { Point } from '../types/Point';
import { SerializedSolidBrush } from './Solid';
import { BrushRendererContext } from '../contexts/BrushRendererContext';
import { BrushFunctions } from '../contexts/BrushRendererContext';

export const SolidC = (({ brush: that, children }:BrushFunctions<SerializedSolidBrush>)=>{
    console.log('SolidC');
    let lastPoint:Point =  [0, 0];
    let lastSegments:Point[] =  [];
    let finished = false;
    const buffer = createDrawable({ size: [1, 1] });
    const previewBuffer:DrawableState = createDrawable({ size: [1, 1] });
    let currentLength = 0;
    const strokeAngle = useMemo<Point >(()=>[Math.sin(that.angle*Math.PI/180), -Math.cos(that.angle*Math.PI/180)], [that.angle]);
    const drawSegment = (bufferCtx: CanvasRenderingContext2D, width: number, v1: number[], v2: number[], point: Point)=>{
        bufferCtx.beginPath();
        bufferCtx.moveTo(...lastPoint);
        const previousWidth = bufferCtx.lineWidth;
        bufferCtx.lineWidth = width * (1 - (1 - that.roundness) * (Math.abs(v1[0] * v2[1] - v1[1] * v2[0])) / (Math.sqrt((v2[0] ** 2) + (v2[1] ** 2))));
        bufferCtx.filter = `blur(${~~(width * (1 - that.hardness) / 2)}px)`;
        if (lastSegments.length > 2) {
            drawBezier(previousWidth, bufferCtx);
        }
        else {
            drawLine(bufferCtx, point);
        }
    };

    const drawLine = (bufferCtx: CanvasRenderingContext2D, point: Point)=>{
        bufferCtx.lineTo(...point);
        bufferCtx.stroke();
    };

    const drawBezier = (previousWidth: number, bufferCtx: CanvasRenderingContext2D)=>{
        const [[p0x, p0y], [p1x, p1y], [p2x, p2y], [x, y]] = createBezier(lastSegments);
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
        bufferCanvas.width = canvas.width;
        bufferCanvas.height = canvas.height;
        previewCanvas.width = canvas.width;
        previewCanvas.height = canvas.height;
        if (!ctx || !bufferCtx || !previewCtx) return;
        bufferCtx.lineCap = 'round';
        bufferCtx.lineJoin = 'round';
        bufferCtx.strokeStyle = color;
        bufferCtx.fillStyle = color;
        bufferCtx.lineWidth = width*that.roundness;
        previewCtx.lineCap = 'round';
        previewCtx.lineJoin = 'round';
        previewCtx.strokeStyle = color;
        previewCtx.fillStyle = color;
        previewCtx.lineWidth = width*that.roundness;
        ctx.globalCompositeOperation = 'source-over';
        bufferCtx.globalCompositeOperation = 'source-over';
        previewCtx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = alpha;
        lastPoint = point;
        lastSegments = [point];
        bufferCtx.filter = `blur(${~~(width*(1-that.hardness)/2)}px)`;
        bufferCtx.beginPath();
        bufferCtx.moveTo(...point);
        bufferCtx.lineTo(...point);
        previewCtx.filter = `blur(${~~(width*(1-that.hardness)/2)}px)`;
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
        const v2 = [point[0]-lastPoint[0],  point[1]-lastPoint[1]];
        const v1 = strokeAngle;
        finished = false;
        lastSegments.push(point);
        if (!ctx || !bufferCtx || !previewCtx) return;
        currentLength = currentLength + Math.abs(Math.sqrt((point[0]-lastPoint[0])**2+(point[1]-lastPoint[1])**2));
        if (currentLength<that.spacing) {
            previewCtx.clearRect(0, 0, canvas.width, canvas.height);
            previewCtx.drawImage(bufferCanvas, 0, 0);
            drawSegment(previewCtx, width, v1, v2, point);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(previewCanvas, 0, 0);
            return;
        }
        currentLength = 0;
        drawSegment(bufferCtx, width, v1, v2, point);
        finished = true;
        lastPoint = point;
        lastSegments = [point];
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(bufferCanvas, 0, 0);
    };

    const endStroke = (drawable:DrawableState, point:Point, color:string, alpha:number, width:number)=>{
        const { ctx, } = drawable;
        if(!finished) {
            const temp = that.spacing;
            that.spacing = 0;
            drawStroke(drawable, point, color, alpha, width);
            that.spacing = temp;
        }
        // FIXME: draw tip shape to create the illusion of the more complex brush
        ctx?.restore();
    };
    return <BrushRendererContext.Provider value={{ drawStroke, endStroke, startStroke }}>
        {children}
    </BrushRendererContext.Provider>;
});

