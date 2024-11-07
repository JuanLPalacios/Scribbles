import { Dispatch, SetStateAction } from 'react';
import { CanvasEvent } from '../types/CanvasEvent';
import { LayerState } from '../types/LayerState';
import { ToolEvent } from '../types/ToolEvent';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default abstract class Tool<P = any> {
    renderThumbnail(layer:LayerState){
        const { canvas, thumbnail } = layer;
        if(thumbnail.ctx){
            thumbnail.ctx.globalCompositeOperation = 'copy';
            thumbnail.ctx.drawImage(canvas.canvas, 0, 0, thumbnail.canvas.width, thumbnail.canvas.height);
        }
    }

    abstract setup(event:ToolEvent<P>):void
    abstract dispose(event:ToolEvent<P>):void
    mouseDown(_event: CanvasEvent){ return; }
    mouseUp(_event: CanvasEvent){ return; }
    mouseMove(_event: CanvasEvent){ return; }
    click(_event: CanvasEvent){ return; }

    Menu:(props: {config:P, onChange:Dispatch<SetStateAction<P>>}) => JSX.Element = () => <></>;
}
