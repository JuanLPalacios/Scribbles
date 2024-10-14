import { useMemo } from 'react';
import { createPerpendicularVector } from '../lib/Vectors2d';
import { Point } from '../types/Point';
import { Renderer } from '../contexts/BrushRendererContext';
import { BrushFunctions } from '../contexts/BrushRendererContext';
import { BrushList } from '../lib/BrushList';
import { vectorProjection } from '../lib/Vectors2d';
import { AbstractSmoothSpacing } from '../abstracts/AbstractSmoothSpacing';

export type SerializedSolidBrush = {
    scribbleBrushType: BrushList.Solid,
    name:string
    angle: number,
    diameter: number,
    hardness: number,
    roundness: number,
    spacing: number
}

export const SolidC = (({ brush, children }:BrushFunctions<SerializedSolidBrush>)=>{
    const strokeAngle = useMemo<Point >(()=>[Math.sin(brush.angle*Math.PI/180), -Math.cos(brush.angle*Math.PI/180)], [brush.angle]);
    const r = useMemo<Renderer>(() => {
        let lastPoint:Point = [0, 0];
        let previousWidth = 0;
        return {
            drawBezier([[p0x, p0y], [p1x, p1y], [p2x, p2y], [x, y]], bufferCtx, width, v2, preview){
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
                    lastPoint = [x, y];
                    previousWidth = finalWidth;
                }
            },
            drawLine(bufferCtx, width, v2, point, preview){
                bufferCtx.beginPath();
                bufferCtx.moveTo(...lastPoint);
                const finalWidth = width * (1 - (1 - brush.roundness) * vectorProjection(strokeAngle, v2));
                bufferCtx.lineWidth = finalWidth;
                bufferCtx.filter = `blur(${~~(width * (1 - brush.hardness) / 2)}px)`;
                bufferCtx.lineTo(...point);
                bufferCtx.stroke();
                if(!preview){
                    lastPoint = point;
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
                lastPoint = point;
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

