import { DrawableState } from '../types/DrawableState';
import { Point } from '../types/Point';

export default abstract class Brush {
    name = '';
    renderPreview(drawable:DrawableState, points:Point[], color:string, alpha:number, width:number) {
        const { canvas, ctx } = drawable;
        if(!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        points.forEach((point, i) => {
            if (i === 0) this.startStroke(drawable, point, color, alpha, width);
            else this.drawStroke(drawable, point, color, alpha, width);
        });
        this.endStroke(drawable, points[points.length-1], color, alpha, width);
    }
    abstract startStroke(drawable:DrawableState, point:Point, color:string, alpha:number, width:number):void
    abstract drawStroke(drawable:DrawableState, point:Point, color:string, alpha:number, width:number):void
    abstract endStroke(drawable:DrawableState, point:Point, color:string, alpha:number, width:number):void
    abstract loadObj(obj:object):void
    toJSON():string{
        return JSON.stringify(this.toObj());
    }
    abstract toObj():any
    static formJson(json:string):Brush {
        return this.formObj(JSON.parse(json));
    }
    static formObj(obj:object):Brush {
        throw new Error('not implemented');
    }
}