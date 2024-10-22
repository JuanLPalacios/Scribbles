import { useEffect, useMemo } from 'react';
import { AlphaInput } from '../components/inputs/AlphaInput';
import { BrushSelectInput } from '../components/inputs/BrushSelectInput';
import { ColorInput } from '../components/inputs/ColorInput';
import { ToolFunctions, ToolContext, Tool } from '../contexts/ToolContext';
import { useBrush } from '../hooks/useBrush';
import { useColorOptions } from '../hooks/useColorOptions';
import { useAlphaOptions } from '../hooks/useAlphaOptions';
import { useBrushesOptions } from '../hooks/useBrushesOptions';
import { useDrawing } from '../hooks/useDrawing';

export const Draw = ({ children }: ToolFunctions) => {
    const brush = useBrush();
    const [{ brushWidth }] = useBrushesOptions();
    const [{ color }] = useColorOptions();
    const [{ alpha }] = useAlphaOptions();
    const [drawing, { updateLayer }] = useDrawing();
    const r = useMemo<Tool>(()=>{
        let down = false;

        return {
            setup(){},
            dispose(){
            },
            click: () => { },
            mouseDown({ point }){
                const { buffer } = drawing.editorState;
                const { x, y } = point;
                brush.startStroke(buffer, [x, y], color, alpha, brushWidth);
                down = true;
            },
            mouseMove({ point }){
                if (!down) return;
                const { buffer } = drawing.editorState;
                const { x, y } = point;
                brush.drawStroke(buffer, [x, y], color, alpha, brushWidth);
            },
            mouseUp({ point }){
                if (!down) return;
                const { width, height } = drawing.data;
                const { buffer, selectedLayer, layers } = drawing.editorState;
                const { canvas } = layers[selectedLayer];
                const { x, y } = point;
                brush.endStroke(buffer, [x, y], color, alpha, brushWidth);
                canvas.ctx.drawImage(buffer.canvas, 0, 0);
                buffer.ctx.clearRect(0, 0, buffer.canvas.width, buffer.canvas.height);
                down = false;
                const imageData = canvas.ctx.getImageData(0, 0, width, height);
                updateLayer({ imageData });
            },
        };
    }, [alpha, brush, brushWidth, color, drawing.data, drawing.editorState, updateLayer]);
    useEffect(()=>{
        r.setup();
        return ()=>{
            r.dispose();
        };
    }, [r]);
    return <ToolContext.Provider value={r}>
        {children}
        <BrushSelectInput  />
        <ColorInput  />
        <AlphaInput  />
    </ToolContext.Provider>;
};
