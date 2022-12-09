import { CanvasEvent } from '../types/CanvasEvent';
import { LayerState } from '../types/LayerState';
import { ToolEvent } from '../types/ToolEvent';

export default abstract class Tool {
    renderThumbnail(layer:LayerState){
        const { canvas, thumbnail } = layer;
        if(thumbnail.ctx){
            thumbnail.ctx.globalCompositeOperation = 'copy';
            thumbnail.ctx.drawImage(canvas.canvas, 0, 0, thumbnail.canvas.width, thumbnail.canvas.height);
        }
    }

    get(layer:LayerState){
        const { canvas, thumbnail } = layer;
        if(thumbnail.ctx){
            thumbnail.ctx.globalCompositeOperation = 'copy';
            thumbnail.ctx.drawImage(canvas.canvas, 0, 0, thumbnail.canvas.width, thumbnail.canvas.height);
        }
    }

    abstract setup(event:ToolEvent):void;
    abstract dispose(event:ToolEvent):void;
    abstract mouseDown(event: CanvasEvent):void;
    abstract mouseUp(event: CanvasEvent):void;
    abstract mouseMove(event: CanvasEvent):void;
    abstract click(event: CanvasEvent):void;
}
