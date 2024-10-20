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
import { renderThumbnail } from '../lib/Graphics';

export type EraseOptions = BrushOptions & AlphaOptions;

export const Erase = ({ children }: ToolFunctions) => {
    const brush = useBrush();
    const [{ brushWidth }] = useBrushesOptions();
    const [{ alpha }] = useAlphaOptions();
    const [drawing, { updateLayer }] = useDrawing();
    const mask = useMemo(()=>createDrawable({ size: [1, 1] }), []);
    const r = useMemo<Tool>(()=>{
        let down = false;

        const renderMask = function(canvas:DrawableState, buffer:DrawableState){
            if(buffer.ctx){
                buffer.ctx.globalCompositeOperation = 'copy';
                buffer.ctx.drawImage(canvas.canvas, 0, 0);
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
                canvas.canvas.style.display = 'none';
                mask.ctx.clearRect(0, 0, buffer.canvas.width, buffer.canvas.height);
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
                const { canvas, thumbnail } = layers[selectedLayer];
                const { x, y } = point;
                brush.endStroke(mask, [x, y], '#000000', alpha, brushWidth);
                renderMask(canvas, buffer);
                if(canvas.ctx){
                    canvas.ctx.globalCompositeOperation = 'copy';
                    canvas.ctx?.drawImage(buffer.canvas, 0, 0);
                    canvas.ctx.globalCompositeOperation = 'source-over';
                }
                buffer.ctx?.clearRect(0, 0, buffer.canvas.width, buffer.canvas.height);
                canvas.canvas.style.display = 'inline';
                const imageData = canvas.ctx.getImageData(0, 0, width, height);
                updateLayer({ imageData });
                renderThumbnail(imageData, thumbnail);
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

