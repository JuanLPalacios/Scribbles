import { LayerState } from '../types/LayerState';
import { Point } from '../types/Point';

export default abstract class Brush {
  abstract lastPoint: Point;
  abstract down: boolean;

  renderPreview(layer:LayerState, points:Point[], color:string, width:number) {
      points.forEach((point, i) => {
          if (i === 0) this.startStroke(layer, point, color, width);
          else this.drawStroke(layer, point, color, width);
      });
      this.endStroke(layer, points[points.length-1], color, width);
  }
  abstract startStroke(layer:LayerState, point:Point, color:string, width:number):void
  abstract drawStroke(layer:LayerState, point:Point, color:string, width:number):void
  abstract endStroke(layer:LayerState, point:Point, color:string, width:number):void
}