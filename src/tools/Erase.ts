import Tool from '../abstracts/Tool';
import { createDrawable } from '../hooks/createDrawable';
import { DrawableState } from '../types/DrawableState';
import { MenuOptions } from '../types/MenuOptions';

export const erase = new (class Erase extends Tool {
    mask: DrawableState;
    down = false;

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

    setup(options: MenuOptions<any>, setOptions: (options: MenuOptions<any>) => void): void {
        const { drawing, selectedLayer } = options;
        if(!drawing) return;
        const { layers } = drawing;
        const layer = layers[selectedLayer];
        const { canvas, buffer } = layer;
        this.mask.canvas.width = canvas.canvas.width;
        this.mask.canvas.height = canvas.canvas.height;
        canvas.ctx?.save();
        buffer.ctx?.save();
        this.down = false;
    }

    dispose(options: MenuOptions<any>, setOptions: (options: MenuOptions<any>) => void): void {
        const { drawing, selectedLayer } = options;
        if(!drawing) return;
        const { layers } = drawing;
        const layer = layers[selectedLayer];
        const { canvas, buffer } = layer;
        canvas.ctx?.restore();
        buffer.ctx?.restore();
        this.mask.canvas.width = 0;
        this.mask.canvas.height = 0;
    }

    mouseDown(point: DOMPoint, options: MenuOptions<any>, setOptions: (options: MenuOptions<any>) => void): void {
        const { drawing, selectedLayer, brushes, selectedBrush, brushWidth } = options;
        if(!drawing) return;
        const { layers } = drawing;
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

    mouseUp(point: DOMPoint, options: MenuOptions<any>, setOptions: (options: MenuOptions<any>) => void): void {
        const { drawing, selectedLayer, brushes, selectedBrush, brushWidth } = options;
        if(!drawing) return;
        const { layers } = drawing;
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

    mouseMove(point: DOMPoint, options: MenuOptions<any>, setOptions: (options: MenuOptions<any>) => void): void {
        const { drawing, selectedLayer, brushes, selectedBrush, brushWidth } = options;
        if(!drawing) return;
        const { layers } = drawing;
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
    click(point: DOMPoint, options: MenuOptions<any>, setOptions: (options: MenuOptions<any>) => void): void {
    }
})();