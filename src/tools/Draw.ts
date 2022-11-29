import { MouseEvent } from 'react';
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
    
    mouseDown({nativeEvent}: MouseEvent, options: MenuOptions<any>, setOptions: (options: MenuOptions<any>) => void): void {
        const { layers, selectedLayer, color, brushes, selectedBrush, brushWidth } = options;
        const brush = brushes[selectedBrush];
        const layer = layers[selectedLayer];
        nativeEvent.preventDefault();
        this.down = true;
        brush.startStroke(layer.buffer, [nativeEvent.offsetX, nativeEvent.offsetY], color, brushWidth);
    }
    
    mouseUp({nativeEvent}: MouseEvent, options: MenuOptions<any>, setOptions: (options: MenuOptions<any>) => void): void {
        const { layers, selectedLayer, color, brushes, selectedBrush, brushWidth } = options;
        const brush = brushes[selectedBrush];
        const layer = layers[selectedLayer];
        nativeEvent.preventDefault();
        if (!this.down) return;
        const {canvas, buffer} = layer;
        brush.endStroke(layer.buffer, [nativeEvent.offsetX, nativeEvent.offsetY], color, brushWidth);
        canvas.ctx?.drawImage(buffer.canvas, 0, 0);
        buffer.ctx?.clearRect(0,0,buffer.canvas.width, buffer.canvas.height);
        this.down = false;
        this.renderThumbnail(layer);
    }
    
    mouseMove({nativeEvent}: MouseEvent, options: MenuOptions<any>, setOptions: (options: MenuOptions<any>) => void): void {
        const { layers, selectedLayer, color, brushes, selectedBrush, brushWidth } = options;
        const brush = brushes[selectedBrush];
        const layer = layers[selectedLayer];
        nativeEvent.preventDefault();
        if (!this.down) return;
        brush.drawStroke(layer.buffer, [nativeEvent.offsetX, nativeEvent.offsetY], color, brushWidth);
    }
    
    click({nativeEvent}: MouseEvent, options: MenuOptions<any>, setOptions: (options: MenuOptions<any>) => void): void {
        nativeEvent.preventDefault();
    }
})();