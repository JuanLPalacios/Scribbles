import Brush from '../abstracts/Brush';
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
    lastPoint:Point = [0, 0]
    segments:[Point, Point][] = []
    name = 'Solid';
    angle = 1;
    diameter = 1;
    hardness = 1;
    roundness = 1;
    spacing = 1;
    startStroke(drawable:DrawableState, point:Point, color:string, alpha:number, width:number) {
        const { ctx } = drawable;
        if (!ctx) return;
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = alpha;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        this.lastPoint = point;
        ctx.beginPath();
        ctx.moveTo(...point);
    }

    drawStroke(drawable:DrawableState, point:Point, color:string, alpha:number, width:number) {
        const { ctx } = drawable;
        if (!ctx) return;
        ctx.beginPath();
        ctx.moveTo(...this.lastPoint);
        ctx.lineTo(...point);
        ctx.stroke();
        //ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    endStroke(drawable:DrawableState, point:Point, color:string, alpha:number, width:number) {
        const { ctx, } = drawable;
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
        this.diameter = diameter;
        this.hardness = hardness;
        this.roundness = roundness;
        this.spacing = spacing;
    }

    static formObj(data:SerializedSolidBrush):Solid {
        return new Solid();
    }
}
