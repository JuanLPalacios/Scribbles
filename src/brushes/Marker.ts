import Brush from '../abstracts/Brush';
import { LayerState } from '../types/LayerState';
import { Point } from '../types/Point';

export default class Marker extends Brush {
    lastPoint: Point = [0,0];
    down = false;
    
    startStroke(layer:LayerState, point:Point, color:string, width:number) {
        this.down = true;
        this.lastPoint = point;
    }
  
    drawStroke(layer:LayerState, point:Point, color:string, width:number) {
        const ctx = layer.canvas?.ctx;
        if (!ctx) return;
        if (!this.down) return;
        ctx.beginPath();
        ctx.moveTo(...this.lastPoint);
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineTo(...point);
        ctx.stroke();
        this.lastPoint = point;
        console.log(point);
    }
  
    endStroke(layer:LayerState, point:Point, color:string, width:number) {
        this.down = false;
        if (!layer.thumbnail?.canvas) return;
        if (!layer.canvas?.canvas) return;
        layer.thumbnail.ctx?.drawImage(layer.canvas.canvas, 0, 0, layer.thumbnail.canvas.width, layer.thumbnail.canvas.height);
    }
}
  