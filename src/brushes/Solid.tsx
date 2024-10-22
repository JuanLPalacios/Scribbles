import { useMemo } from 'react';
import { createPerpendicularVector, difference, Point } from '../lib/Vectors2d';
import { Renderer } from '../contexts/BrushRendererContext';
import { BrushFunctions } from '../contexts/BrushRendererContext';
import { BrushList } from '../lib/BrushList';
import { vectorProjection } from '../lib/Vectors2d';
import { AbstractSmoothSpacing } from '../abstracts/AbstractSmoothSpacing';
import { createDrawable } from '../generators/createDrawable';

export type SerializedSolidBrush = {
    scribbleBrushType: BrushList.Solid,
    name:string
    angle: number,
    hardness: number,
    roundness: number,
    spacing: number
}

export const Solid = (({ brush, children }:BrushFunctions<SerializedSolidBrush>)=>{
    const strokeAngle = useMemo<Point>(()=>[Math.sin(brush.angle*Math.PI/180), -Math.cos(brush.angle*Math.PI/180)], [brush.angle]);
    const strokeBuffer = createDrawable({ size: [1, 1], options: { willReadFrequently: true } });
    const r = useMemo<Renderer>(() => {
        let previousWidth = 0;
        let strokeBufferData:ImageData;
        return {
            drawBezier(bufferCtx, bezier, width, offset, preview){
                const { ctx: strokeBufferCtx, canvas: strokeBufferCanvas } = strokeBuffer;
                strokeBufferCtx.putImageData(strokeBufferData, 0, 0);
                const [,, p3, p4] = bezier;
                const [[p0x, p0y], [p1x, p1y], [p2x, p2y], [x, y]] = bezier;
                const v2 = difference(p4, p3);
                const blur = ~~(width*(1-brush.hardness)/4);
                const finalWidth = (width - blur*2) * (1 - (1 - brush.roundness) * vectorProjection(strokeAngle, v2));
                strokeBufferCtx.lineWidth = finalWidth;
                if(brush.roundness!=1){
                    strokeBufferCtx.beginPath();
                    strokeBufferCtx.moveTo(p0x, p0y);
                    const [w0x, w0y] = createPerpendicularVector([p1x - p0x, p1y - p0y], previousWidth / 2);
                    const [w1x, w1y] = createPerpendicularVector([p2x - x, p2y - y], strokeBufferCtx.lineWidth / 2);
                    strokeBufferCtx.moveTo(p0x + w0x, p0y + w0y);
                    strokeBufferCtx.bezierCurveTo(p1x + w0x, p1y + w0y, p2x - w1x, p2y - w1y, x - w1x, y - w1y);
                    strokeBufferCtx.lineTo(x + w1x, y + w1y);
                    strokeBufferCtx.bezierCurveTo(p2x + w1x, p2y + w1y, p1x - w0x, p1y - w0y, p0x - w0x, p0y - w0y);
                    strokeBufferCtx.fill();
                    strokeBufferCtx.beginPath();
                    strokeBufferCtx.arc(p0x, p0y, previousWidth / 2, 0, 2 * Math.PI);
                    strokeBufferCtx.fill();
                    strokeBufferCtx.beginPath();
                    strokeBufferCtx.arc(x, y, strokeBufferCtx.lineWidth / 2, 0, 2 * Math.PI);
                    strokeBufferCtx.fill();
                }
                strokeBufferCtx.beginPath();
                strokeBufferCtx.lineWidth = Math.min(finalWidth, previousWidth);
                strokeBufferCtx.moveTo(p0x, p0y);
                strokeBufferCtx.bezierCurveTo(p1x, p1y, p2x, p2y, x, y);
                strokeBufferCtx.stroke();
                bufferCtx.globalCompositeOperation = 'copy';
                bufferCtx.filter = `blur(${blur}px)`;
                bufferCtx.drawImage(strokeBufferCanvas, 0, 0);
                bufferCtx.globalCompositeOperation = 'source-over';
                bufferCtx.filter = 'blur(0px)';
                if(!preview){
                    strokeBufferData = strokeBufferCtx.getImageData(0, 0, strokeBufferCanvas.width, strokeBufferCanvas.height);
                    previousWidth = finalWidth;
                }
            },
            drawLine(bufferCtx, line, width, offset, preview){
                const { ctx: strokeBufferCtx, canvas: strokeBufferCanvas } = strokeBuffer;
                strokeBufferCtx.putImageData(strokeBufferData, 0, 0);
                const [lastPoint, point] = line;
                const v2 = difference(...line);
                const blur = ~~(width*(1-brush.hardness)/4);
                const finalWidth = (width - blur*2) * (1 - (1 - brush.roundness) * vectorProjection(strokeAngle, v2));
                strokeBufferCtx.lineWidth = Math.min(finalWidth, previousWidth);
                if(brush.roundness!=1){
                    const [p0x, p0y] = lastPoint;
                    const [x, y] = point;
                    strokeBufferCtx.beginPath();
                    strokeBufferCtx.moveTo(p0x, p0y);
                    const [w0x, w0y] = createPerpendicularVector([x - p0x, y - p0y], previousWidth / 2);
                    const [w1x, w1y] = createPerpendicularVector([x - p0x, y - p0y], finalWidth / 2);
                    strokeBufferCtx.moveTo(p0x + w0x, p0y + w0y);
                    strokeBufferCtx.lineTo(x + w1x, y + w1y);
                    strokeBufferCtx.lineTo(x - w1x, y - w1y);
                    strokeBufferCtx.lineTo(p0x - w0x, p0y - w0y);
                    strokeBufferCtx.fill();
                    strokeBufferCtx.beginPath();
                    strokeBufferCtx.arc(p0x, p0y, previousWidth / 2, 0, 2 * Math.PI);
                    strokeBufferCtx.fill();
                    strokeBufferCtx.beginPath();
                    strokeBufferCtx.arc(x, y, finalWidth / 2, 0, 2 * Math.PI);
                    strokeBufferCtx.fill();
                }
                strokeBufferCtx.beginPath();
                strokeBufferCtx.moveTo(...lastPoint);
                strokeBufferCtx.lineTo(...point);
                strokeBufferCtx.stroke();
                bufferCtx.globalCompositeOperation = 'copy';
                bufferCtx.filter = `blur(${blur}px)`;
                bufferCtx.drawImage(strokeBufferCanvas, 0, 0);
                bufferCtx.globalCompositeOperation = 'source-over';
                bufferCtx.filter = 'blur(0px)';
                if(!preview){
                    strokeBufferData = strokeBufferCtx.getImageData(0, 0, strokeBufferCanvas.width, strokeBufferCanvas.height);
                    previousWidth = finalWidth;
                }
            },
            setup(drawable, buffer, previewBuffer, point, color, alpha, brushWidth){
                const { ctx } = drawable;
                const { ctx: bufferCtx, canvas: bufferCanvas } = buffer;
                const { ctx: previewCtx } = previewBuffer;
                const { ctx: strokeBufferCtx, canvas: strokeBufferCanvas } = strokeBuffer;
                const blur = ~~(brushWidth*(1-brush.hardness)/4);
                ctx?.restore();
                const { width, height } = bufferCanvas;
                ctx.globalAlpha = alpha;
                strokeBufferCanvas.width = width;
                strokeBufferCanvas.height = height;
                strokeBufferCtx.lineCap = 'round';
                strokeBufferCtx.lineJoin = 'round';
                strokeBufferCtx.strokeStyle = color;
                strokeBufferCtx.fillStyle = color;
                strokeBufferCtx.lineWidth = (brushWidth - blur*2)*brush.roundness;
                strokeBufferCtx.globalAlpha = 1;
                strokeBufferCtx.globalCompositeOperation = 'copy';
                strokeBufferCtx.beginPath();
                strokeBufferCtx.moveTo(...point);
                strokeBufferCtx.lineTo(...point);
                strokeBufferCtx.stroke();
                strokeBufferCtx.globalCompositeOperation = 'source-over';
                bufferCtx.filter = `blur(${blur}px)`;
                bufferCtx.drawImage(strokeBufferCanvas, 0, 0);
                bufferCtx.filter = 'blur(0px)';
                previewCtx.filter = 'blur(0px)';
                strokeBufferData = strokeBufferCtx.getImageData(0, 0, strokeBufferCanvas.width, strokeBufferCanvas.height);
                previousWidth = (brushWidth - blur*2)*brush.roundness;
                // FIXME: draw tip shape to create the illusion of the more complex brush
                ctx.drawImage(bufferCanvas, 0, 0);
            }
        };
    }, [strokeBuffer, brush.hardness, brush.roundness, strokeAngle]);
    return <AbstractSmoothSpacing brush={brush} renderer={r}>
        {children}
    </AbstractSmoothSpacing>;
});

