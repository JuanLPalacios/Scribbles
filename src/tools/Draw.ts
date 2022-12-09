import Tool from '../abstracts/Tool';
import { CanvasEvent } from '../types/CanvasEvent';
import { ToolEvent } from '../types/ToolEvent';

export const draw = new (class Draw extends Tool {
    down = false;

    setup({ drawingContext: [drawing] }:ToolEvent): void {
        if(!drawing) return;
        const { layers, selectedLayer } = drawing;
        const layer = layers[selectedLayer];
        const { canvas, buffer } = layer;
        canvas.ctx?.save();
        buffer.ctx?.save();
        this.down = false;
    }

    dispose({ drawingContext: [drawing] }:ToolEvent): void {
        if(!drawing) return;
        const { layers, selectedLayer } = drawing;
        const layer = layers[selectedLayer];
        const { canvas, buffer } = layer;
        canvas.ctx?.restore();
        buffer.ctx?.restore();
    }

    mouseDown({ point, drawingContext: [drawing], menuContext: [{ color, alpha, brushes, brushWidth, selectedBrush }] }: CanvasEvent,): void {
        if(!drawing) return;
        const { layers, selectedLayer } = drawing;
        const brush = brushes[selectedBrush];
        const layer = layers[selectedLayer];
        this.down = true;
        const { x, y } = point;
        const { rect: { position: [dx, dy] } } = layer;
        brush.startStroke(layer.buffer, [x-dx, y-dy], color, brushWidth);
    }

    mouseUp({ point, drawingContext: [drawing], menuContext: [{ color, alpha, brushes, brushWidth, selectedBrush }] }: CanvasEvent,): void {
        if(!drawing) return;
        const { layers, selectedLayer } = drawing;
        const brush = brushes[selectedBrush];
        const layer = layers[selectedLayer];
        const { x, y } = point;
        const { rect: { position: [dx, dy] } } = layer;
        if (!this.down) return;
        const { canvas, buffer } = layer;
        brush.endStroke(layer.buffer, [x-dx, y-dy], color, brushWidth);
        canvas.ctx?.drawImage(buffer.canvas, 0, 0);
        buffer.ctx?.clearRect(0, 0, buffer.canvas.width, buffer.canvas.height);
        this.down = false;
        this.renderThumbnail(layer);
    }

    mouseMove({ point, drawingContext: [drawing], menuContext: [{ color, alpha, brushes, brushWidth, selectedBrush }] }: CanvasEvent,): void {
        if(!drawing) return;
        const { layers, selectedLayer } = drawing;
        const brush = brushes[selectedBrush];
        const layer = layers[selectedLayer];
        const { x, y } = point;
        const { rect: { position: [dx, dy] } } = layer;
        if (!this.down) return;
        brush.drawStroke(layer.buffer, [x-dx, y-dy], color, brushWidth);
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    click({ point, drawingContext: [drawing], menuContext: [{ color, alpha, brushes, brushWidth, selectedBrush }] }: CanvasEvent,): void {
    }
})();