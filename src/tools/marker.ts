import Brush from "../abstracts/Brush";
import { LayerState } from "../types/LayerState";

export default class Marker extends Brush {
    lastPoint:[number, number] = [0,0];
    width = 4;
    mode = '';
    down = false;
  
    renderPreview(layer:LayerState, points:[number, number][], color:string) {
        points.forEach((point, i) => {
            if (i === 0) this.startStroke(layer, point, color);
            else this.drawStroke(layer, point, color);
          });
          this.endStroke(layer, points[points.length-1], color);
    }
    
    startStroke(layer:LayerState, point:[number, number], color:string) {
      this.down = true;
      this.lastPoint = point;
    }
  
    drawStroke(layer:LayerState, point:[number, number], color:string) {
        const ctx = layer.canvas?.ctx;
        if (!ctx) return;
        if (!this.down) return;
      ctx.beginPath();
      ctx.moveTo(...this.lastPoint);
      ctx.strokeStyle = color;
      ctx.lineWidth = this.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineTo(...point);
      ctx.stroke();
      this.lastPoint = point;
      console.log(point);
    }
  
    endStroke(layer:LayerState, point:[number, number], color:string) {
      this.down = false;
      if (!layer.thumbnail?.canvas) return;
      if (!layer.canvas?.canvas) return;
      layer.thumbnail.ctx?.drawImage(layer.canvas.canvas, 0, 0, layer.thumbnail.canvas.width, layer.thumbnail.canvas.height);
    }
  }
  