import { useMemo } from 'react';
import { AlphaInput } from '../components/inputs/AlphaInput';
import { BrushSelectInput } from '../components/inputs/BrushSelectInput';
import { BrushOptions } from '../contexts/BrushesOptionsContext';
import { AlphaOptions } from '../contexts/MenuOptions';
import { createDrawable } from '../generators/createDrawable';
import { CanvasEvent } from '../types/CanvasEvent';
import { ToolEvent } from '../types/ToolEvent';
import { renderThumbnail } from './Draw';
import { DrawableState } from '../types/DrawableState';
import { ToolContext, ToolFunctions } from '../contexts/ToolContext';

export type EraseOptions = BrushOptions & AlphaOptions;

export const EraseC = ({ children }: ToolFunctions) => {
    const mask = useMemo(()=>createDrawable({ size: [1, 1] }), []);
    const r = useMemo(()=>{
        let down = false;

        const renderMask = function(canvas:DrawableState, buffer:DrawableState){
            if(buffer.ctx){
                buffer.ctx.globalCompositeOperation = 'copy';
                buffer.ctx.drawImage(canvas.canvas, 0, 0);
                buffer.ctx.globalCompositeOperation = 'destination-out';
                buffer.ctx.drawImage(mask.canvas, 0, 0);
            }
        };

        const setup = function({ editorContext: [drawing] }:ToolEvent<EraseOptions>): void {
            if(!drawing.drawing) return;
            const { layers, selectedLayer } = drawing.drawing;
            const layer = layers[selectedLayer];
            const { canvas, buffer } = layer;
            mask.canvas.width = canvas.canvas.width;
            mask.canvas.height = canvas.canvas.height;
            canvas.ctx?.save();
            buffer.ctx?.save();
            down = false;
        };

        const dispose = function({ editorContext: [drawing] }:ToolEvent<EraseOptions>): void {
            if(!drawing.drawing) return;
            const { layers, selectedLayer } = drawing.drawing;
            const layer = layers[selectedLayer];
            const { canvas, buffer } = layer;
            canvas.ctx?.restore();
            buffer.ctx?.restore();
            mask.canvas.width = 0;
            mask.canvas.height = 0;
        };

        const mouseDown = function({ point, editorContext: [drawing, setDrawing], menuContext: [{ brushesPacks: brushes, brushWidth, selectedBrush, alpha }] }: CanvasEvent<EraseOptions>,): void {
            if(!drawing.drawing) return;
            const { layers, selectedLayer } = drawing.drawing;
            const brush = brushes[selectedBrush];
            const layer = layers[selectedLayer];
            const { x, y } = point;
            const { rect: { position: [dx, dy] } } = layer;
            const { canvas, buffer } = layer;
            mask.ctx?.clearRect(0, 0, buffer.canvas.width, buffer.canvas.height);
            layer.canvas.canvas.style.display = 'none';
            renderMask(canvas, buffer);
            brush.brush.startStroke(mask, [x-dx, y-dy], '#000000', alpha, brushWidth);
            down = true;
        };

        const mouseUp = function({ point, editorContext: [drawing, setDrawing], menuContext: [{ brushesPacks: brushes, brushWidth, selectedBrush, alpha }] }: CanvasEvent<EraseOptions>,): void {
            if(!drawing.drawing) return;
            const { layers, selectedLayer } = drawing.drawing;
            const brush = brushes[selectedBrush];
            const layer = layers[selectedLayer];
            const { x, y } = point;
            const { rect: { position: [dx, dy] } } = layer;
            if (!down) return;
            const { canvas, buffer } = layer;
            brush.brush.endStroke(mask, [x-dx, y-dy], '#000000', alpha, brushWidth);
            renderMask(canvas, buffer);
            if(canvas.ctx){
                canvas.ctx.globalCompositeOperation = 'copy';
                canvas.ctx?.drawImage(buffer.canvas, 0, 0);
                canvas.ctx.globalCompositeOperation = 'source-over';
            }
            buffer.ctx?.clearRect(0, 0, buffer.canvas.width, buffer.canvas.height);
            canvas.canvas.style.display = 'inline';
            const { rect, canvas: { ctx } } = layer;
            if(!ctx)return;
            setDrawing({ type: 'editor/do', payload: { type: 'drawing/workLayer', payload: { at: selectedLayer, layer: { ...layer, imageData: ctx.getImageData(0, 0, ...rect.size) } } } });
            renderThumbnail(layer);
            down = false;
        };

        const mouseMove = function({ point, editorContext: [drawing], menuContext: [{ brushesPacks: brushes, brushWidth, selectedBrush, alpha }] }: CanvasEvent<EraseOptions>,): void {
            if(!drawing.drawing) return;
            const { layers, selectedLayer } = drawing.drawing;
            const brush = brushes[selectedBrush];
            const layer = layers[selectedLayer];
            const { x, y } = point;
            const { rect: { position: [dx, dy] } } = layer;
            if (!down) return;
            const { canvas, buffer } = layer;
            brush.brush.drawStroke(mask, [x-dx, y-dy], '#000000', alpha, brushWidth);
            renderMask(canvas, buffer);
        };
        return {
            click: () => { },
            dispose,
            mouseDown,
            mouseMove,
            mouseUp,
            setup
        };
    }, [mask]);
    return <ToolContext.Provider value={r}>
        {children}
        <BrushSelectInput  />
        <AlphaInput  />
    </ToolContext.Provider>;
};

