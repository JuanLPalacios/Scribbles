import Brush from '../abstracts/Brush';
import Tool from '../abstracts/Tool';
import { LayerState } from '../types/LayerState';

export const draw = new (class Draw extends Tool {
    mouseDown(brush:Brush, {nativeEvent}:React.MouseEvent, layer:LayerState, color:string, width:number) {
        nativeEvent.preventDefault();
        brush.startStroke(layer, [nativeEvent.offsetX, nativeEvent.offsetY], color, width);
    }

    mouseUp(brush:Brush, {nativeEvent}:React.MouseEvent, layer:LayerState, color:string, width:number) {
        brush.endStroke(layer, [nativeEvent.offsetX, nativeEvent.offsetY], color, width);
        if(layer.onRenderThumbnail)layer.onRenderThumbnail();
    }

    mouseMove(brush:Brush, {nativeEvent}:React.MouseEvent, layer:LayerState, color:string, width:number) {
        nativeEvent.preventDefault();
        brush.drawStroke(layer, [nativeEvent.offsetX, nativeEvent.offsetY], color, width);
    }

    click(brush:Brush, {nativeEvent}:React.MouseEvent, layer:LayerState, color:string, width:number) {
        nativeEvent.preventDefault();
    }
})();