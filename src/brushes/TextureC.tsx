import { useMemo } from 'react';
import { BrushFunctions, BrushRenderer } from '../contexts/BrushRendererContext';
import { createDrawable } from '../generators/createDrawable';
import { deserializeImageData } from '../lib/serializeJSON';
import { DrawableState } from '../types/DrawableState';
import { Point } from '../types/Point';
import { BrushRendererContext } from '../contexts/BrushRendererContext';
import { BrushList } from '../lib/BrushList';
import { SerializedImageData } from '../types/SerializedImageData';

export type SerializedTextureBrush = {
    scribbleBrushType: BrushList.Texture,
    name:string
    spacing: number;
    antiAliasing: boolean;
    brushTipImage: SerializedImageData;
}

export const TextureC = (({ brush, children }: BrushFunctions<SerializedTextureBrush>) => {
    const that_brushTipImage: DrawableState = useMemo(() => createDrawable({ size: [1, 1] }), []);
    const brushTipImageData = useMemo(() => {
        const { ctx, canvas } = that_brushTipImage;
        if (!ctx) return;
        ctx.putImageData(deserializeImageData(brush.brushTipImage, canvas, ctx), 0, 0);
        return ctx.getImageData(0, 0, canvas.width, canvas.height);
    }, [brush.brushTipImage, that_brushTipImage]);
    const buffer: DrawableState = useMemo(() => createDrawable({ size: [1, 1] }), []);
    const preview: DrawableState = useMemo(() => createDrawable({ size: [1, 1] }), []);
    const textureWith = Math.max(brushTipImageData?.width || 1, brushTipImageData?.height || 1);

    const r = useMemo<BrushRenderer>(() => {
        let lastPoint: Point = [0, 0];
        let lastSegments: Point[] = [];
        let finished = false;
        let currentLength = 0;
        function drawSegment(bufferCtx: CanvasRenderingContext2D, width: number, [xf, yf]: Point, length:number) {
            const [x0, y0] = lastPoint;
            const spacing = (brush.spacing!=0)?brush.spacing:0.5;
            const dSpacing = currentLength-length;
            const iterations = Math.floor(currentLength/spacing);
            for (let i = 0; i < iterations; i++) {
                const
                    x = x0 + (xf-x0)*(i*spacing + dSpacing)/length,
                    y = y0 + (yf-y0)*(i*spacing + dSpacing)/length;
                const texture = that_brushTipImage.canvas;
                const { width: sWidth, height: sHeight } = texture;
                const dWidth = sWidth * width / textureWith, dHeight = sHeight * width / textureWith;
                bufferCtx.drawImage(texture, 0, 0, sWidth, sHeight, x - dWidth / 2, y - dHeight / 2, dWidth, dHeight);
            }
        }
        const startStroke = (drawable: DrawableState, point: Point, color: string, alpha: number) => {
            const { ctx, canvas } = drawable;
            const { ctx: bufferCtx, canvas: bufferCanvas } = buffer;
            const { ctx: previewCtx, canvas: previewCanvas } = preview;
            const { ctx: brushTipCtx, canvas: brushTipCanvas } = that_brushTipImage;
            finished = true;
            currentLength = 0;
            bufferCanvas.width = canvas.width;
            bufferCanvas.height = canvas.height;
            previewCanvas.width = canvas.width;
            previewCanvas.height = canvas.height;
            if (!ctx || !bufferCtx || !previewCtx || !brushTipCtx) return;
            brushTipCtx.fillStyle = color;
            ctx.globalCompositeOperation = 'source-over';
            bufferCtx.globalCompositeOperation = 'source-over';
            previewCtx.globalCompositeOperation = 'source-over';
            brushTipCtx.globalCompositeOperation = 'source-in';
            brushTipCtx.fillRect(0, 0, brushTipCanvas.width, brushTipCanvas.height);
            ctx.globalAlpha = alpha;
            lastPoint = point;
            lastSegments = [point];
            ctx.drawImage(bufferCanvas, 0, 0);
        };

        const drawStroke = (drawable: DrawableState, point: Point, _color: string, _alpha: number, width: number) => {
            const { ctx, canvas } = drawable;
            const { ctx: bufferCtx, canvas: bufferCanvas } = buffer;
            const { ctx: previewCtx, canvas: previewCanvas } = preview;
            finished = false;
            lastSegments.push(point);
            if (!ctx || !bufferCtx || !previewCtx) return;
            const length = Math.abs(Math.sqrt((point[0] - lastPoint[0]) ** 2 + (point[1] - lastPoint[1]) ** 2));
            currentLength += length;
            if (currentLength < brush.spacing) {
                previewCtx.clearRect(0, 0, canvas.width, canvas.height);
                previewCtx.drawImage(bufferCanvas, 0, 0);
                drawSegment(previewCtx, width, point, length);
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(previewCanvas, 0, 0);
                return;
            }
            drawSegment(bufferCtx, width, point, length);
            currentLength = 0;
            finished = true;
            lastPoint = point;
            lastSegments = [point];
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(bufferCanvas, 0, 0);
        };

        const endStroke = (drawable: DrawableState, point: Point, color: string, alpha: number, width: number) => {
            const { ctx, } = drawable;
            if (!finished) {
                const temp = brush.spacing;
                brush.spacing = 0;
                drawStroke(drawable, point, color, alpha, width);
                brush.spacing = temp;
            }
            ctx?.restore();
        };
        return { drawStroke, endStroke, startStroke };
    }, [brush, that_brushTipImage, buffer, preview, textureWith]);
    return <BrushRendererContext.Provider value={r}>
        {children}
    </BrushRendererContext.Provider>;
});
