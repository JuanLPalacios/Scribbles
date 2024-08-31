import Brush from '../abstracts/Brush';
import { createDrawable } from '../generators/createDrawable';
import { BrushList } from '../lib/BrushList';
import { DrawableState } from '../types/DrawableState';
import { Point } from '../types/Point';
import { SerializedImage } from './SerializedOject';

export type SerializedTextureBrush = {
    scribbleBrushType: BrushList.Texture,
    name:string
    spacing: number;
    antiAliasing: boolean;
    brushTipImage: SerializedImage;
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
    textureWith = 20;
    spacing = 0;
    antiAliasing = false;
    _brushTipImage:DrawableState = createDrawable({ size: [1, 1] });
    public get brushTipImage(){
        return { type: 'img', value: this._brushTipImage.canvas.toDataURL() };
    }
    public set brushTipImage(value:SerializedImage){
        const { ctx, canvas } = this._brushTipImage;
        if(!ctx) return;
        const img = new Image;
        img.onload = ()=>{
            canvas.width = 0; //forces the canvas to clear
            canvas.width = img.width;
            canvas.height = img.height;
            this.textureWith = Math.max(img.width, img.height);
            ctx.globalCompositeOperation = 'source-over';
            ctx.drawImage(img, 0, 0);
        };
        img.src = value.value;
    }

    constructor(){
        super();
        this.brushTipImage = { type: 'img', value: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUAQMAAAC3R49OAAAC4npUWHRSYXcgcHJvZmlsZSB0eXBlIGV4aWYAAHja7ZdRkusoDEX/WcUsAUkIieVgA1VvB7P8uWDi7qT7TdV0vY/5iCkbW5GvhA6QJPS/f43wFw4qwiGpeS45RxyppMIVNx6v4+oppnW9HtL+jJ7t4f6AYRL0cj3mvv0r7Prxgm1/Op7twc6t41uIbuF1yIw879tOcgsJX/ZHIqHsF2r+NJx98rllt/jrczIUoyn0UCPuQhLXla9IMs8kFb3jSuJwjMuStsW+1i/cpfumgPfdS/3iIzP5KMcl9BhWfqnTtpO+2OUOw08ZEd+R+XNGJneIL/Ubo/kY/RpdTTmgXHkP6jGUdQfHA+WU9VpGM5yKe1utoHms8QS1hqEeIR54KMSo+KBEjSoN6qs/6USKiTsbeuaTZdlcjAufAEAoPxoNtiBFGliwnCAnMPOdC624ZcZDMEfkRvBkghgYP7fwavhpexIaY05zouh3rZAXz/mFNCa5eYUXgNDYNdVVXwpXF1+PCVZAUFeZHQOs8bgkDqWPuSWLs0QNcE3xWi9kbQugRIitSIYEBGImUcoUjdmIUEcHn4rMsQT4AAHSoNyQJSeRDDhYDYiNd4yWLytfZmwvAKGSxYCmSAWslDRlrDfHFKpBRZOqZjV1LVqz5JQ152x57lPVxJKpZTNzK1ZdPLl6dnP34rVwEWxjGkouVryUUiuC1lShVeFfYTj4kCMdeuTDDj/KUU9MnzOdeubTTj/LWRs3adgCQsvNmrfSaqeOqdRT1567de+l14G5NmSkoSMPGz7KqDe1TfWZ2iu5f6dGmxovUNPPPqjBbPaQoLmd6GQGYpwIxG0SwITmySw6pcST3GQWC0sQUUaWOuE0msRAMHViHXSz+yD3W24B1f2v3Pg7cmGi+xPkwkT3idxXbt9Qa3Vtt7IAzVWImmKHFCw/OHSv7HV+L/2oDz998S30FnoLvYXeQm+ht9D/U2jgx0PB36l/APhNkfqI954AAAABhGlDQ1BJQ0MgcHJvZmlsZQAAeJx9kT1Iw0AcxV9TxSoVQTuIOGSoTi2IijhKFYtgobQVWnUwufQLmjQkKS6OgmvBwY/FqoOLs64OroIg+AHi7OCk6CIl/i8ptIjx4Lgf7+497t4BQqPCVLNrAlA1y0jFY2I2tyr2vCKAQfQigoDETD2RXszAc3zdw8fXuyjP8j735+hX8iYDfCLxHNMNi3iDeGbT0jnvE4dYSVKIz4kjBl2Q+JHrsstvnIsOCzwzZGRS88QhYrHYwXIHs5KhEk8ThxVVo3wh67LCeYuzWqmx1j35C4N5bSXNdZqjiGMJCSQhQkYNZVRgIUqrRoqJFO3HPPwjjj9JLplcZTByLKAKFZLjB/+D392ahalJNykYA7pfbPtjDOjZBZp12/4+tu3mCeB/Bq60tr/aAGY/Sa+3tfARMLANXFy3NXkPuNwBhp90yZAcyU9TKBSA9zP6phwwdAv0rbm9tfZx+gBkqKvlG+DgEBgvUva6x7sDnb39e6bV3w9t73Kl1q8legAAAAZQTFRFaW5kAAAAGNpOJQAAAAF0Uk5TAEDm2GYAAAABYktHRACIBR1IAAAACXBIWXMAAC4jAAAuIwF4pT92AAAAB3RJTUUH6AgSCTARRoTKFAAAAC5JREFUCNdjYPzBwMD+j4FB/n8Dg/3/A2Bc//8BGP///wErhsnD1IP0gswAmgUAlioqPY22sLYAAAAASUVORK5CYII=' };
    }

    startStroke(drawable:DrawableState, point:Point, color:string, alpha:number, width:number) {
        const { ctx, canvas } = drawable;
        const { ctx: bufferCtx, canvas: buffer } = this.buffer;
        const { ctx: previewCtx, canvas: preview } = this.previewBuffer;
        const { ctx: brushTipCtx, canvas: brushTip } = this._brushTipImage;
        this.finished = true;
        this.currentLength = 0;
        buffer.width = canvas.width;
        buffer.height = canvas.height;
        preview.width = canvas.width;
        preview.height = canvas.height;
        if (!ctx || !bufferCtx || !previewCtx || !brushTipCtx) return;
        brushTipCtx.fillStyle = color;
        ctx.globalCompositeOperation = 'source-over';
        bufferCtx.globalCompositeOperation = 'source-over';
        previewCtx.globalCompositeOperation = 'source-over';
        brushTipCtx.globalCompositeOperation = 'source-in';
        brushTipCtx.fillRect(0, 0, brushTip.width, brushTip.height);
        ctx.globalAlpha = alpha;
        this.lastPoint = point;
        this.lastSegments = [point];
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
        const texture = this._brushTipImage.canvas;
        const { textureWith } = this;
        const { width: sWidth, height: sHeight } = texture;
        const dWidth=sWidth*width/textureWith, dHeight = sHeight*width/textureWith;
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
        const { name, antiAliasing, brushTipImage: brushTipImage, spacing } = this;
        return { scribbleBrushType: BrushList.Texture,
            name,
            antiAliasing,
            brushTipImage,
            spacing,
        };
    }

    loadObj({ name, antiAliasing, brushTipImage, spacing }:SerializedTextureBrush) {
        this.name = name;
        this.antiAliasing = antiAliasing;
        this.brushTipImage = brushTipImage;
        this.spacing = spacing;
    }

    static formObj(data:SerializedTextureBrush):TextureBrush {
        const brush = new TextureBrush();
        brush.loadObj(data);
        return brush;
    }
}
