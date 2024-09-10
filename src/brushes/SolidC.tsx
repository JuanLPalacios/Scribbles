import { useMemo, useState } from 'react';
import { createDrawable } from '../generators/createDrawable';
import { createBezier, createPerpendicularVector } from '../lib/DOMMath';
import { DrawableState } from '../types/DrawableState';
import { Point } from '../types/Point';
import { Serialized } from '../lib/Serialization';
import { SerializedSolidBrush } from './Solid';
import { SerializedTextureBrush } from './TextureBrush';
import { SerializedImage } from './SerializedOject';
import { BrushList } from '../lib/BrushList';

type IsSerialized<S extends Serialized> = S;

type BrushFunctions<S extends {name:string}> = {
    that:S&{
        renderPreview: (drawable: DrawableState, points: Point[], color: string, alpha: number, width: number) => void;
        startStroke: (drawable: DrawableState, point: Point, color: string, alpha: number, width: number) => void;
        drawStroke: (drawable: DrawableState, point: Point, color: string, alpha: number, width: number) => void;
        endStroke: (drawable: DrawableState, point: Point, color: string, alpha: number, width: number) => void;
    },
    uber:{
        renderPreview: (drawable: DrawableState, points: Point[], color: string, alpha: number, width: number) => void;
        startStroke: (drawable: DrawableState, point: Point, color: string, alpha: number, width: number) => void;
        drawStroke: (drawable: DrawableState, point: Point, color: string, alpha: number, width: number) => void;
        endStroke: (drawable: DrawableState, point: Point, color: string, alpha: number, width: number) => void;
    },
    hooks:{
        setDrawStroke: React.Dispatch<React.SetStateAction<(drawable: DrawableState, point: Point, color: string, alpha: number, width: number) => void>>;
        setEndStroke: React.Dispatch<React.SetStateAction<(drawable: DrawableState, point: Point, color: string, alpha: number, width: number) => void>>;
        setRenderPreview: React.Dispatch<React.SetStateAction<(drawable: DrawableState, points: Point[], color: string, alpha: number, width: number) => void>>;
        setStartStroke: React.Dispatch<React.SetStateAction<(drawable: DrawableState, point: Point, color: string, alpha: number, width: number) => void>>;
    }
}

function preview({ startStroke, drawStroke, endStroke }: { startStroke: (drawable: DrawableState, point: Point, color: string, alpha: number, width: number) => void; drawStroke: (drawable: DrawableState, point: Point, color: string, alpha: number, width: number) => void; endStroke: (drawable: DrawableState, point: Point, color: string, alpha: number, width: number) => void; }) {
    return (drawable: DrawableState, points: Point[], color: string, alpha: number, width: number) => {
        const { canvas, ctx } = drawable;
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        points.forEach((point, i) => {
            if (i === 0) startStroke(drawable, point, color, alpha, width);
            else drawStroke(drawable, point, color, alpha, width);
        });
        endStroke(drawable, points[points.length - 1], color, alpha, width);
    };
}

function BrushHOC<S extends Serialized&{name:string}>(WrappedComponent:React.ComponentType<BrushFunctions<IsSerialized<S>>>){
    const Brush = (props: Serialized&{name:string}) => {
        const [startStroke, setStartStroke] = useState<(drawable:DrawableState, point:Point, color:string, alpha:number, width:number)=>void>(()=>{});
        const [drawStroke, setDrawStroke] = useState<(drawable:DrawableState, point:Point, color:string, alpha:number, width:number)=>void>(()=>{});
        const [endStroke, setEndStroke] = useState<(drawable:DrawableState, point:Point, color:string, alpha:number, width:number)=>void>(()=>{});
        const s = { startStroke, drawStroke, endStroke };
        const [renderPreview, setRenderPreview] = useState(()=>preview({ startStroke, drawStroke, endStroke }));
        const hooks = { setDrawStroke, setEndStroke, setRenderPreview, setStartStroke };
        const t:BrushFunctions<S> = { 'that': { ...props, ...s, renderPreview } as BrushFunctions<S>['that'], uber: { ...s, renderPreview }, hooks };
        return <WrappedComponent {...t} />;
    };

    Brush.displayName = `Brush(${WrappedComponent.displayName || WrappedComponent.name})`;
    return Brush;
}

const DEFAULT_SOLID_BRUSH:SerializedSolidBrush = {
    scribbleBrushType: BrushList.Solid,
    name: 'SolidBrush',
    angle: 0,
    diameter: 1,
    hardness: 1,
    roundness: 1,
    spacing: 300
};

