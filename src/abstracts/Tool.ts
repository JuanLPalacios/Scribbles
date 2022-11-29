import { LayerState } from '../types/LayerState';
import { MenuOptions } from '../types/MenuOptions';
import Brush from './Brush';

export default abstract class Tool {
    renderThumbnail(layer:LayerState){
        const {canvas, buffer, thumbnail} = layer;
        if(thumbnail.ctx){
            thumbnail.ctx.globalCompositeOperation = 'copy';
            thumbnail.ctx.drawImage(canvas.canvas, 0, 0, thumbnail.canvas.width, thumbnail.canvas.height);
        }
    } 
    abstract setup(options:MenuOptions, setOptions:(options:MenuOptions)=>void):void;
    abstract dispose(options:MenuOptions, setOptions:(options:MenuOptions)=>void):void;
    abstract mouseDown(e:React.MouseEvent, options:MenuOptions, setOptions:(options:MenuOptions)=>void):void;
    abstract mouseUp(e:React.MouseEvent, options:MenuOptions, setOptions:(options:MenuOptions)=>void):void;
    abstract mouseMove(e:React.MouseEvent, options:MenuOptions, setOptions:(options:MenuOptions)=>void):void;
    abstract click(e:React.MouseEvent, options:MenuOptions, setOptions:(options:MenuOptions)=>void):void;
}
