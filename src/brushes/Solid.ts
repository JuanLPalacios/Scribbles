import Brush from '../abstracts/Brush';
import { DrawableState } from '../types/DrawableState';
import { Point } from '../types/Point';

type SerializedSolidBrush ={
    scribbleBrushType: 2,
    name:string
}

export default class Solid extends Brush {
    name = 'Solid';
    startStroke(drawable:DrawableState, point:Point, color:string, alpha:number, width:number) {
        const { ctx } = drawable;
        if (!ctx) return;
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = alpha;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.beginPath();
        ctx.moveTo(...point);
    }

    drawStroke(drawable:DrawableState, point:Point, color:string, alpha:number, width:number) {
        const { ctx, canvas } = drawable;
        if (!ctx) return;
        ctx.lineTo(...point);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.stroke();
    }

    endStroke(drawable:DrawableState, point:Point, color:string, alpha:number, width:number) {
        const { ctx, } = drawable;
        ctx?.restore();
    }

    toObj(): SerializedSolidBrush {
        const { name } = this;
        return { scribbleBrushType: 2, name };
    }

    loadObj({ name }:SerializedSolidBrush) {
        this.name = name;
    }

    static formObj(data:SerializedSolidBrush):Solid {
        return new Solid();
    }
}