const SolidC = BrushHOC(({ that, hooks: { setDrawStroke, setEndStroke, setRenderPreview, setStartStroke }, uber }:BrushFunctions<SerializedSolidBrush>)=>{
    that = {
        ...that,
        ...DEFAULT_SOLID_BRUSH,
        ...that as Partial<SerializedSolidBrush>,
    };
    const [lastPoint, setLastPoint] = useState<Point >([0, 0]);
    const [lastSegments, setLastSegments] = useState<Point[] >([]);
    const [finished, setFinished] = useState(false);
    const buffer = useMemo(()=>createDrawable({ size: [1, 1] }), []);
    const previewBuffer = useMemo<DrawableState >(()=>createDrawable({ size: [1, 1] }), []);
    const [currentLength, setCurrentLength] = useState(0);
    const strokeAngle = useMemo<Point >(()=>[Math.sin(that.angle*Math.PI/180), -Math.cos(that.angle*Math.PI/180)], [that.angle]);
    const drawSegment = (bufferCtx: CanvasRenderingContext2D, width: number, v1: number[], v2: number[], point: Point)=>{
        bufferCtx.beginPath();
        bufferCtx.moveTo(...lastPoint);
        const previousWidth = bufferCtx.lineWidth;
        bufferCtx.lineWidth = width * (1 - (1 - that.roundness) * (Math.abs(v1[0] * v2[1] - v1[1] * v2[0])) / (Math.sqrt((v2[0] ** 2) + (v2[1] ** 2))));
        bufferCtx.filter = `blur(${~~(width * (1 - that.hardness) / 2)}px)`;
        if (lastSegments.length > 2) {
            drawBezier(previousWidth, bufferCtx);
        }
        else {
            drawLine(bufferCtx, point);
        }
    };

    const drawLine = (bufferCtx: CanvasRenderingContext2D, point: Point)=>{
        bufferCtx.lineTo(...point);
        bufferCtx.stroke();
    };

    const drawBezier = (previousWidth: number, bufferCtx: CanvasRenderingContext2D)=>{
        const [[p0x, p0y], [p1x, p1y], [p2x, p2y], [x, y]] = createBezier(lastSegments);
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
    };
    setStartStroke((drawable:DrawableState, point:Point, color:string, alpha:number, width:number)=>{
        const { ctx, canvas } = drawable;
        const { ctx: bufferCtx, canvas: bufferCanvas } = buffer;
        const { ctx: previewCtx, canvas: previewCanvas } = previewBuffer;
        setFinished(true);
        setCurrentLength(0);
        bufferCanvas.width = canvas.width;
        bufferCanvas.height = canvas.height;
        previewCanvas.width = canvas.width;
        previewCanvas.height = canvas.height;
        if (!ctx || !bufferCtx || !previewCtx) return;
        bufferCtx.lineCap = 'round';
        bufferCtx.lineJoin = 'round';
        bufferCtx.strokeStyle = color;
        bufferCtx.fillStyle = color;
        bufferCtx.lineWidth = width*that.roundness;
        previewCtx.lineCap = 'round';
        previewCtx.lineJoin = 'round';
        previewCtx.strokeStyle = color;
        previewCtx.fillStyle = color;
        previewCtx.lineWidth = width*that.roundness;
        ctx.globalCompositeOperation = 'source-over';
        bufferCtx.globalCompositeOperation = 'source-over';
        previewCtx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = alpha;
        setLastPoint(point);
        setLastSegments([point]);
        bufferCtx.filter = `blur(${~~(width*(1-that.hardness)/2)}px)`;
        bufferCtx.beginPath();
        bufferCtx.moveTo(...point);
        bufferCtx.lineTo(...point);
        previewCtx.filter = `blur(${~~(width*(1-that.hardness)/2)}px)`;
        previewCtx.beginPath();
        previewCtx.moveTo(...point);
        previewCtx.lineTo(...point);
        // FIXME: draw tip shape to create the illusion of the more complex brush
        bufferCtx.stroke();
        previewCtx.stroke();
        ctx.drawImage(bufferCanvas, 0, 0);
    });

    setDrawStroke((drawable:DrawableState, point:Point, _color:string, _alpha:number, width:number)=>{
        const { ctx, canvas } = drawable;
        const { ctx: bufferCtx, canvas: bufferCanvas } = buffer;
        const { ctx: previewCtx, canvas: previewCanvas } = previewBuffer;
        const v2 = [point[0]-lastPoint[0],  point[1]-lastPoint[1]];
        const v1 = strokeAngle;
        setFinished(false);
        lastSegments.push(point);
        if (!ctx || !bufferCtx || !previewCtx) return;
        setCurrentLength(currentLength + Math.abs(Math.sqrt((point[0]-lastPoint[0])**2+(point[1]-lastPoint[1])**2)));
        if (currentLength<that.spacing) {
            previewCtx.clearRect(0, 0, canvas.width, canvas.height);
            previewCtx.drawImage(bufferCanvas, 0, 0);
            drawSegment(previewCtx, width, v1, v2, point);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(previewCanvas, 0, 0);
            return;
        }
        setCurrentLength(0);
        drawSegment(bufferCtx, width, v1, v2, point);
        setFinished(true);
        setLastPoint(point);
        setLastSegments([point]);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(bufferCanvas, 0, 0);
    });

    setEndStroke((drawable:DrawableState, point:Point, color:string, alpha:number, width:number)=>{
        const { ctx, } = drawable;
        if(!finished) {
            const temp = that.spacing;
            that.spacing = 0;
            that.drawStroke(drawable, point, color, alpha, width);
            that.spacing = temp;
        }
        // FIXME: draw tip shape to create the illusion of the more complex brush
        ctx?.restore();
    });
    return <></>;
});

