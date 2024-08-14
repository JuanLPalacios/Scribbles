import Brush from '../abstracts/Brush';
import { createDrawable } from '../generators/createDrawable';
import { createBezier, createPerpendicularVector } from '../lib/DOMMath';
import { DrawableState } from '../types/DrawableState';
import { Point } from '../types/Point';

type SerializedSolidBrush ={
    scribbleBrushType: 2,
    name:string
    angle: number,
    diameter: number,
    hardness: number,
    roundness: number,
    spacing: number
}

export default class Solid extends Brush {
    lastPoint:Point = [0, 0];
    segments:[Point, Point][] = [];
    lastSegments:Point[] = [];
    finished = false;
    buffer:DrawableState = createDrawable({ size: [1, 1] });
    previewBuffer:DrawableState = createDrawable({ size: [1, 1] });
    currentLength = 0;
    name = 'Solid';
    angle = 0;
    strokeAngle = [0, -1];
    diameter = 1;
    hardness = 1;
    roundness = 1;
    spacing = 15;
    startStroke(drawable:DrawableState, point:Point, color:string, alpha:number, width:number) {
        const { ctx, canvas } = drawable;
        const { ctx: bufferCtx, canvas: buffer } = this.buffer;
        const { ctx: previewCtx, canvas: preview } = this.previewBuffer;
        this.finished = true;
        this.currentLength = 0;
        buffer.width = canvas.width;
        buffer.height = canvas.height;
        preview.width = canvas.width;
        preview.height = canvas.height;
        if (!ctx || !bufferCtx || !previewCtx) return;
        bufferCtx.lineCap = 'round';
        bufferCtx.lineJoin = 'round';
        bufferCtx.strokeStyle = color;
        bufferCtx.fillStyle = color;
        bufferCtx.lineWidth = width*this.roundness;
        previewCtx.lineCap = 'round';
        previewCtx.lineJoin = 'round';
        previewCtx.strokeStyle = color;
        previewCtx.fillStyle = color;
        previewCtx.lineWidth = width*this.roundness;
        ctx.globalCompositeOperation = 'source-over';
        bufferCtx.globalCompositeOperation = 'source-over';
        previewCtx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = alpha;
        this.lastPoint = point;
        this.lastSegments = [point];
        bufferCtx.filter = `blur(${~~(width*(1-this.hardness)/2)}px)`;
        bufferCtx.beginPath();
        bufferCtx.moveTo(...point);
        bufferCtx.lineTo(...point);
        previewCtx.filter = `blur(${~~(width*(1-this.hardness)/2)}px)`;
        previewCtx.beginPath();
        previewCtx.moveTo(...point);
        previewCtx.lineTo(...point);
        // FIXME: draw tip shape to create the illusion of the more complex brush
        bufferCtx.stroke();
        previewCtx.stroke();
        ctx.drawImage(buffer, 0, 0);
    }

    drawStroke(drawable:DrawableState, point:Point, color:string, alpha:number, width:number) {
        const { ctx, canvas } = drawable;
        const { ctx: bufferCtx, canvas: buffer } = this.buffer;
        const { ctx: previewCtx, canvas: preview } = this.previewBuffer;
        const v2 = [point[0]-this.lastPoint[0],  point[1]-this.lastPoint[1]];
        const v1 = this.strokeAngle;
        this.finished = false;
        this.lastSegments.push(point);
        if (!ctx || !bufferCtx || !previewCtx) return;
        this.currentLength += Math.abs(Math.sqrt((point[0]-this.lastPoint[0])**2+(point[1]-this.lastPoint[1])**2));
        if (this.currentLength<this.spacing) {
            previewCtx.clearRect(0, 0, canvas.width, canvas.height);
            previewCtx.drawImage(buffer, 0, 0);
            this.drawSegment(previewCtx, width, v1, v2, point);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(preview, 0, 0);
            return;
        }
        this.currentLength = 0;
        this.drawSegment(bufferCtx, width, v1, v2, point);
        this.finished = true;
        this.lastPoint = point;
        this.lastSegments = [point];
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(buffer, 0, 0);
    }

    private drawSegment(bufferCtx: CanvasRenderingContext2D, width: number, v1: number[], v2: number[], point: Point) {
        bufferCtx.beginPath();
        bufferCtx.moveTo(...this.lastPoint);
        const previousWidth = bufferCtx.lineWidth;
        bufferCtx.lineWidth = width * (1 - (1 - this.roundness) * (Math.abs(v1[0] * v2[1] - v1[1] * v2[0])) / (Math.sqrt((v2[0] ** 2) + (v2[1] ** 2))));
        bufferCtx.filter = `blur(${~~(width * (1 - this.hardness) / 2)}px)`;
        if (this.lastSegments.length > 2) {
            this.drawBezier(previousWidth, bufferCtx);
        }
        else {
            this.drawLine(bufferCtx, point);
        }
    }

    private drawLine(bufferCtx: CanvasRenderingContext2D, point: Point) {
        bufferCtx.lineTo(...point);
        bufferCtx.stroke();
    }

    private drawBezier(previousWidth: number, bufferCtx: CanvasRenderingContext2D) {
        const [[p0x, p0y], [p1x, p1y], [p2x, p2y], [x, y]] = createBezier(this.lastSegments);
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
    }

    endStroke(drawable:DrawableState, point:Point, color:string, alpha:number, width:number) {
        const { ctx, } = drawable;
        if(!this.finished) {
            const temp = this.spacing;
            this.spacing = 0;
            this.drawStroke(drawable, point, color, alpha, width);
            this.spacing = temp;
        }
        // FIXME: draw tip shape to create the illusion of the more complex brush
        ctx?.restore();
    }

    toObj(): SerializedSolidBrush {
        const { name, angle, diameter, hardness, roundness, spacing } = this;
        return { scribbleBrushType: 2,
            name,
            angle,
            diameter,
            hardness,
            roundness,
            spacing
        };
    }

    loadObj({ name, angle, diameter, hardness, roundness, spacing }:SerializedSolidBrush) {
        this.name = name;
        this.angle = angle;
        this.strokeAngle = [Math.sin(angle*Math.PI/180), -Math.cos(angle*Math.PI/180)];
        this.diameter = diameter;
        this.hardness = hardness;
        this.roundness = roundness;
        this.spacing = spacing;
    }

    static formObj(data:SerializedSolidBrush):Solid {
        return new Solid();
    }
}
