import { Dispatch, SetStateAction } from 'react';
import Tool from '../abstracts/Tool';
import { AlphaInput } from '../components/inputs/AlphaInput';
import { BrushSelectInput } from '../components/inputs/BrushSelectInput';
import { ColorInput } from '../components/inputs/ColorInput';
import { AlphaOptions, ColorOptions } from '../contexts/MenuOptions';
import { BrushOptions } from '../contexts/BrushesOptionsContext';
import { CanvasEvent } from '../types/CanvasEvent';
import { ToolEvent } from '../types/ToolEvent';
import { LayerState } from '../types/LayerState';

export type DrawOptions = BrushOptions & ColorOptions & AlphaOptions;

export const draw = new (class Draw extends Tool<DrawOptions> {
    down = false;
    Menu:(props: {config:DrawOptions, onChange:Dispatch<SetStateAction<DrawOptions>>}) => JSX.Element = () => {
        return <>
            <BrushSelectInput  />
            <ColorInput   />
            <AlphaInput   />
        </>;
    };

    setup({ editorContext: [drawing] }:ToolEvent<DrawOptions>): void {
        if(!drawing.drawing) return;
        const { layers, selectedLayer } = drawing.drawing;
        const layer = layers[selectedLayer];
        const { canvas, buffer } = layer;
        canvas.ctx?.save();
        buffer.ctx?.save();
        this.down = false;
    }

    dispose({ editorContext: [drawing] }:ToolEvent<DrawOptions>): void {
        if(!drawing.drawing) return;
        const { layers, selectedLayer } = drawing.drawing;
        const layer = layers[selectedLayer];
        const { canvas, buffer } = layer;
        canvas.ctx?.restore();
        buffer.ctx?.restore();
    }

    mouseDown({ point, editorContext: [drawing, setDrawing], menuContext: [{ color, alpha, brushesPacks: brushes, brushWidth, selectedBrush }] }: CanvasEvent<DrawOptions>): void {
        if(!drawing.drawing) return;
        const { layers, selectedLayer } = drawing.drawing;
        const brush = brushes[selectedBrush];
        const layer = layers[selectedLayer];
        setDrawing({ type: 'editor/do', payload: { type: 'drawing/workLayer', payload: { at: selectedLayer, layer } } });
        this.down = true;
        const { x, y } = point;
        const { rect: { position: [dx, dy] } } = layer;
        brush.brush.startStroke(layer.buffer, [x-dx, y-dy], color, alpha, brushWidth);
    }

    mouseUp({ point, editorContext: [drawing], menuContext: [{ color, alpha, brushesPacks: brushes, brushWidth, selectedBrush }] }: CanvasEvent<DrawOptions>): void {
        if(!drawing.drawing) return;
        const { layers, selectedLayer } = drawing.drawing;
        const brush = brushes[selectedBrush];
        const layer = layers[selectedLayer];
        const { x, y } = point;
        const { rect: { position: [dx, dy] } } = layer;
        if (!this.down) return;
        const { canvas, buffer } = layer;
        brush.brush.endStroke(layer.buffer, [x-dx, y-dy], color, alpha, brushWidth);
        canvas.ctx?.drawImage(buffer.canvas, 0, 0);
        buffer.ctx?.clearRect(0, 0, buffer.canvas.width, buffer.canvas.height);
        this.down = false;
        this.renderThumbnail(layer);
    }

    mouseMove({ point, editorContext: [drawing], menuContext: [{ color, alpha, brushesPacks: brushes, brushWidth, selectedBrush }] }: CanvasEvent<DrawOptions>): void {
        if(!drawing.drawing) return;
        const { layers, selectedLayer } = drawing.drawing;
        const brush = brushes[selectedBrush];
        const layer = layers[selectedLayer];
        const { x, y } = point;
        const { rect: { position: [dx, dy] } } = layer;
        if (!this.down) return;
        brush.brush.drawStroke(layer.buffer, [x-dx, y-dy], color, alpha, brushWidth);
    }
})();

export function renderThumbnail(layer:LayerState){
    const { canvas, thumbnail } = layer;
    if(thumbnail.ctx){
        thumbnail.ctx.globalCompositeOperation = 'copy';
        thumbnail.ctx.drawImage(canvas.canvas, 0, 0, thumbnail.canvas.width, thumbnail.canvas.height);
    }
}
