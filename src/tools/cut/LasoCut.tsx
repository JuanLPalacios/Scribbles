import { EditorLayerState, LayerState2 } from '../../types/LayerState';
import { CanvasEvent } from '../../types/CanvasEvent';
import { createDrawable } from '../../generators/createDrawable';
import { EditorDrawingState } from '../../contexts/EditorDrawingContext';
import { Point } from '../../lib/Vectors2d';
import { CutActions } from '../Transform';

export const LasoCut = ({ callback, drawing }: {callback:(pint:Point)=>void, drawing: EditorDrawingState}):CutActions => {
    let rect:DOMRect;
    const startCut = function({ point }: CanvasEvent, _layer:LayerState2&EditorLayerState){
        rect = new DOMRect(point.x, point.y, 0, 0);
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
        buffer.ctx.beginPath();
        buffer.ctx.moveTo(point.x, point.y);
    };

    const endCut = function(e: CanvasEvent, layer:LayerState2&EditorLayerState){
        const { x: cx, y: cy, right, bottom } = rect;
        const { x: px, y: py } = e.point;
        rect.x = Math.min(px, cx);
        rect.y = Math.min(py, cy);
        rect.width = Math.max(right, px)-rect.x;
        rect.height = Math.max(bottom, py)-rect.y;
        const { height, width } = drawing.data;
        const
            x = rect.x,
            y = rect.y,
            w = rect.width,
            h = rect.height;
        if((w==0)||(h==0)){
            return false;
        }
        const { canvas } = layer;
        const { buffer } = drawing.editorState;
        const mask = createDrawable({ size: [buffer.canvas.width, buffer.canvas.height] });
        buffer.ctx.lineTo(px, py);
        buffer.ctx.clearRect(0, 0, width, height);
        buffer.ctx.fill();
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
        const { x: cx, y: cy, bottom, right } = rect;
        const { x: px, y: py } = point;
        rect.x = Math.min(px, cx);
        rect.y = Math.min(py, cy);
        rect.width = Math.max(right, px)-rect.x;
        rect.height = Math.max(bottom, py)-rect.y;
        const { imageData: { width, height } } = layer;
        const { buffer } = drawing.editorState;
        if(!buffer.ctx) return;
        buffer.ctx.clearRect(0, 0, width, height);
        buffer.ctx.lineTo(px, py);
        buffer.ctx.stroke();
    };
    return { startCut, endCut, cut };
};