export default SolidC;

const DEFAULT_TEXTURE_BRUSH:SerializedTextureBrush = {
    scribbleBrushType: BrushList.Texture,
    name: 'TextureBrush',
    brushTipImage: {
        type: 'img',
        value: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUAQMAAAC3R49OAAAC4npUWHRSYXcgcHJvZmlsZSB0eXBlIGV4aWYAAHja7ZdRkusoDEX/WcUsAUkIieVgA1VvB7P8uWDi7qT7TdV0vY/5iCkbW5GvhA6QJPS/f43wFw4qwiGpeS45RxyppMIVNx6v4+oppnW9HtL+jJ7t4f6AYRL0cj3mvv0r7Prxgm1/Op7twc6t41uIbuF1yIw879tOcgsJX/ZHIqHsF2r+NJx98rllt/jrczIUoyn0UCPuQhLXla9IMs8kFb3jSuJwjMuStsW+1i/cpfumgPfdS/3iIzP5KMcl9BhWfqnTtpO+2OUOw08ZEd+R+XNGJneIL/Ubo/kY/RpdTTmgXHkP6jGUdQfHA+WU9VpGM5yKe1utoHms8QS1hqEeIR54KMSo+KBEjSoN6qs/6USKiTsbeuaTZdlcjAufAEAoPxoNtiBFGliwnCAnMPOdC624ZcZDMEfkRvBkghgYP7fwavhpexIaY05zouh3rZAXz/mFNCa5eYUXgNDYNdVVXwpXF1+PCVZAUFeZHQOs8bgkDqWPuSWLs0QNcE3xWi9kbQugRIitSIYEBGImUcoUjdmIUEcHn4rMsQT4AAHSoNyQJSeRDDhYDYiNd4yWLytfZmwvAKGSxYCmSAWslDRlrDfHFKpBRZOqZjV1LVqz5JQ152x57lPVxJKpZTNzK1ZdPLl6dnP34rVwEWxjGkouVryUUiuC1lShVeFfYTj4kCMdeuTDDj/KUU9MnzOdeubTTj/LWRs3adgCQsvNmrfSaqeOqdRT1567de+l14G5NmSkoSMPGz7KqDe1TfWZ2iu5f6dGmxovUNPPPqjBbPaQoLmd6GQGYpwIxG0SwITmySw6pcST3GQWC0sQUUaWOuE0msRAMHViHXSz+yD3W24B1f2v3Pg7cmGi+xPkwkT3idxXbt9Qa3Vtt7IAzVWImmKHFCw/OHSv7HV+L/2oDz998S30FnoLvYXeQm+ht9D/U2jgx0PB36l/APhNkfqI954AAAABhGlDQ1BJQ0MgcHJvZmlsZQAAeJx9kT1Iw0AcxV9TxSoVQTuIOGSoTi2IijhKFYtgobQVWnUwufQLmjQkKS6OgmvBwY/FqoOLs64OroIg+AHi7OCk6CIl/i8ptIjx4Lgf7+497t4BQqPCVLNrAlA1y0jFY2I2tyr2vCKAQfQigoDETD2RXszAc3zdw8fXuyjP8j735+hX8iYDfCLxHNMNi3iDeGbT0jnvE4dYSVKIz4kjBl2Q+JHrsstvnIsOCzwzZGRS88QhYrHYwXIHs5KhEk8ThxVVo3wh67LCeYuzWqmx1j35C4N5bSXNdZqjiGMJCSQhQkYNZVRgIUqrRoqJFO3HPPwjjj9JLplcZTByLKAKFZLjB/+D392ahalJNykYA7pfbPtjDOjZBZp12/4+tu3mCeB/Bq60tr/aAGY/Sa+3tfARMLANXFy3NXkPuNwBhp90yZAcyU9TKBSA9zP6phwwdAv0rbm9tfZx+gBkqKvlG+DgEBgvUva6x7sDnb39e6bV3w9t73Kl1q8legAAAAZQTFRFaW5kAAAAGNpOJQAAAAF0Uk5TAEDm2GYAAAABYktHRACIBR1IAAAACXBIWXMAAC4jAAAuIwF4pT92AAAAB3RJTUUH6AgSCTARRoTKFAAAAC5JREFUCNdjYPzBwMD+j4FB/n8Dg/3/A2Bc//8BGP///wErhsnD1IP0gswAmgUAlioqPY22sLYAAAAASUVORK5CYII='
    },
    spacing: 0,
    antiAliasing: true,
};

