import { useMemo } from 'react';
import { BrushFunctions, Renderer } from '../contexts/BrushRendererContext';
import { createDrawable } from '../generators/createDrawable';
import { deserializeImageData } from '../lib/serializeJSON';
import { DrawableState } from '../types/DrawableState';
import { bezierArcLength, calculateBezierPoint, difference, distance2d, length, Point } from '../lib/Vectors2d';
import { BrushList } from '../lib/BrushList';
import { SerializedImageData } from '../types/SerializedImageData';
import { AbstractSmoothSpacing } from '../abstracts/AbstractSmoothSpacing';

export type SerializedTextureBrush = {
    scribbleBrushType: BrushList.Texture,
    name:string
    spacing: number;
    antiAliasing: boolean;
    brushTipImage: SerializedImageData;
}

export const TextureC = (({ brush, children }: BrushFunctions<SerializedTextureBrush>) => {
    const _brushTipImage: DrawableState = useMemo(() => createDrawable({ size: [1, 1] }), []);
    const brushTipImageData = useMemo(() => {
        const { ctx, canvas } = _brushTipImage;
        if (!ctx) return;
        ctx.putImageData(deserializeImageData(brush.brushTipImage, canvas, ctx), 0, 0);
        return ctx.getImageData(0, 0, canvas.width, canvas.height);
    }, [brush.brushTipImage, _brushTipImage]);
    const textureWith = Math.max(brushTipImageData?.width || 1, brushTipImageData?.height || 1);

    const spacing = useMemo(()=>Math.max(brush.spacing, .5), [brush]);
    const r = useMemo<Renderer>(() => {
        const texture = _brushTipImage.canvas;
        const { width: sWidth, height: sHeight } = texture;
        let dWidth = 1, dHeight = 1;
        return {
            drawLine(bufferCtx, line, width, offset, preview){
                if(preview){
                    const[, [x, y]] = line;
                    bufferCtx.drawImage(texture, 0, 0, sWidth, sHeight, x - dWidth / 2, y - dHeight / 2, dWidth, dHeight);
                    return;
                }
                const [lastPoint, point] = line;
                const [x0, y0] = lastPoint;
                const [xf, yf] = point;
                const strokeLength = distance2d(...line);
                const iterations = Math.floor((offset+strokeLength)/spacing);
                for (let i = 0; i < iterations; i++) {
                    const t = ((i+1)*spacing - offset)/strokeLength;
                    const
                        x = x0 + (xf-x0)*t,
                        y = y0 + (yf-y0)*t;
                    bufferCtx.drawImage(texture, 0, 0, sWidth, sHeight, x - dWidth / 2, y - dHeight / 2, dWidth, dHeight);
                }
            },
            drawBezier(bufferCtx, bezier, width, offset, preview){
                if(preview){
                    const[,,, [x, y]] = bezier;
                    bufferCtx.drawImage(texture, 0, 0, sWidth, sHeight, x - dWidth / 2, y - dHeight / 2, dWidth, dHeight);
                    return;
                }
                const strokeLength = bezierArcLength(bezier);
                const iterations = Math.floor((offset+strokeLength)/spacing);
                const steps = Math.max(Math.floor(strokeLength/10), 1);
                let [point] = bezier;
                let currentLength = 0;
                let step = 1;
                let vec:Point;
                let lastPoint:Point =[0, 0];
                for (let i = 0; i < iterations; i++) {
                    const targetLength = (i+1)*spacing - offset;
                    while (currentLength <= targetLength) {
                        lastPoint = point;
                        point = calculateBezierPoint(bezier, step/steps);
                        vec = difference(lastPoint, point);
                        currentLength += length(vec);
                        step++;
                    }
                    const [x0, y0] = point;
                    const [xf, yf] = lastPoint;
                    const segmentLength = distance2d(point, lastPoint);
                    const t = (currentLength - targetLength)/segmentLength;
                    const
                        x = x0 + (xf-x0)*t,
                        y = y0 + (yf-y0)*t;
                    bufferCtx.drawImage(texture, 0, 0, sWidth, sHeight, x - dWidth / 2, y - dHeight / 2, dWidth, dHeight);
                }
            },
            setup(drawable, buffer, previewBuffer, [x, y], color, alpha, width){
                const { ctx } = drawable;
                const { ctx: bufferCtx } = buffer;
                const { ctx: previewCtx } = previewBuffer;
                const { ctx: brushTipCtx, canvas: brushTipCanvas } = _brushTipImage;
                if (!ctx || !bufferCtx || !previewCtx || !brushTipCtx) return;
                brushTipCtx.fillStyle = color;
                ctx.globalCompositeOperation = 'source-over';
                bufferCtx.globalCompositeOperation = 'source-over';
                previewCtx.globalCompositeOperation = 'source-over';
                brushTipCtx.globalCompositeOperation = 'source-in';
                brushTipCtx.fillRect(0, 0, brushTipCanvas.width, brushTipCanvas.height);
                ctx.globalAlpha = alpha;
                dWidth = sWidth * width / textureWith;
                dHeight = sHeight * width / textureWith;
                if(!brush.antiAliasing){
                    bufferCtx.filter = 'url(#no-anti-aliasing)';
                    previewCtx.filter = 'url(#no-anti-aliasing)';
                }
                bufferCtx.drawImage(texture, 0, 0, sWidth, sHeight, x - dWidth / 2, y - dHeight / 2, dWidth, dHeight);
            }
        };
    }, [_brushTipImage, brush.antiAliasing, spacing, textureWith]);
    return <AbstractSmoothSpacing brush={brush} renderer={r}>
        {children}
    </AbstractSmoothSpacing>;
});
