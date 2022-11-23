import Brush from '../abstracts/Brush';
import { createDrawable } from '../hooks/createDrawable';
import { DrawableState } from '../types/DrawableState';
import { Point } from '../types/Point';

export default class Marker extends Brush {
    lastPoint: Point = [0,0];
    
    startStroke(drawable:DrawableState, point:Point, color:string, width:number) {
        this.lastPoint = point;
        const {ctx} = drawable;
        if (!ctx) return;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
    }
  
    drawStroke(drawable:DrawableState, point:Point, color:string, width:number) {
        const ctx = drawable.ctx;
        if (!ctx) return;
        if (!ctx) return;
        ctx.beginPath();
        ctx.moveTo(...this.lastPoint);
        ctx.lineTo(...point);
        ctx.stroke();
        this.lastPoint = point;
    }
  
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    endStroke(drawable:DrawableState, point:Point, color:string, width:number) {}
}
  