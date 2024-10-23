import { useEffect, useMemo } from 'react';
import { AlphaInput } from '../components/inputs/AlphaInput';
import { BrushSelectInput } from '../components/inputs/BrushSelectInput';
import { BrushOptions } from '../contexts/BrushesOptionsContext';
import { AlphaOptions } from '../contexts/MenuOptions';
import { createDrawable } from '../generators/createDrawable';
import { DrawableState } from '../types/DrawableState';
import { Tool, ToolContext, ToolFunctions } from '../contexts/ToolContext';
import { useBrush } from '../hooks/useBrush';
import { useBrushesOptions } from '../hooks/useBrushesOptions';
import { useAlphaOptions } from '../hooks/useAlphaOptions';
import { useDrawing } from '../hooks/useDrawing';

export type EraseOptions = BrushOptions & AlphaOptions;

export const Erase = ({ children }: ToolFunctions) => {
    const brush = useBrush();
    const [{ brushWidth }] = useBrushesOptions();
    const [{ alpha }] = useAlphaOptions();
    const [drawing, { updateLayer }] = useDrawing();
    const mask = useMemo(()=>createDrawable({ size: [1, 1] }), []);
    const r = useMemo<Tool>(()=>{
        let down = false;
        let canvasData:ImageData;

        const renderMask = function(canvas:DrawableState, buffer:DrawableState){
            if(buffer.ctx){
                buffer.ctx.putImageData(canvasData, 0, 0);
                buffer.ctx.globalCompositeOperation = 'destination-out';
                buffer.ctx.drawImage(mask.canvas, 0, 0);
            }
        };

        return {
            setup(){
                mask.canvas.width = drawing.data.width;
                mask.canvas.height = drawing.data.height;
            },
            dispose(){
            },
            click(){},
            mouseDown({ point }){
                const { buffer, selectedLayer, layers } = drawing.editorState;
                const { x, y } = point;
                const { canvas } = layers[selectedLayer];
                const { width, height } = canvas.canvas;
                canvasData = canvas.ctx.getImageData(0, 0, width, height);
                canvas.ctx.clearRect(0, 0, width, height);
                mask.ctx.clearRect(0, 0, buffer.canvas.width, buffer.canvas.height);
                buffer.ctx.globalAlpha = 1;
                brush.startStroke(mask, [x, y], '#000000', alpha, brushWidth);
                renderMask(canvas, buffer);
                down = true;
            },
            mouseMove({ point }){
                if (!down) return;
                const { buffer, selectedLayer, layers } = drawing.editorState;
                const { x, y } = point;
                const { canvas } = layers[selectedLayer];
                brush.drawStroke(mask, [x, y], '#000000', alpha, brushWidth);
                renderMask(canvas, buffer);
            },
            mouseUp({ point }){
                if (!down) return;
                const { width, height } = drawing.data;
                const { buffer, selectedLayer, layers } = drawing.editorState;
                const { canvas } = layers[selectedLayer];
                const { x, y } = point;
                brush.endStroke(mask, [x, y], '#000000', alpha, brushWidth);
                renderMask(canvas, buffer);
                const imageData = buffer.ctx.getImageData(0, 0, width, height);
                canvas.ctx.putImageData(imageData, 0, 0);
                buffer.ctx?.clearRect(0, 0, buffer.canvas.width, buffer.canvas.height);
                updateLayer({ imageData });
                down = false;
            },
        };
    }, [alpha, brush, brushWidth, drawing.data, drawing.editorState, mask, updateLayer]);
    useEffect(()=>{
        r.setup();
        return ()=>{
            r.dispose();
        };
    }, [r]);
    return <ToolContext.Provider value={r}>
        {children}
        <BrushSelectInput  />
        <AlphaInput  />
    </ToolContext.Provider>;
};