export const  TextureC = BrushHOC(({ that, hooks: { setDrawStroke, setEndStroke, setRenderPreview, setStartStroke }, uber }:BrushFunctions<SerializedTextureBrush>)=>{
    that = {
        ...that,
        ...DEFAULT_TEXTURE_BRUSH,
        ...that as Partial<SerializedTextureBrush>,
    };
    let thatimg:HTMLImageElement|undefined;
    let thatlastPoint:Point = [0, 0];
    let thatlastSegments:Point[] = [];
    let thatfinished = false;
    const thatbuffer:DrawableState = createDrawable({ size: [1, 1] });
    const thatpreviewBuffer:DrawableState = createDrawable({ size: [1, 1] });
    let thatcurrentLength = 0;
    let thattextureWith = 20;
    const that_brushTipImage:DrawableState = createDrawable({ size: [1, 1] });
    const setBrushTipImage = ()=>{
        const { ctx, canvas } = that_brushTipImage;
        if(!ctx) return;
        const img = new Image;
        thatimg = img;
        img.addEventListener('load', ()=>{
            canvas.width = 0; //forces the canvas to clear
            canvas.width = img.width;
            canvas.height = img.height;
            thattextureWith = Math.max(img.width, img.height);
            ctx.globalCompositeOperation = 'source-over';
            ctx.drawImage(img, 0, 0);
            thatimg = undefined;
        });
        img.src = that.brushTipImage.value;
    };
    setBrushTipImage();
    function drawSegment(bufferCtx: CanvasRenderingContext2D, width: number, [x, y]: Point) {
        const texture = that_brushTipImage.canvas;
        const { width: sWidth, height: sHeight } = texture;
        const dWidth=sWidth*width/thattextureWith, dHeight = sHeight*width/thattextureWith;
        bufferCtx.drawImage(texture, 0, 0, sWidth, sHeight, x-dWidth/2, y-dHeight/2, dWidth, dHeight);
    }
    setStartStroke((drawable:DrawableState, point:Point, color:string, alpha:number, width:number)=>{
        const { ctx, canvas } = drawable;
        const { ctx: bufferCtx, canvas: buffer } = thatbuffer;
        const { ctx: previewCtx, canvas: preview } = thatpreviewBuffer;
        const { ctx: brushTipCtx, canvas: brushTip } = that_brushTipImage;
        thatfinished = true;
        thatcurrentLength = 0;
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
        thatlastPoint = point;
        thatlastSegments = [point];
        ctx.drawImage(buffer, 0, 0);
    });

    setDrawStroke((drawable:DrawableState, point:Point, color:string, alpha:number, width:number)=>{
        const { ctx, canvas } = drawable;
        const { ctx: bufferCtx, canvas: buffer } = thatbuffer;
        const { ctx: previewCtx, canvas: preview } = thatpreviewBuffer;
        thatfinished = false;
        thatlastSegments.push(point);
        if (!ctx || !bufferCtx || !previewCtx) return;
        thatcurrentLength += Math.abs(Math.sqrt((point[0]-thatlastPoint[0])**2+(point[1]-thatlastPoint[1])**2));
        if (thatcurrentLength<that.spacing) {
            previewCtx.clearRect(0, 0, canvas.width, canvas.height);
            previewCtx.drawImage(buffer, 0, 0);
            drawSegment(previewCtx, width, point);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(preview, 0, 0);
            return;
        }
        thatcurrentLength = 0;
        drawSegment(bufferCtx, width, point);
        thatfinished = true;
        thatlastPoint = point;
        thatlastSegments = [point];
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(buffer, 0, 0);
    });

    setEndStroke((drawable:DrawableState, point:Point, color:string, alpha:number, width:number)=>{
        const { ctx, } = drawable;
        if(!thatfinished) {
            const temp = that.spacing;
            that.spacing = 0;
            that.drawStroke(drawable, point, color, alpha, width);
            that.spacing = temp;
        }
        // FIXME: draw tip shape to create the illusion of the more complex brush
        ctx?.restore();
    });

    setRenderPreview((...params:[DrawableState, Point[], string, number, number])=>{
        uber.renderPreview(...params);
        thatimg?.addEventListener('load', ()=>{
            uber.renderPreview(...params);
        });
    });
    return <></>;
});

