import { LayerState } from '../types/LayerState';
import Brush from './Brush';

export default abstract class Tool {
    renderThumbnail(layer:LayerState){
        const {canvas, buffer, thumbnail} = layer;
        if(thumbnail.ctx){
            thumbnail.ctx.globalCompositeOperation = 'copy';
            thumbnail.ctx.drawImage(canvas.canvas, 0, 0, thumbnail.canvas.width, thumbnail.canvas.height);
        }
    } 
  abstract mouseDown(brush:Brush, e:React.MouseEvent, layer:LayerState, color:string, width:number):void;
  abstract mouseUp(brush:Brush, e:React.MouseEvent, layer:LayerState, color:string, width:number):void;
  abstract mouseMove(brush:Brush, e:React.MouseEvent, layer:LayerState, color:string, width:number):void;
  abstract click(brush:Brush, e:React.MouseEvent, layer:LayerState, color:string, width:number):void;
}
