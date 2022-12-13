import { Dispatch, SetStateAction } from 'react';
import Tool from '../abstracts/Tool';
import { AlphaOptions, BrushOptions } from '../contexts/MenuOptions';
import { BrushSelectInput } from '../components/inputs/BrushSelectInput';
import { createDrawable } from '../hooks/createDrawable';
import { CanvasEvent } from '../types/CanvasEvent';
import { DrawableState } from '../types/DrawableState';
import { ToolEvent } from '../types/ToolEvent';

type EraseOptions = BrushOptions & AlphaOptions;

export const erase = new (class Erase extends Tool<EraseOptions> {
    mask: DrawableState;
    down = false;
    Menu:(props: {config:EraseOptions, onChange:Dispatch<SetStateAction<EraseOptions>>}) => JSX.Element = ({ config, onChange }) => {
        const { alpha } = config;
        return <div>
            <BrushSelectInput {...config} onChange={(values) => onChange({ ...config, ...values })} />
            <label>
                 alpha
                <input type="range" value={alpha*255} min="0" max="255" onChange={(e) => onChange({ ...config, alpha: parseInt(e.target.value)/255 })} />
            </label>
        </div>;
    };

    constructor(){
        super();
        this.mask = createDrawable({ size: [1, 1] });
    }

    renderMask(canvas:DrawableState, buffer:DrawableState){
        if(buffer.ctx){
            buffer.ctx.globalCompositeOperation = 'copy';
            buffer.ctx.drawImage(canvas.canvas, 0, 0);
            buffer.ctx.globalCompositeOperation = 'destination-out';
            buffer.ctx.drawImage(this.mask.canvas, 0, 0);
        }
    }

    setup({ drawingContext: [drawing] }:ToolEvent<EraseOptions>): void {
        if(!drawing) return;
        const { layers, selectedLayer } = drawing;
        const layer = layers[selectedLayer];
        const { canvas, buffer } = layer;
        this.mask.canvas.width = canvas.canvas.width;
        this.mask.canvas.height = canvas.canvas.height;
        canvas.ctx?.save();
        buffer.ctx?.save();
        this.down = false;
    }

    dispose({ drawingContext: [drawing] }:ToolEvent<EraseOptions>): void {
        if(!drawing) return;
        const { layers, selectedLayer } = drawing;
        const layer = layers[selectedLayer];
        const { canvas, buffer } = layer;
        canvas.ctx?.restore();
        buffer.ctx?.restore();
        this.mask.canvas.width = 0;
        this.mask.canvas.height = 0;
    }

    mouseDown({ point, drawingContext: [drawing], menuContext: [{ brushes, brushWidth, selectedBrush }] }: CanvasEvent<EraseOptions>,): void {
        if(!drawing) return;
        const { layers, selectedLayer } = drawing;
        const brush = brushes[selectedBrush];
        const layer = layers[selectedLayer];
        const { x, y } = point;
        const { rect: { position: [dx, dy] } } = layer;
        const { canvas, buffer } = layer;
        layer.canvas.canvas.style.display = 'none';
        this.renderMask(canvas, buffer);
        brush.startStroke(this.mask, [x-dx, y-dy], '#000000', brushWidth);
        this.down = true;
    }

    mouseUp({ point, drawingContext: [drawing], menuContext: [{ brushes, brushWidth, selectedBrush }] }: CanvasEvent<EraseOptions>,): void {
        if(!drawing) return;
        const { layers, selectedLayer } = drawing;
        const brush = brushes[selectedBrush];
        const layer = layers[selectedLayer];
        const { x, y } = point;
        const { rect: { position: [dx, dy] } } = layer;
        if (!this.down) return;
        const { canvas, buffer } = layer;
        brush.endStroke(this.mask, [x-dx, y-dy], '#000000', brushWidth);
        this.renderMask(canvas, buffer);
        if(canvas.ctx){
            canvas.ctx.globalCompositeOperation = 'copy';
            canvas.ctx?.drawImage(buffer.canvas, 0, 0);
            canvas.ctx.globalCompositeOperation = 'source-over';
        }
        buffer.ctx?.clearRect(0, 0, buffer.canvas.width, buffer.canvas.height);
        canvas.canvas.style.display = 'inline';
        this.renderThumbnail(layer);
        this.down = false;
    }

    mouseMove({ point, drawingContext: [drawing], menuContext: [{ brushes, brushWidth, selectedBrush }] }: CanvasEvent<EraseOptions>,): void {
        if(!drawing) return;
        const { layers, selectedLayer } = drawing;
        const brush = brushes[selectedBrush];
        const layer = layers[selectedLayer];
        const { x, y } = point;
        const { rect: { position: [dx, dy] } } = layer;
        if (!this.down) return;
        const { canvas, buffer } = layer;
        brush.drawStroke(this.mask, [x-dx, y-dy], '#000000', brushWidth);
        this.renderMask(canvas, buffer);
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    click(): void {
    }
})();