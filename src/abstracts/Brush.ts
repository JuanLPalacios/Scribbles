import Layer from './Layer';
import Tool from './Tool';

export default abstract class Brush extends Tool {
  abstract lastPoint;
  width: number;
  mode: string;
  down: boolean;

  abstract renderPreview(ctx, points:[number, number][], color):void
  
  abstract startStroke(layer:Layer, point:[number, number], color:string):void

  abstract drawStroke(layer:Layer, point:[number, number], color:string):void

  abstract endStroke(layer:Layer, point:[number, number], color:string):void

  mouseDown({nativeEvent}:React.MouseEvent, layer:Layer, color:string) {
    
    nativeEvent.preventDefault();
    this.startStroke(layer, [nativeEvent.offsetX, nativeEvent.offsetY], color);
  };

  mouseUp({nativeEvent}:React.MouseEvent, layer:Layer, color:string) {
    this.endStroke(layer, [nativeEvent.offsetX, nativeEvent.offsetY], color);
    layer.renderThumbnail();
  };

  mouseMove({nativeEvent}:React.MouseEvent, layer:Layer, color:string) {
    nativeEvent.preventDefault();
    this.drawStroke(layer, [nativeEvent.offsetX, nativeEvent.offsetY], color);
  };

  click = ({nativeEvent}:React.MouseEvent, layer:Layer, color:string) => {
    nativeEvent.preventDefault();
  };
}
