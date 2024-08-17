import Brush from '../abstracts/Brush';
import { createDrawable } from '../generators/createDrawable';
import { BrushList } from '../lib/BrushList';
import { DrawableState } from '../types/DrawableState';
import { Point } from '../types/Point';

type SerializedTextureBrush ={
    scribbleBrushType: BrushList.Texture,
    name:string
    spacing: number;
    antiAliasing: boolean;
    brushTipImage: HTMLCanvasElement;
}

export default class TextureBrush extends Brush {
    lastPoint:Point = [0, 0];
    segments:[Point, Point][] = [];
    lastSegments:Point[] = [];
    finished = false;
    buffer:DrawableState = createDrawable({ size: [1, 1] });
    previewBuffer:DrawableState = createDrawable({ size: [1, 1] });
    currentLength = 0;
    name = 'Texture';
    spacing = 15;
    antiAliasing = false;
    brushTipImage:DrawableState = createDrawable({ size: [1, 1] });
    startStroke(drawable:DrawableState, point:Point, color:string, alpha:number, width:number) {
        const { ctx, canvas } = drawable;
        const { ctx: bufferCtx, canvas: buffer } = this.buffer;
        const { ctx: previewCtx, canvas: preview } = this.previewBuffer;
        this.finished = true;
        this.currentLength = 0;
        buffer.width = canvas.width;
        buffer.height = canvas.height;
        preview.width = canvas.width;
        preview.height = canvas.height;
        if (!ctx || !bufferCtx || !previewCtx) return;
        bufferCtx.fillStyle = color;
        previewCtx.strokeStyle = color;
        previewCtx.fillStyle = color;
        ctx.globalCompositeOperation = 'source-over';
        bufferCtx.globalCompositeOperation = 'source-over';
        previewCtx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = alpha;
        this.lastPoint = point;
        this.lastSegments = [point];
        bufferCtx.beginPath();
        bufferCtx.moveTo(...point);
        bufferCtx.lineTo(...point);
        previewCtx.beginPath();
        previewCtx.moveTo(...point);
        previewCtx.lineTo(...point);
        // FIXME: draw tip shape to create the illusion of the more complex brush
        bufferCtx.stroke();
        previewCtx.stroke();
        ctx.drawImage(buffer, 0, 0);
    }

    drawStroke(drawable:DrawableState, point:Point, color:string, alpha:number, width:number) {
        const { ctx, canvas } = drawable;
        const { ctx: bufferCtx, canvas: buffer } = this.buffer;
        const { ctx: previewCtx, canvas: preview } = this.previewBuffer;
        this.finished = false;
        this.lastSegments.push(point);
        if (!ctx || !bufferCtx || !previewCtx) return;
        this.currentLength += Math.abs(Math.sqrt((point[0]-this.lastPoint[0])**2+(point[1]-this.lastPoint[1])**2));
        if (this.currentLength<this.spacing) {
            previewCtx.clearRect(0, 0, canvas.width, canvas.height);
            previewCtx.drawImage(buffer, 0, 0);
            this.drawSegment(previewCtx, width, point);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(preview, 0, 0);
            return;
        }
        this.currentLength = 0;
        this.drawSegment(bufferCtx, width, point);
        this.finished = true;
        this.lastPoint = point;
        this.lastSegments = [point];
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(buffer, 0, 0);
    }

    private drawSegment(bufferCtx: CanvasRenderingContext2D, width: number, [x, y]: Point) {
        const texture = this.brushTipImage.canvas;
        const { width: sWidth, height: sHeight } = texture;
        const dWidth=sWidth*width/10, dHeight = sHeight*width/10;
        bufferCtx.drawImage(texture, 0, 0, sWidth, sHeight, x-dWidth/2, y-dHeight/2, dWidth, dHeight);
    }

    endStroke(drawable:DrawableState, point:Point, color:string, alpha:number, width:number) {
        const { ctx, } = drawable;
        if(!this.finished) {
            const temp = this.spacing;
            this.spacing = 0;
            this.drawStroke(drawable, point, color, alpha, width);
            this.spacing = temp;
        }
        // FIXME: draw tip shape to create the illusion of the more complex brush
        ctx?.restore();
    }

    toObj(): SerializedTextureBrush {
        const { name, antiAliasing, brushTipImage, spacing } = this;
        return { scribbleBrushType: BrushList.Texture,
            name,
            antiAliasing,
            brushTipImage: brushTipImage.canvas,
            spacing,
        };
    }

    loadObj({ name, antiAliasing, brushTipImage, spacing }:SerializedTextureBrush) {
        this.name = name;
        this.antiAliasing = antiAliasing;
        const { canvas, ctx } = this.brushTipImage;
        canvas.width = brushTipImage.width;
        canvas.height = brushTipImage.height;
        ctx?.drawImage(brushTipImage, 0, 0);
        this.spacing = spacing;
    }

    static formObj(data:SerializedTextureBrush):TextureBrush {
        return new TextureBrush();
    }
}
