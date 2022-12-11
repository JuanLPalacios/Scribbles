import { Dispatch, SetStateAction } from 'react';
import { CanvasEvent } from '../types/CanvasEvent';
import { LayerState } from '../types/LayerState';
import { ToolEvent } from '../types/ToolEvent';

export default abstract class Tool< P = any > {
    renderThumbnail(layer:LayerState){
        const { canvas, thumbnail } = layer;
        if(thumbnail.ctx){
            thumbnail.ctx.globalCompositeOperation = 'copy';
            thumbnail.ctx.drawImage(canvas.canvas, 0, 0, thumbnail.canvas.width, thumbnail.canvas.height);
        }
    }

    abstract setup(event:ToolEvent):void
    abstract dispose(event:ToolEvent):void
    mouseDown(event: CanvasEvent){ return; }
    mouseUp(event: CanvasEvent){ return; }
    mouseMove(event: CanvasEvent){ return; }
    click(event: CanvasEvent){ return; }

    Menu:(props: {config:P, onChange:Dispatch<SetStateAction<P>>}) => JSX.Element = () => <></>;
}
