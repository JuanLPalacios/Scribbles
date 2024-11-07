import { EditorLayerState, LayerState2 } from '../../types/LayerState';
import { CanvasEvent } from '../../types/CanvasEvent';
import { createDrawable } from '../../generators/createDrawable';
import { EditorDrawingState } from '../../contexts/EditorDrawingContext';
import { Point } from '../../lib/Vectors2d';
import { CutActions } from '../Transform';

export const RectCut = ({ callback, drawing }: {callback:(pint:Point)=>void, drawing: EditorDrawingState}):CutActions => {
    let startPoint = new DOMPoint();
    const startCut = function({ point }: CanvasEvent, _layer:LayerState2&EditorLayerState){
        startPoint = point;
        const { buffer } = drawing.editorState;
        if(!buffer.ctx) return;
        const tile = document.createElement('canvas');
        const square = 5;
        tile.width = tile.height = 2*square;
        const ctx = tile.getContext('2d');
        if(!ctx) return;
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, tile.width, tile.height);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, square, square);
        ctx.fillRect(square, square, square, square);
        buffer.ctx.strokeStyle = buffer.ctx.createPattern(tile, 'repeat') || '';
        buffer.ctx.lineWidth = 1;
        buffer.ctx.fillStyle = '#000000';
    };

    const endCut = function(e: CanvasEvent, layer:LayerState2&EditorLayerState){
        const { x: cx, y: cy } = startPoint;
        const { point: { x: px, y: py } } = e;
        const { height, width } = drawing.data;
        const
            x = Math.min(px, cx),
            y = Math.min(py, cy),
            w = Math.abs(px-cx),
            h = Math.abs(py-cy);
        if((w==0)||(h==0)){
            return false;
        }
        const { canvas } = layer;
        const { buffer } = drawing.editorState;
        const mask = createDrawable({ size: [buffer.canvas.width, buffer.canvas.height] });
        buffer.ctx.clearRect(0, 0, width, height);
        //this is unnecesary but is ment to be a reference, once the other selection are bing implemented
        buffer.ctx.fillRect(x, y, w, h);
        mask.ctx.drawImage(buffer.canvas, 0, 0);
        buffer.ctx.globalCompositeOperation = 'source-in';
        buffer.ctx.drawImage(canvas.canvas, 0, 0);
        canvas.ctx.globalCompositeOperation = 'destination-out';
        canvas.ctx.drawImage(mask.canvas, 0, 0);
        mask.canvas.width = w;
        mask.canvas.height = h;
        mask.ctx.drawImage(buffer.canvas, x, y, w, h, 0, 0, w, h);
        buffer.canvas.width = w;
        buffer.canvas.height = h;
        buffer.ctx.globalCompositeOperation = 'source-over';
        buffer.ctx.drawImage(mask.canvas, 0, 0);
        canvas.ctx.globalCompositeOperation = 'source-over';
        callback([x, y]);
        return true;
    };

    const cut = function({ point }: CanvasEvent, layer:LayerState2&EditorLayerState){
        const { x: cx, y: cy } = startPoint;
        const { x, y } = point;
        const { imageData: { width, height } } = layer;
        const { buffer } = drawing.editorState;
        if(!buffer.ctx) return;
        buffer.ctx.clearRect(0, 0, width, height);
        buffer.ctx.strokeRect(Math.min(x, cx), Math.min(y, cy), Math.abs(x-cx), Math.abs(y-cy));
    };
    return { startCut, endCut, cut };
};
