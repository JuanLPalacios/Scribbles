import Tool from '../abstracts/Tool';
import { MenuOptions } from '../types/MenuOptions';

export const draw = new (class Draw extends Tool {
    down = false;
    
    setup(options: MenuOptions<any>, setOptions: (options: MenuOptions<any>) => void): void {
        //throw new Error('Method not implemented.');
    }
    
    dispose(options: MenuOptions<any>, setOptions: (options: MenuOptions<any>) => void): void {
        //throw new Error('Method not implemented.');
    }
    
    mouseDown(point: DOMPoint, options: MenuOptions<any>, setOptions: (options: MenuOptions<any>) => void): void {
        const { layers, selectedLayer, color, brushes, selectedBrush, brushWidth } = options;
        const brush = brushes[selectedBrush];
        const layer = layers[selectedLayer];
        this.down = true;
        const {x,y} = point;
        const {rect:{position:[dx,dy]}} = layer; 
        brush.startStroke(layer.buffer, [x-dx, y-dy], color, brushWidth);
    }
    
    mouseUp(point: DOMPoint, options: MenuOptions<any>, setOptions: (options: MenuOptions<any>) => void): void {
        const { layers, selectedLayer, color, brushes, selectedBrush, brushWidth } = options;
        const brush = brushes[selectedBrush];
        const layer = layers[selectedLayer];
        const {x,y} = point;
        const {rect:{position:[dx,dy]}} = layer; 
        if (!this.down) return;
        const {canvas, buffer} = layer;
        brush.endStroke(layer.buffer, [x-dx, y-dy], color, brushWidth);
        canvas.ctx?.drawImage(buffer.canvas, 0, 0);
        buffer.ctx?.clearRect(0,0,buffer.canvas.width, buffer.canvas.height);
        this.down = false;
        this.renderThumbnail(layer);
    }
    
    mouseMove(point: DOMPoint, options: MenuOptions<any>, setOptions: (options: MenuOptions<any>) => void): void {
        const { layers, selectedLayer, color, brushes, selectedBrush, brushWidth } = options;
        const brush = brushes[selectedBrush];
        const layer = layers[selectedLayer];
        const {x,y} = point;
        const {rect:{position:[dx,dy]}} = layer; 
        if (!this.down) return;
        brush.drawStroke(layer.buffer, [x-dx, y-dy], color, brushWidth);
    }
    
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    click(point: DOMPoint, options: MenuOptions<any>, setOptions: (options: MenuOptions<any>) => void): void {
    }
})();