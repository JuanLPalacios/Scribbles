import { useMemo } from 'react';
import { createPerpendicularVector, difference, Point } from '../lib/Vectors2d';
import { Renderer } from '../contexts/BrushRendererContext';
import { BrushFunctions } from '../contexts/BrushRendererContext';
import { BrushList } from '../lib/BrushList';
import { vectorProjection } from '../lib/Vectors2d';
import { AbstractSmoothSpacing } from '../abstracts/AbstractSmoothSpacing';

export type SerializedSolidBrush = {
    scribbleBrushType: BrushList.Solid,
    name:string
    angle: number,
    hardness: number,
    roundness: number,
    spacing: number
}

export const SolidC = (({ brush, children }:BrushFunctions<SerializedSolidBrush>)=>{
    const strokeAngle = useMemo<Point>(()=>[Math.sin(brush.angle*Math.PI/180), -Math.cos(brush.angle*Math.PI/180)], [brush.angle]);
    const r = useMemo<Renderer>(() => {
        let previousWidth = 0;
        return {
            drawBezier(bufferCtx, bezier, width, offset, preview){
                const [,, p3, p4] = bezier;
                const [[p0x, p0y], [p1x, p1y], [p2x, p2y], [x, y]] = bezier;
                const v2 = difference(p4, p3);
                const finalWidth = width * (1 - (1 - brush.roundness) * vectorProjection(strokeAngle, v2));
                bufferCtx.lineWidth = finalWidth;
                bufferCtx.filter = `blur(${~~(width * (1 - brush.hardness) / 2)}px)`;
                if(brush.roundness!=1){
                    bufferCtx.beginPath();
                    bufferCtx.moveTo(p0x, p0y);
                    const [w0x, w0y] = createPerpendicularVector([p1x - p0x, p1y - p0y], previousWidth / 2);
                    const [w1x, w1y] = createPerpendicularVector([p2x - x, p2y - y], bufferCtx.lineWidth / 2);
                    bufferCtx.moveTo(p0x + w0x, p0y + w0y);
                    bufferCtx.bezierCurveTo(p1x + w0x, p1y + w0y, p2x - w1x, p2y - w1y, x - w1x, y - w1y);
                    bufferCtx.lineTo(x + w1x, y + w1y);
                    bufferCtx.bezierCurveTo(p2x + w1x, p2y + w1y, p1x - w0x, p1y - w0y, p0x - w0x, p0y - w0y);
                    bufferCtx.fill();
                    bufferCtx.beginPath();
                    bufferCtx.arc(p0x, p0y, previousWidth / 2, 0, 2 * Math.PI);
                    bufferCtx.fill();
                    bufferCtx.beginPath();
                    bufferCtx.arc(x, y, bufferCtx.lineWidth / 2, 0, 2 * Math.PI);
                    bufferCtx.fill();
                }
                bufferCtx.beginPath();
                bufferCtx.lineWidth = Math.min(finalWidth, previousWidth);
                bufferCtx.moveTo(p0x, p0y);
                bufferCtx.bezierCurveTo(p1x, p1y, p2x, p2y, x, y);
                bufferCtx.stroke();
                if(!preview){
                    previousWidth = finalWidth;
                }
            },
            drawLine(bufferCtx, line, width, offset, preview){
                const [lastPoint, point] = line;
                const v2 = difference(...line);
                const finalWidth = width * (1 - (1 - brush.roundness) * vectorProjection(strokeAngle, v2));
                bufferCtx.lineWidth = Math.min(finalWidth, previousWidth);
                if(brush.roundness!=1){
                    const [p0x, p0y] = lastPoint;
                    const [x, y] = point;
                    bufferCtx.beginPath();
                    bufferCtx.moveTo(p0x, p0y);
                    const [w0x, w0y] = createPerpendicularVector([x - p0x, y - p0y], previousWidth / 2);
                    const [w1x, w1y] = createPerpendicularVector([x - p0x, y - p0y], finalWidth / 2);
                    bufferCtx.moveTo(p0x + w0x, p0y + w0y);
                    bufferCtx.lineTo(x + w1x, y + w1y);
                    bufferCtx.lineTo(x - w1x, y - w1y);
                    bufferCtx.lineTo(p0x - w0x, p0y - w0y);
                    bufferCtx.fill();
                    bufferCtx.beginPath();
                    bufferCtx.arc(p0x, p0y, previousWidth / 2, 0, 2 * Math.PI);
                    bufferCtx.fill();
                    bufferCtx.beginPath();
                    bufferCtx.arc(x, y, finalWidth / 2, 0, 2 * Math.PI);
                    bufferCtx.fill();
                }
                bufferCtx.beginPath();
                bufferCtx.moveTo(...lastPoint);
                bufferCtx.filter = `blur(${~~(width * (1 - brush.hardness) / 2)}px)`;
                bufferCtx.lineTo(...point);
                bufferCtx.stroke();
                if(!preview){
                    previousWidth = finalWidth;
                }
            },
            setup(drawable, buffer, previewBuffer, point, color, alpha, width){
                const { ctx } = drawable;
                const { ctx: bufferCtx, canvas: bufferCanvas } = buffer;
                const { ctx: previewCtx } = previewBuffer;
                ctx?.restore();
                bufferCtx.lineCap = 'round';
                bufferCtx.lineJoin = 'round';
                bufferCtx.strokeStyle = color;
                bufferCtx.fillStyle = color;
                bufferCtx.lineWidth = width*brush.roundness;
                previewCtx.lineCap = 'round';
                previewCtx.lineJoin = 'round';
                previewCtx.strokeStyle = color;
                previewCtx.fillStyle = color;
                previewCtx.lineWidth = width*brush.roundness;
                ctx.globalAlpha = alpha;
                bufferCtx.filter = `blur(${~~(width*(1-brush.hardness)/2)}px)`;
                bufferCtx.beginPath();
                bufferCtx.moveTo(...point);
                bufferCtx.lineTo(...point);
                previewCtx.filter = `blur(${~~(width*(1-brush.hardness)/2)}px)`;
                previewCtx.beginPath();
                previewCtx.moveTo(...point);
                previewCtx.lineTo(...point);
                bufferCtx.stroke();
                previewCtx.stroke();
                previousWidth = width*brush.roundness;
                // FIXME: draw tip shape to create the illusion of the more complex brush
                ctx.drawImage(bufferCanvas, 0, 0);
            }
        };
    }, [brush, strokeAngle]);
    return <AbstractSmoothSpacing brush={brush} renderer={r}>
        {children}
    </AbstractSmoothSpacing>;
});

