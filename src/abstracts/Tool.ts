import { LayerState } from '../types/LayerState';
import { MenuOptions } from '../types/MenuOptions';

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

    abstract setup(options:MenuOptions, setOptions:(options:MenuOptions)=>void):void;
    abstract dispose(options:MenuOptions, setOptions:(options:MenuOptions)=>void):void;
    abstract mouseDown(point: DOMPoint, options:MenuOptions, setOptions:(options:MenuOptions)=>void):void;
    abstract mouseUp(point: DOMPoint, options:MenuOptions, setOptions:(options:MenuOptions)=>void):void;
    abstract mouseMove(point: DOMPoint, options:MenuOptions, setOptions:(options:MenuOptions)=>void):void;
    abstract click(point: DOMPoint, options:MenuOptions, setOptions:(options:MenuOptions)=>void):void;
}
