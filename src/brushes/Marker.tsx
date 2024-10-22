import { BrushFunctions, Renderer } from '../contexts/BrushRendererContext';
import { createDrawable } from '../generators/createDrawable';
import { Bezier, Line } from '../lib/Vectors2d';
import { BrushList } from '../lib/BrushList';
import { useMemo } from 'react';
import { AbstractSmoothSpacing } from '../abstracts/AbstractSmoothSpacing';

export type SerializedMarkerBrush ={
    scribbleBrushType: BrushList.Marker
    name:string
    hardness: number
    spacing: number
}

export const Marker = (({ brush, children }: BrushFunctions<SerializedMarkerBrush>) => {
    const strokeBuffer= createDrawable({ size: [1, 1] });
    const aliasedStroke = createDrawable({ size: [1, 1], options: { willReadFrequently: true } });
    const r = useMemo<Renderer>(() => {
        let aliasedStrokeData:ImageData;
        let lastSegment: Line|Bezier =[[0, 0], [0, 0]];
        function drawSegment(ctx: CanvasRenderingContext2D, segment:Line|Bezier){
            if(segment.length==4){
                const [[p0x, p0y], [p1x, p1y], [p2x, p2y], [x, y]] = segment;
                ctx.beginPath();
                ctx.moveTo(p0x, p0y);
                ctx.bezierCurveTo(p1x, p1y, p2x, p2y, x, y);
                ctx.stroke();
            }
            else{
                const [p0, pf] = segment;
                ctx.beginPath();
                ctx.moveTo(...p0);
                ctx.lineTo(...pf);
                ctx.stroke();
            }
        }
        return {
            drawBezier(bufferCtx, bezier, width, offset, preview){
                const { ctx: strokeBufferCtx, canvas: strokeBufferCanvas } = strokeBuffer;
                const { ctx: aliasedStrokeCtx, canvas: aliasedStrokeCanvas } = aliasedStroke;
                const blur = ~~((1-brush.hardness)*width/4);
                aliasedStrokeCtx.putImageData(aliasedStrokeData, 0, 0);
                strokeBufferCtx.globalCompositeOperation = 'copy';
                drawSegment(strokeBufferCtx, lastSegment);
                strokeBufferCtx.globalCompositeOperation = 'source-out';
                drawSegment(strokeBufferCtx, bezier);
                aliasedStrokeCtx.drawImage(strokeBufferCanvas, 0, 0);
                bufferCtx.filter = `blur(${blur}px)`;
                bufferCtx.globalCompositeOperation = 'copy';
                bufferCtx.drawImage(aliasedStrokeCanvas, 0, 0);
                //bufferCtx.drawImage(strokeBufferCanvas, 0, 0);
                if(!preview){
                    aliasedStrokeData = aliasedStrokeCtx.getImageData(0, 0, aliasedStrokeCanvas.width, aliasedStrokeCanvas.height);
                    lastSegment = bezier;
                }
            },
            drawLine(bufferCtx, line, width, offset, preview){
                const { ctx: strokeBufferCtx, canvas: strokeBufferCanvas } = strokeBuffer;
                const { ctx: aliasedStrokeCtx, canvas: aliasedStrokeCanvas } = aliasedStroke;
                const blur = ~~((1-brush.hardness)*width/4);
                aliasedStrokeCtx.putImageData(aliasedStrokeData, 0, 0);
                strokeBufferCtx.globalCompositeOperation = 'copy';
                drawSegment(strokeBufferCtx, lastSegment);
                strokeBufferCtx.globalCompositeOperation = 'source-out';
                drawSegment(strokeBufferCtx, line);
                aliasedStrokeCtx.drawImage(strokeBufferCanvas, 0, 0);
                bufferCtx.filter = `blur(${blur}px)`;
                bufferCtx.globalCompositeOperation = 'copy';
                bufferCtx.drawImage(aliasedStrokeCanvas, 0, 0);
                //bufferCtx.drawImage(strokeBufferCanvas, 0, 0);
                if(!preview){
                    aliasedStrokeData = aliasedStrokeCtx.getImageData(0, 0, aliasedStrokeCanvas.width, aliasedStrokeCanvas.height);
                    lastSegment = line;
                }
            },
            setup(drawable, buffer, previewBuffer, point, color, alpha, width){
                const { ctx, canvas } = drawable;
                const { ctx: bufferCtx } = buffer;
                const { ctx: strokeBufferCtx, canvas: strokeBufferCanvas } = strokeBuffer;
                const { ctx: aliasedStrokeCtx, canvas: aliasedStrokeCanvas } = aliasedStroke;
                const blur = ~~((1-brush.hardness)*width/4);
                strokeBufferCanvas.width = canvas.width;
                strokeBufferCanvas.height = canvas.height;
                aliasedStrokeCanvas.width = canvas.width;
                aliasedStrokeCanvas.height = canvas.height;
                strokeBufferCtx.lineCap = 'round';
                strokeBufferCtx.lineJoin = 'round';
                strokeBufferCtx.strokeStyle = color;
                strokeBufferCtx.lineWidth = (width - blur*2);
                strokeBufferCtx.imageSmoothingEnabled = false;
                strokeBufferCtx.filter = 'url(#no-anti-aliasing)';
                aliasedStrokeCtx.globalAlpha = alpha;
                strokeBufferCtx.globalCompositeOperation = 'copy';
                strokeBufferCtx.beginPath();
                strokeBufferCtx.moveTo(...point);
                strokeBufferCtx.lineTo(...point);
                strokeBufferCtx.stroke();
                aliasedStrokeCtx.drawImage(strokeBufferCanvas, 0, 0);
                bufferCtx.filter = `blur(${blur}px)`;
                bufferCtx.globalCompositeOperation = 'copy';
                bufferCtx.drawImage(aliasedStrokeCanvas, 0, 0);
                aliasedStrokeData = aliasedStrokeCtx.getImageData(0, 0, aliasedStrokeCanvas.width, aliasedStrokeCanvas.height);
                lastSegment = [point, point];
                ctx.drawImage(aliasedStrokeCanvas, 0, 0);
            }
        };
    }, [aliasedStroke, brush.hardness, strokeBuffer]);
    return <AbstractSmoothSpacing brush={brush} renderer={r}>
        {children}
    </AbstractSmoothSpacing>;
});
