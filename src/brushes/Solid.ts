import Brush from '../abstracts/Brush';
import { createDrawable } from '../generators/createDrawable';
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
    name = 'Solid';
    angle = 0;
    strokeAngle = [0, -1];
    diameter = 1;
    hardness = 1;
    roundness = 1;
    spacing = 1;
    buffer:DrawableState = createDrawable({ size: [1, 1] });
    startStroke(drawable:DrawableState, point:Point, color:string, alpha:number, width:number) {
        const { ctx, canvas } = drawable;
        const { ctx: bufferCtx, canvas: buffer } = this.buffer;
        buffer.width = canvas.width;
        buffer.height = canvas.height;
        if (!ctx || !bufferCtx) return;
        bufferCtx.lineCap = 'round';
        bufferCtx.lineJoin = 'round';
        bufferCtx.strokeStyle = color;
        bufferCtx.lineWidth = width;
        if (!ctx) return;
        ctx.globalCompositeOperation = 'source-over';
        bufferCtx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = alpha;
        this.lastPoint = point;
        bufferCtx.beginPath();
        bufferCtx.moveTo(...point);
        bufferCtx.lineTo(...point);
        // FIXME: draw tip shape to create the illusion of the more complex brush
        bufferCtx.stroke();
        ctx.drawImage(buffer, 0, 0);
    }

    drawStroke(drawable:DrawableState, point:Point, color:string, alpha:number, width:number) {
        const { ctx, canvas } = drawable;
        const { ctx: bufferCtx, canvas: buffer } = this.buffer;
        const v2 = [point[0]-this.lastPoint[0],  point[1]-this.lastPoint[1]];
        const v1 = this.strokeAngle;
        if (!ctx || !bufferCtx) return;
        bufferCtx.beginPath();
        bufferCtx.moveTo(...this.lastPoint);
        bufferCtx.lineWidth = width*(1-(1-this.roundness)*(Math.abs(v1[0]*v2[1] - v1[1]*v2[0]))/(Math.sqrt((v2[0]**2)+(v2[1]**2))));
        bufferCtx.lineTo(...point);
        bufferCtx.stroke();
        this.lastPoint = point;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(buffer, 0, 0);
    }

    endStroke(drawable:DrawableState, point:Point, color:string, alpha:number, width:number) {
        const { ctx, } = drawable;
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
