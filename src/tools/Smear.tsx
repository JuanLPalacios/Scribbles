import { useEffect, useMemo } from 'react';
import { AlphaInput } from '../components/inputs/AlphaInput';
import { BrushOptions } from '../contexts/BrushesOptionsContext';
import { AlphaOptions } from '../contexts/MenuOptions';
import { DrawableState } from '../types/DrawableState';
import { Tool, ToolContext, ToolFunctions } from '../contexts/ToolContext';
import { useBrushesOptions } from '../hooks/useBrushesOptions';
import { useAlphaOptions } from '../hooks/useAlphaOptions';
import { useDrawing } from '../hooks/useDrawing';
import { renderThumbnail } from '../lib/Graphics';
import { difference, Point } from '../lib/Vectors2d';
import { HardnessInput } from '../components/inputs/HardnessInput';
import { BrushWidthInput } from '../components/inputs/BrushWidthInput';
import { useHardnessOptions } from '../hooks/useHardnessOptions';

export type EraseOptions = BrushOptions & AlphaOptions;

export const Smear = ({ children }: ToolFunctions) => {
    const [{ brushWidth }] = useBrushesOptions();
    const [{ alpha }] = useAlphaOptions();
    const [{ hardness }] = useHardnessOptions();
    const [drawing, { updateLayer }] = useDrawing();
    const r = useMemo<Tool>(()=>{
        let down = false;
        let lastPoint:Point = [0, 0];

        const renderSmear = function(canvas:DrawableState, buffer:DrawableState, point:Point){
            if(buffer.ctx){
                buffer.ctx.globalCompositeOperation = 'source-in';
                buffer.ctx.drawImage(canvas.canvas, ...point);
                canvas.ctx.globalCompositeOperation = 'source-over';
                canvas.ctx.drawImage(buffer.canvas, 0, 0);
            }
        };

        function drawMask(bufferCtx: CanvasRenderingContext2D, currentPoint: Point) {
            bufferCtx.globalCompositeOperation = 'copy';
            bufferCtx.filter = `blur(${~~(brushWidth * (1 - hardness) / 2)}px)`;
            bufferCtx.globalAlpha = alpha;
            bufferCtx.beginPath();
            bufferCtx.moveTo(...lastPoint);
            bufferCtx.lineTo(...currentPoint);
            bufferCtx.stroke();
            bufferCtx.filter = '';
            bufferCtx.globalAlpha = 1;
        }

        return {
            setup(){
                const { width, height } = drawing.data;
                const { buffer, selectedLayer, layers } = drawing.editorState;
                const { canvas } = layers[selectedLayer];
                const { ctx, canvas: originalLayer } = canvas;
                const { ctx: bufferCtx } = buffer;
                const minSpreadSafe = (brushWidth * (3 - hardness));
                bufferCtx.globalCompositeOperation = 'copy';
                bufferCtx.globalAlpha = 1;
                for (let spread = Math.max(width, height); spread >= minSpreadSafe; spread = Math.sqrt(spread)) {
                    bufferCtx.filter = `blur(${~~spread}px)`;
                    bufferCtx.drawImage(originalLayer, 0, 0);
                    bufferCtx.globalCompositeOperation = 'source-over';
                }
                bufferCtx.filter = 'none';
                bufferCtx.drawImage(originalLayer, 0, 0);
                bufferCtx.globalCompositeOperation = 'source-over';
                bufferCtx.filter = 'url(#no-alpha)';
                bufferCtx.drawImage(buffer.canvas, 0, 0);
                bufferCtx.filter = 'blur(0px)';
                ctx.globalAlpha = 1;
                ctx.globalCompositeOperation = 'source-in';
                ctx.drawImage(buffer.canvas, 0, 0);
                //ctx.filter = 'url(#no-alpha)';
                ctx.globalCompositeOperation = 'source-over';
                //ctx.drawImage(buffer.canvas, 0, 0);
                bufferCtx.globalCompositeOperation = 'copy';
                bufferCtx.fillRect(-1, -1, 1, 1);
                bufferCtx.globalCompositeOperation = 'source-over';
            },
            dispose(){
                const { selectedLayer, layers } = drawing.editorState;
                const { canvas } = layers[selectedLayer];
                const { ctx } = canvas;
                ctx.globalAlpha = 1;
                ctx.globalCompositeOperation = 'source-over';
            },
            click(){},
            mouseDown({ point }){
                const { buffer, selectedLayer, layers } = drawing.editorState;
                const { x, y } = point;
                const currentPoint:Point = [x, y];
                const { canvas } = layers[selectedLayer];
                const { ctx: bufferCtx } = buffer;
                //canvas.canvas.style.display = 'none';
                lastPoint = currentPoint;
                bufferCtx.lineJoin = 'round';
                bufferCtx.lineCap = 'round';
                bufferCtx.strokeStyle = '#000';
                bufferCtx.lineWidth = brushWidth;
                drawMask(bufferCtx, currentPoint);
                renderSmear(canvas, buffer, difference(currentPoint, lastPoint));
                down = true;
            },
            mouseMove({ point }){
                if (!down) return;
                const { buffer, selectedLayer, layers } = drawing.editorState;
                const { x, y } = point;
                const currentPoint:Point = [x, y];
                const { canvas } = layers[selectedLayer];
                const { ctx: bufferCtx } = buffer;
                drawMask(bufferCtx, currentPoint);
                renderSmear(canvas, buffer, difference(currentPoint, lastPoint));
                lastPoint = currentPoint;
            },
            mouseUp({ point }){
                if (!down) return;
                const { width, height } = drawing.data;
                const { selectedLayer, layers } = drawing.editorState;
                const { canvas, thumbnail } = layers[selectedLayer];
                const { x, y } = point;
                const currentPoint:Point = [x, y];
                const imageData = canvas.ctx.getImageData(0, 0, width, height);
                updateLayer({ imageData });
                renderThumbnail(imageData, thumbnail);
                lastPoint = currentPoint;
                down = false;
            },
        };
    }, [alpha, brushWidth, drawing.data, drawing.editorState, hardness, updateLayer]);
    useEffect(()=>{
        r.setup();
        return ()=>{
            r.dispose();
        };
    }, [r]);
    return <ToolContext.Provider value={r}>
        {children}
        <BrushWidthInput/>
        <AlphaInput  />
        <HardnessInput  />
    </ToolContext.Provider>;
};

