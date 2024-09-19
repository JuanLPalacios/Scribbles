import { useMemo } from 'react';
import { AlphaInput } from '../components/inputs/AlphaInput';
import { BrushSelectInput } from '../components/inputs/BrushSelectInput';
import { ColorInput } from '../components/inputs/ColorInput';
import { ToolFunctions, ToolContext } from '../contexts/ToolContext';
import { CanvasEvent } from '../types/CanvasEvent';
import { ToolEvent } from '../types/ToolEvent';
import { DrawOptions, renderThumbnail } from './Draw';

export const DrawC = ({ children }: ToolFunctions) => {
    const r = useMemo(()=>{
        let down = false;

        const setup = ({ editorContext: [drawing] }: ToolEvent<DrawOptions>) => {
            if (!drawing.drawing) return;
            const { layers, selectedLayer } = drawing.drawing;
            const layer = layers[selectedLayer];
            const { canvas, buffer } = layer;
            canvas.ctx?.save();
            buffer.ctx?.save();
            down = false;
        };

        const dispose = ({ editorContext: [drawing] }: ToolEvent<DrawOptions>) => {
            if (!drawing.drawing) return;
            const { layers, selectedLayer } = drawing.drawing;
            const layer = layers[selectedLayer];
            const { canvas, buffer } = layer;
            canvas.ctx?.restore();
            buffer.ctx?.restore();
        };

        const mouseDown = ({ point, editorContext: [drawing, setDrawing], menuContext: [{ color, alpha, brushesPacks: brushes, brushWidth, selectedBrush }] }: CanvasEvent<DrawOptions>) => {
            if (!drawing.drawing) return;
            const { layers, selectedLayer } = drawing.drawing;
            const brush = brushes[selectedBrush];
            const layer = layers[selectedLayer];
            setDrawing({ type: 'editor/do', payload: { type: 'drawing/workLayer', payload: { at: selectedLayer, layer } } });
            down = true;
            const { x, y } = point;
            const { rect: { position: [dx, dy] } } = layer;
            brush.brush.startStroke(layer.buffer, [x - dx, y - dy], color, alpha, brushWidth);
        };

        const mouseUp = ({ point, editorContext: [drawing], menuContext: [{ color, alpha, brushesPacks: brushes, brushWidth, selectedBrush }] }: CanvasEvent<DrawOptions>) => {
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
            renderThumbnail(layer);
        };

        const mouseMove = ({ point, editorContext: [drawing], menuContext: [{ color, alpha, brushesPacks: brushes, brushWidth, selectedBrush }] }: CanvasEvent<DrawOptions>) => {
            if (!drawing.drawing) return;
            const { layers, selectedLayer } = drawing.drawing;
            const brush = brushes[selectedBrush];
            const layer = layers[selectedLayer];
            const { x, y } = point;
            const { rect: { position: [dx, dy] } } = layer;
            if (!down) return;
            brush.brush.drawStroke(layer.buffer, [x - dx, y - dy], color, alpha, brushWidth);
        };
        return {
            click: () => { },
            dispose,
            mouseDown,
            mouseMove,
            mouseUp,
            setup
        };
    }, []);
    return <ToolContext.Provider value={r}>
        {children}
        <BrushSelectInput  />
        <ColorInput  />
        <AlphaInput  />
    </ToolContext.Provider>;
};
