import Brush from '../abstracts/Brush';
import Tool from '../abstracts/Tool';
import { LayerState } from '../types/LayerState';

export const draw = new (class Draw extends Tool {
    down = false;
    mouseDown(brush:Brush, {nativeEvent}:React.MouseEvent, layer:LayerState, color:string, width:number) {
        nativeEvent.preventDefault();
        this.down = true;
        brush.startStroke(layer.buffer, [nativeEvent.offsetX, nativeEvent.offsetY], color, width);
    }

    mouseMove(brush:Brush, {nativeEvent}:React.MouseEvent, layer:LayerState, color:string, width:number) {
        nativeEvent.preventDefault();
        if (!this.down) return;
        brush.drawStroke(layer.buffer, [nativeEvent.offsetX, nativeEvent.offsetY], color, width);
    }
    
    mouseUp(brush:Brush, {nativeEvent}:React.MouseEvent, layer:LayerState, color:string, width:number) {
        nativeEvent.preventDefault();
        if (!this.down) return;
        const {canvas, buffer, thumbnail} = layer;
        brush.endStroke(layer.buffer, [nativeEvent.offsetX, nativeEvent.offsetY], color, width);
        canvas.ctx?.drawImage(buffer.canvas, 0, 0);
        buffer.ctx?.clearRect(0,0,buffer.canvas.width, buffer.canvas.height);
        this.down = false;
        this.renderThumbnail(layer);
    }
    
    click(brush:Brush, {nativeEvent}:React.MouseEvent, layer:LayerState, color:string, width:number) {
        nativeEvent.preventDefault();
    }
})();