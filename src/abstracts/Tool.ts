import { LayerState } from '../types/LayerState';
import Brush from './Brush';

export default abstract class Tool {
  abstract mouseDown(brush:Brush, e:React.MouseEvent, layer:LayerState, color:string, width:number):void;
  abstract mouseUp(brush:Brush, e:React.MouseEvent, layer:LayerState, color:string, width:number):void;
  abstract mouseMove(brush:Brush, e:React.MouseEvent, layer:LayerState, color:string, width:number):void;
  abstract click(brush:Brush, e:React.MouseEvent, layer:LayerState, color:string, width:number):void;
}
