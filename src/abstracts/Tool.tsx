import { Dispatch, SetStateAction } from 'react';
import { CanvasEvent } from '../types/CanvasEvent';
import { LayerState } from '../types/LayerState';
import { ToolEvent } from '../types/ToolEvent';

export default abstract class Tool< P = unknown > {
    renderThumbnail(layer:LayerState){
        const { canvas, thumbnail } = layer;
        if(thumbnail.ctx){
            thumbnail.ctx.globalCompositeOperation = 'copy';
            thumbnail.ctx.drawImage(canvas.canvas, 0, 0, thumbnail.canvas.width, thumbnail.canvas.height);
        }
    }

    abstract setup(event:ToolEvent<P>):void
    abstract dispose(event:ToolEvent<P>):void
    mouseDown(_event: CanvasEvent<P>){ return; }
    mouseUp(_event: CanvasEvent<P>){ return; }
    mouseMove(_event: CanvasEvent<P>){ return; }
    click(_event: CanvasEvent<P>){ return; }

    Menu:(props: {config:P, onChange:Dispatch<SetStateAction<P>>}) => JSX.Element = () => <></>;
}
