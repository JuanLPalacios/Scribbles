import Brush from "../abstracts/Brush";
import Layer from "../abstracts/Layer";

export default class Marker extends Brush {
    lastPoint:[number, number] = [0,0];
    width = 4;
    mode = '';
    down = false;
  
    renderPreview(layer:Layer, points:[number, number][], color:string) {
        points.forEach((point, i) => {
            if (i === 0) this.startStroke(layer, point, color);
            else this.drawStroke(layer, point, color);
          });
          this.endStroke(layer, points[points.length-1], color);
    }
    
    startStroke(layer:Layer, point:[number, number], color:string) {
      this.down = true;
      this.lastPoint = point;
    }
  
    drawStroke(layer:Layer, point:[number, number], color:string) {
        const {ctx} = layer;
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
  
    endStroke(layer:Layer, point:[number, number], color:string) {
      this.down = false;
    }
  }
  