import Brush from '../abstracts/Brush';
import Tool from '../abstracts/Tool';
import { createDrawable } from '../hooks/createDrawable';
import { LayerState } from '../types/LayerState';
import { DrawableState } from '../types/DrawableState';

export const erase = new (class Erase extends Tool {
    mask: DrawableState;
    down = false;

    constructor(){
        super();
        this.mask = createDrawable({size:[1,1]});
    }

    renderMask(canvas:DrawableState, buffer:DrawableState){
        if(buffer.ctx){
            buffer.ctx.globalCompositeOperation = 'copy';
            buffer.ctx.drawImage(canvas.canvas, 0, 0);
            buffer.ctx.globalCompositeOperation = 'destination-out';
            buffer.ctx.drawImage(this.mask.canvas, 0, 0);
        }
    }

    mouseDown(brush:Brush, {nativeEvent}:React.MouseEvent, layer:LayerState, color:string, width:number) {
        nativeEvent.preventDefault();
        const {canvas, buffer} = layer;
        this.mask.canvas.width = layer.canvas.canvas.width;
        this.mask.canvas.height = layer.canvas.canvas.height;
        layer.canvas.canvas.style.display = 'none';
        this.renderMask(canvas, buffer);
        brush.startStroke(this.mask, [nativeEvent.offsetX, nativeEvent.offsetY], color, width);
        this.down = true;
    }

    mouseMove(brush:Brush, {nativeEvent}:React.MouseEvent, layer:LayerState, color:string, width:number) {
        nativeEvent.preventDefault();
        if (!this.down) return;
        const {canvas, buffer} = layer;
        brush.drawStroke(this.mask, [nativeEvent.offsetX, nativeEvent.offsetY], color, width);
        this.renderMask(canvas, buffer);
    }
    
    mouseUp(brush:Brush, {nativeEvent}:React.MouseEvent, layer:LayerState, color:string, width:number) {
        nativeEvent.preventDefault();
        if (!this.down) return;
        const {canvas, buffer} = layer;
        brush.endStroke(this.mask, [nativeEvent.offsetX, nativeEvent.offsetY], color, width);
        this.renderMask(canvas, buffer);
        if(canvas.ctx){
            canvas.ctx.globalCompositeOperation = 'copy';
            canvas.ctx?.drawImage(buffer.canvas, 0, 0);
            canvas.ctx.globalCompositeOperation = 'source-over';
        }
        buffer.ctx?.clearRect(0,0,buffer.canvas.width, buffer.canvas.height);
        canvas.canvas.style.display = 'inline';
        this.renderThumbnail(layer);
        this.down = false;
    }
    
    click(brush:Brush, {nativeEvent}:React.MouseEvent, layer:LayerState, color:string, width:number) {
        nativeEvent.preventDefault();
    }
})();