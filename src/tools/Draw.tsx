import { Dispatch, SetStateAction, useEffect } from 'react';
import Tool from '../abstracts/Tool';
import { AlphaInput } from '../components/inputs/AlphaInput';
import { BrushSelectInput } from '../components/inputs/BrushSelectInput';
import { ColorInput } from '../components/inputs/ColorInput';
import { AlphaOptions, BrushOptions, ColorOptions } from '../contexts/MenuOptions';
import { CanvasEvent } from '../types/CanvasEvent';
import { ToolEvent } from '../types/ToolEvent';

type DrawOptions = BrushOptions & ColorOptions & AlphaOptions;

export const draw = new (class Draw extends Tool<DrawOptions> {
    down = false;
    Menu:(props: {config:DrawOptions, onChange:Dispatch<SetStateAction<DrawOptions>>}) => JSX.Element = ({ config, onChange }) => {
        const { color, alpha } = config;
        useEffect(()=>{
            if((color === undefined)||(alpha === undefined))onChange({ ...config, color: '#000000', alpha: 1 });
        }, [alpha, color, config, onChange]);
        return <div>
            <BrushSelectInput {...config} onChange={(values) => onChange({ ...config, ...values })} />
            <ColorInput {...config} onChange={(values) => onChange({ ...config, ...values })}  />
            <AlphaInput {...config} onChange={(values) => onChange({ ...config, ...values })}  />
        </div>;
    };

    setup({ drawingContext: [drawing] }:ToolEvent<DrawOptions>): void {
        if(!drawing) return;
        const { layers, selectedLayer } = drawing;
        const layer = layers[selectedLayer];
        const { canvas, buffer } = layer;
        canvas.ctx?.save();
        buffer.ctx?.save();
        this.down = false;
    }

    dispose({ drawingContext: [drawing] }:ToolEvent<DrawOptions>): void {
        if(!drawing) return;
        const { layers, selectedLayer } = drawing;
        const layer = layers[selectedLayer];
        const { canvas, buffer } = layer;
        canvas.ctx?.restore();
        buffer.ctx?.restore();
    }

    mouseDown({ point, drawingContext: [drawing], menuContext: [{ color, alpha, brushes, brushWidth, selectedBrush }] }: CanvasEvent<DrawOptions>): void {
        if(!drawing) return;
        const { layers, selectedLayer } = drawing;
        const brush = brushes[selectedBrush];
        const layer = layers[selectedLayer];
        this.down = true;
        const { x, y } = point;
        const { rect: { position: [dx, dy] } } = layer;
        brush.startStroke(layer.buffer, [x-dx, y-dy], color, alpha, brushWidth);
    }

    mouseUp({ point, drawingContext: [drawing], menuContext: [{ color, alpha, brushes, brushWidth, selectedBrush }] }: CanvasEvent<DrawOptions>): void {
        if(!drawing) return;
        const { layers, selectedLayer } = drawing;
        const brush = brushes[selectedBrush];
        const layer = layers[selectedLayer];
        const { x, y } = point;
        const { rect: { position: [dx, dy] } } = layer;
        if (!this.down) return;
        const { canvas, buffer } = layer;
        brush.endStroke(layer.buffer, [x-dx, y-dy], color, alpha, brushWidth);
        canvas.ctx?.drawImage(buffer.canvas, 0, 0);
        buffer.ctx?.clearRect(0, 0, buffer.canvas.width, buffer.canvas.height);
        this.down = false;
        this.renderThumbnail(layer);
    }

    mouseMove({ point, drawingContext: [drawing], menuContext: [{ color, alpha, brushes, brushWidth, selectedBrush }] }: CanvasEvent<DrawOptions>): void {
        if(!drawing) return;
        const { layers, selectedLayer } = drawing;
        const brush = brushes[selectedBrush];
        const layer = layers[selectedLayer];
        const { x, y } = point;
        const { rect: { position: [dx, dy] } } = layer;
        if (!this.down) return;
        brush.drawStroke(layer.buffer, [x-dx, y-dy], color, alpha, brushWidth);
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    click({ point, drawingContext: [drawing], menuContext: [{ color, alpha, brushes, brushWidth, selectedBrush }] }: CanvasEvent<DrawOptions>): void {
    }
})();