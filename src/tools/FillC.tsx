import { useEffect, useMemo } from 'react';
import { AlphaInput } from '../components/inputs/AlphaInput';
import { ToolFunctions, ToolContext } from '../contexts/ToolContext';
import { useMenu } from '../hooks/useMenu';
import { CanvasEvent } from '../types/CanvasEvent';
import { DrawableState } from '../types/DrawableState';
import { ToolEvent } from '../types/ToolEvent';
import { renderThumbnail } from './Draw';
import { ColorInput } from '../components/inputs/ColorInput';
import { ToleranceInput } from '../components/inputs/ToleranceInput';
import { Point } from '../types/Point';
import { AlphaOptions, ColorOptions, ToleranceOptions } from '../contexts/MenuOptions';

type FillOptions = ColorOptions & AlphaOptions & ToleranceOptions;

export const FillC = ({ children }: ToolFunctions) => {
    const menuContext = useMenu();
    const [config, onChange] = menuContext;
    const r = useMemo(() => {
        const setup = function({ editorContext: [drawing] }: ToolEvent<FillOptions>): void {
            if(!drawing.drawing) return;
            const { layers, selectedLayer } = drawing.drawing;
            const layer = layers[selectedLayer];
            const { canvas, buffer } = layer;
            if(!canvas.ctx || !buffer.ctx) return;
            canvas.ctx.restore();
            canvas.ctx.globalCompositeOperation = 'source-over';
            buffer.ctx.restore();
            buffer.ctx.globalCompositeOperation = 'source-over';
        };

        const dispose = function(): void {
        };

        const mouseDown = function({ editorContext: [drawing, setDrawing] }: CanvasEvent<FillOptions>): void {
            if(!drawing.drawing) return;
            const { layers, selectedLayer } = drawing.drawing;
            const layer = layers[selectedLayer];
            setDrawing({ type: 'editor/do', payload: { type: 'drawing/workLayer', payload: { at: selectedLayer, layer } } });
        };

        const click = function({ point, editorContext: [drawing], menuContext: [{ color, alpha, tolerance }] }: CanvasEvent<FillOptions>,): void {
            if(!drawing.drawing) return;
            const { layers, selectedLayer } = drawing.drawing;
            const layer = layers[selectedLayer];
            const { x, y } = point;
            const { rect: { position: [dx, dy] } } = layer;
            const px = x - dx, py = y - dy;
            const { canvas, buffer } = layer;
            if(!buffer.ctx) return;
            buffer.ctx.fillStyle = color;
            buffer.ctx.globalAlpha = alpha;
            fill(
                canvas,
                buffer,
                tolerance,
                Math.floor(px),
                Math.floor(py),
                parseColor(color+Math.round(alpha*255).toString(16)),
                canvas.ctx?.getImageData(px, py, 1, 1).data || [0, 0, 0, 0]
            );
            if(!canvas.ctx) return;
            canvas.ctx.globalCompositeOperation = 'source-over';
            canvas.ctx.globalAlpha = 1;
            canvas.ctx.drawImage(buffer.canvas, 0, 0);
            buffer.ctx.clearRect(0, 0, buffer.canvas.width, buffer.canvas.height);
            renderThumbnail(layer);
        };

        const fill = function(canvas: DrawableState, buffer: DrawableState, tolerance:number, ox: number, oy: number, color: Uint8ClampedArray | number[], oColor: Uint8ClampedArray | number[]) {
            const canvasWidth = canvas.canvas.width;
            const canvasHeight = canvas.canvas.height;
            const imageData = canvas.ctx?.getImageData(0, 0, canvasWidth, canvasHeight);
            if(!imageData) return;
            const propagationStack:Point[] = [[ox, oy]];
            while(propagationStack.length>0)
            {
                const point = propagationStack.pop() as Point;
                let dataPos, reachLeft, reachRight;
                const x = point[0];
                let y = point[1];
                dataPos = (y*canvasWidth + x) * 4;
                if (matchStartColor(imageData, dataPos, color) === 0)
                    continue;

                while(y-- >= 0 && (matchStartColor(imageData, dataPos, oColor)<=tolerance))
                {
                    dataPos -= canvasWidth * 4;
                }
                dataPos += canvasWidth * 4;
                ++y;
                reachLeft = false;
                reachRight = false;
                const startY = y;
                let endY = y;
                while(y++ < canvasHeight-1 && (matchStartColor(imageData, dataPos, oColor)<=tolerance))
                {
                    colorPixel(imageData, dataPos, color);
                    endY = y;
                    if(x > 0) {
                        if((matchStartColor(imageData, dataPos - 4, oColor)<=tolerance)) {
                            if(!reachLeft){
                                propagationStack.push([x - 1, y]);
                                reachLeft = true;
                            }
                        }
                        else if(reachLeft)
                            reachLeft = false;
                    }

                    if(x < canvasWidth-1) {
                        if((matchStartColor(imageData, dataPos + 4, oColor))<=tolerance) {
                            if(!reachRight) {
                                propagationStack.push([x + 1, y]);
                                reachRight = true;
                            }
                        }
                        else if(reachRight)
                            reachRight = false;
                    }

                    dataPos += canvasWidth * 4;
                }
                buffer.ctx?.fillRect(x, startY, 1, endY-startY+1);
            }
        };

        const colorPixel = function(imageData: ImageData, dataPos: number, color: Uint8ClampedArray | number[]) {
            //this needs to affect cache

            imageData.data[dataPos] = color[0];
            imageData.data[dataPos+1] = color[1];
            imageData.data[dataPos+2] = color[2];
            imageData.data[dataPos+3] = color[3];
        };

        const matchStartColor = function(imageData: ImageData, dataPos: number, color: Uint8ClampedArray | number[]) {
            //this needs a cache

            const r0 = color[0];
            const g0 = color[1];
            const b0 = color[2];
            const a0 = color[3];

            const r = imageData.data[dataPos];
            const g = imageData.data[dataPos+1];
            const b = imageData.data[dataPos+2];
            const a = imageData.data[dataPos+3];

            const dA = (a-a0)/255;
            return colorDifferenceCh(r, r0, dA) +
                   colorDifferenceCh(g, g0, dA) +
                   colorDifferenceCh(b, b0, dA);
        };

        const colorDifferenceCh = function(a:number, b:number, dA:number){
            const black = (a-b)/255, white = black+dA;
            return Math.max(black*black, white*white);
        };
        return {
            click,
            dispose,
            mouseDown,
            mouseMove: ()=>{},
            mouseUp: ()=>{},
            setup
        };
    }, []);
    const { color, alpha, tolerance } = config;
    useEffect(()=>{
        if((color === undefined)||(alpha === undefined)||(tolerance === undefined))onChange({ ...config, color: '#000000', alpha: 1, tolerance: .15 });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [alpha, color, config, onChange]);
    return <ToolContext.Provider value={r}>
        {children}
        <ColorInput {...config} onChange={(values) => onChange({ ...config, ...values })}  />
        <AlphaInput {...config} onChange={(values) => onChange({ ...config, ...values })}  />
        <ToleranceInput {...config} onChange={(values) => onChange({ ...config, ...values })}  />
    </ToolContext.Provider>;
};

function parseColor(color:string): [number, number, number, number] {
    //this needs to be moved to a lib or repaced by one

    return [
        parseInt(color.substring(1, 3), 16),
        parseInt(color.substring(3, 5), 16),
        parseInt(color.substring(5, 7), 16),
        parseInt(color.substring(7), 16)
    ];
}