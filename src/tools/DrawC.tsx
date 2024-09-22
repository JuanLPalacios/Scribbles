import { useMemo } from 'react';
import { AlphaInput } from '../components/inputs/AlphaInput';
import { BrushSelectInput } from '../components/inputs/BrushSelectInput';
import { ColorInput } from '../components/inputs/ColorInput';
import { ToolFunctions, ToolContext, Tool } from '../contexts/ToolContext';
import { renderThumbnail } from './Draw';

export const DrawC = ({ children }: ToolFunctions) => {
    const r = useMemo<Tool<any>>(()=>{
        let down = false;

        return {
            setup({ editorContext: [drawing] }){
                if (!drawing.drawing) return;
                const { layers, selectedLayer } = drawing.drawing;
                const layer = layers[selectedLayer];
                const { canvas, buffer } = layer;
                canvas.ctx?.save();
                buffer.ctx?.save();
                down = false;
            },
            dispose({ editorContext: [drawing] }){
                if (!drawing.drawing) return;
                const { layers, selectedLayer } = drawing.drawing;
                const layer = layers[selectedLayer];
                const { canvas, buffer } = layer;
                canvas.ctx?.restore();
                buffer.ctx?.restore();
            },
            click: () => { },
            mouseDown({ point, editorContext: [drawing, setDrawing], menuContext: [{ color, alpha, brushesPacks: brushes, brushWidth, selectedBrush }] }){
                if (!drawing.drawing) return;
                const { layers, selectedLayer } = drawing.drawing;
                const brush = brushes[selectedBrush];
                const layer = layers[selectedLayer];
                const { rect, canvas: { ctx } } = layer;
                if(!ctx)return;
                setDrawing({ type: 'editor/do', payload: { type: 'drawing/workLayer', payload: { at: selectedLayer, layer: { ...layer, imageData: ctx.getImageData(0, 0, ...rect.size) } } } });
                down = true;
                const { x, y } = point;
                const { rect: { position: [dx, dy] } } = layer;
                brush.brush.startStroke(layer.buffer, [x - dx, y - dy], color, alpha, brushWidth);
            },
            mouseMove({ point, editorContext: [drawing], menuContext: [{ color, alpha, brushesPacks: brushes, brushWidth, selectedBrush }] }){
                if (!drawing.drawing) return;
                const { layers, selectedLayer } = drawing.drawing;
                const brush = brushes[selectedBrush];
                const layer = layers[selectedLayer];
                const { x, y } = point;
                const { rect: { position: [dx, dy] } } = layer;
                if (!down) return;
                brush.brush.drawStroke(layer.buffer, [x - dx, y - dy], color, alpha, brushWidth);
            },
            mouseUp({ point, editorContext: [drawing, setDrawing], menuContext: [{ color, alpha, brushesPacks: brushes, brushWidth, selectedBrush }] }){
                if (!drawing.drawing) return;
                const { layers, selectedLayer } = drawing.drawing;
                const brush = brushes[selectedBrush];
                const layer = layers[selectedLayer];
                const { x, y } = point;
                const { rect: { position: [dx, dy] } } = layer;
                if (!down) return;
                const { canvas, buffer } = layer;
                brush.brush.endStroke(layer.buffer, [x - dx, y - dy], color, alpha, brushWidth);
                canvas.ctx?.drawImage(buffer.canvas, 0, 0);
                buffer.ctx?.clearRect(0, 0, buffer.canvas.width, buffer.canvas.height);
                down = false;
                const { rect, canvas: { ctx } } = layer;
                if(!ctx)return;
                setDrawing({ type: 'editor/forceUpdate', payload: { drawing: { ...drawing.drawing, layers: layers.map((x, i)=>(i==selectedLayer)?{ ...x, imageData: ctx.getImageData(0, 0, ...rect.size) }:x), } } });
                renderThumbnail(layer);
            },
        };
    }, []);
    return <ToolContext.Provider value={r}>
        {children}
        <BrushSelectInput  />
        <ColorInput  />
        <AlphaInput  />
    </ToolContext.Provider>;
};
