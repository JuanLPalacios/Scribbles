import { DrawableState } from '../types/DrawableState';
import { Point } from '../types/Point';

export default abstract class Brush {
  abstract lastPoint: Point;

  renderPreview(drawable:DrawableState, points:Point[], color:string, width:number) {
      points.forEach((point, i) => {
          if (i === 0) this.startStroke(drawable, point, color, width);
          else this.drawStroke(drawable, point, color, width);
      });
      this.endStroke(drawable, points[points.length-1], color, width);
  }
  abstract startStroke(drawable:DrawableState, point:Point, color:string, width:number):void
  abstract drawStroke(drawable:DrawableState, point:Point, color:string, width:number):void
  abstract endStroke(drawable:DrawableState, point:Point, color:string, width:number):void
}