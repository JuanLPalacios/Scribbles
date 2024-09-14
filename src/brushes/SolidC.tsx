import { createContext, ReactNode, useContext, useMemo } from 'react';
import { createDrawable } from '../generators/createDrawable';
import { createBezier, createPerpendicularVector, scalePoint } from '../lib/DOMMath';
import { DrawableState } from '../types/DrawableState';
import { Point } from '../types/Point';
import { Serialized, SerializedBrush } from '../lib/Serialization';
import { parseSerializedJSON, deserializeImageData } from '../lib/serializeJSON';
import { SerializedSolidBrush } from './Solid';
import { SerializedTextureBrush } from './TextureBrush';
import { BrushList } from '../lib/BrushList';
import { SerializedMarkerBrush } from './Marker';
import { SerializedStiffBrush } from './StiffBrush';

type IsSerialized<S extends Serialized&{name:string, scribbleBrushType:number}> = S;

type BrushRenderer = {
        startStroke: (drawable: DrawableState, point: Point, color: string, alpha: number, width: number) => void;
        drawStroke: (drawable: DrawableState, point: Point, color: string, alpha: number, width: number) => void;
        endStroke: (drawable: DrawableState, point: Point, color: string, alpha: number, width: number) => void;
    };

export const BrushRendererContext = createContext<BrushRenderer>({ drawStroke: ()=>{}, endStroke: ()=>{}, startStroke: ()=>{} });

type BrushFunctions<S extends {name:string}> = {
    that:S
    children: ReactNode
}
type BrushPair<S extends Serialized&{name:string, scribbleBrushType:number}> = [(props: BrushFunctions<any>)=> ReactNode, S];

export const useBrush = ()=>useContext(BrushRendererContext);

function BrushMaper<S extends Serialized&{name:string, scribbleBrushType:number}>(list:BrushPair<IsSerialized<S>>[]){
    const Brush = ({ that, children }: BrushFunctions<Serialized&{name:string, scribbleBrushType:number}>) => {
        const [WrappedComponent, defaultThat] = useMemo(()=>{
            const i = list.findIndex(x=>x[1].scribbleBrushType==that.scribbleBrushType);
            return list[i];
        }, [that.scribbleBrushType]);
        const memo = useMemo(()=>({ ...defaultThat, ...that }), [defaultThat, that]);
        return <WrappedComponent that={memo} >{children}</WrappedComponent>;
    };

    Brush.displayName = `Brush(${list.map(([WrappedComponent])=>`Brush(${WrappedComponent.name})`).join('|')})`;
    return Brush;
}

export const SolidC = (({ that, children }:BrushFunctions<SerializedSolidBrush>)=>{
    console.log('SolidC');
    let lastPoint:Point =  [0, 0];
    let lastSegments:Point[] =  [];
    let finished = false;
    const buffer = createDrawable({ size: [1, 1] });
    const previewBuffer:DrawableState = createDrawable({ size: [1, 1] });
    let currentLength = 0;
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
    const startStroke = useMemo(()=>(drawable:DrawableState, point:Point, color:string, alpha:number, width:number)=>{
        const { ctx, canvas } = drawable;
        const { ctx: bufferCtx, canvas: bufferCanvas } = buffer;
        const { ctx: previewCtx, canvas: previewCanvas } = previewBuffer;
        finished = true;
        currentLength = 0;
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
        lastPoint = point;
        lastSegments = [point];
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
    }, []);

    const drawStroke = useMemo(()=>(drawable:DrawableState, point:Point, _color:string, _alpha:number, width:number)=>{
        const { ctx, canvas } = drawable;
        const { ctx: bufferCtx, canvas: bufferCanvas } = buffer;
        const { ctx: previewCtx, canvas: previewCanvas } = previewBuffer;
        const v2 = [point[0]-lastPoint[0],  point[1]-lastPoint[1]];
        const v1 = strokeAngle;
        finished = false;
        lastSegments.push(point);
        if (!ctx || !bufferCtx || !previewCtx) return;
        currentLength = currentLength + Math.abs(Math.sqrt((point[0]-lastPoint[0])**2+(point[1]-lastPoint[1])**2));
        if (currentLength<that.spacing) {
            previewCtx.clearRect(0, 0, canvas.width, canvas.height);
            previewCtx.drawImage(bufferCanvas, 0, 0);
            drawSegment(previewCtx, width, v1, v2, point);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(previewCanvas, 0, 0);
            return;
        }
        currentLength = 0;
        drawSegment(bufferCtx, width, v1, v2, point);
        finished = true;
        lastPoint = point;
        lastSegments = [point];
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(bufferCanvas, 0, 0);
    }, []);

    const endStroke = useMemo(()=>(drawable:DrawableState, point:Point, color:string, alpha:number, width:number)=>{
        const { ctx, } = drawable;
        if(!finished) {
            const temp = that.spacing;
            that.spacing = 0;
            drawStroke(drawable, point, color, alpha, width);
            that.spacing = temp;
        }
        // FIXME: draw tip shape to create the illusion of the more complex brush
        ctx?.restore();
    }, [finished, that]);
    const v = useMemo(()=>({ drawStroke, endStroke, startStroke }), [drawStroke, endStroke, startStroke]);
    return <BrushRendererContext.Provider value={v}>
        {children}
    </BrushRendererContext.Provider>;
});

export const  TextureC = (({ that, children }:BrushFunctions<SerializedTextureBrush>)=>{
    console.log('TextureC');
    const that_brushTipImage:DrawableState = useMemo(()=>createDrawable({ size: [1, 1] }), []);
    const brushTipImageData = useMemo(()=>{
        const { ctx, canvas } = that_brushTipImage;
        if(!ctx) return;
        ctx.putImageData(deserializeImageData(that.brushTipImage, canvas, ctx), 0, 0);
        return ctx.getImageData(0, 0, canvas.width, canvas.height);
    }, [that.brushTipImage, that_brushTipImage]);
    let thatlastPoint:Point = [0, 0];
    let thatlastSegments:Point[] = [];
    let thatfinished = false;
    const thatbuffer:DrawableState = useMemo(()=>createDrawable({ size: [1, 1] }), []);
    const thatpreviewBuffer:DrawableState = useMemo(()=>createDrawable({ size: [1, 1] }), []);
    let thatcurrentLength = 0;
    const thattextureWith = Math.max(brushTipImageData?.width||1, brushTipImageData?.height||1);
    function drawSegment(bufferCtx: CanvasRenderingContext2D, width: number, [x, y]: Point) {
        const texture = that_brushTipImage.canvas;
        const { width: sWidth, height: sHeight } = texture;
        const dWidth=sWidth*width/thattextureWith, dHeight = sHeight*width/thattextureWith;
        bufferCtx.drawImage(texture, 0, 0, sWidth, sHeight, x-dWidth/2, y-dHeight/2, dWidth, dHeight);
    }
    const startStroke = (drawable:DrawableState, point:Point, color:string, alpha:number)=>{
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
    };

    const drawStroke = (drawable:DrawableState, point:Point, color:string, alpha:number, width:number)=>{
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
    };

    const endStroke = (drawable:DrawableState, point:Point, color:string, alpha:number, width:number)=>{
        const { ctx, } = drawable;
        if(!thatfinished) {
            const temp = that.spacing;
            that.spacing = 0;
            drawStroke(drawable, point, color, alpha, width);
            that.spacing = temp;
        }
        // FIXME: draw tip shape to create the illusion of the more complex brush
        ctx?.restore();
    };
    return <BrushRendererContext.Provider value={{ drawStroke, endStroke, startStroke }}>
        {children}
    </BrushRendererContext.Provider>;
});

export const  MarkerC = (({ that, children }:BrushFunctions<SerializedMarkerBrush>)=>{
    console.log('MarkerC');
    let thatprevToLastPoint: Point = [0, 0];
    let thatlastPoint: Point = [0, 0];
    const thatbuffer:DrawableState = createDrawable({ size: [1, 1] });

    const startStroke = useMemo(()=>(drawable:DrawableState, point:Point, color:string, alpha:number, width:number)=>{
        thatlastPoint = point;
        thatprevToLastPoint = point;
        const { ctx, canvas } = drawable;
        const { ctx: bufferCtx, canvas: buffer } = thatbuffer;
        buffer.width = canvas.width;
        buffer.height = canvas.height;
        if (!ctx || !bufferCtx) return;
        bufferCtx.lineCap = 'round';
        bufferCtx.lineJoin = 'round';
        bufferCtx.strokeStyle = color;
        bufferCtx.lineWidth = width;
        bufferCtx.imageSmoothingEnabled = false;
        bufferCtx.filter = 'url(#no-anti-aliasing)';
        ctx.globalCompositeOperation = 'source-over';
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.fillStyle = color;
        ctx.globalAlpha = alpha;
        canvas.style.filter = 'blur(1px)';
        bufferCtx.globalCompositeOperation = 'copy';
        bufferCtx.beginPath();
        bufferCtx.moveTo(...point);
        bufferCtx.lineTo(...point);
        bufferCtx.stroke();
        ctx.drawImage(buffer, 0, 0);
    }, []);

    const drawStroke = useMemo(()=>(drawable:DrawableState, point:Point)=>{
        const ctx = drawable.ctx;
        const { ctx: bufferCtx, canvas } = thatbuffer;
        if (!ctx || !bufferCtx) return;
        bufferCtx.globalCompositeOperation = 'copy';
        bufferCtx.beginPath();
        bufferCtx.moveTo(...thatprevToLastPoint);
        bufferCtx.lineTo(...thatlastPoint);
        bufferCtx.stroke();
        bufferCtx.globalCompositeOperation = 'source-out';
        bufferCtx.beginPath();
        bufferCtx.moveTo(...thatlastPoint);
        bufferCtx.lineTo(...point);
        bufferCtx.stroke();
        ctx.drawImage(canvas, 0, 0);
        thatprevToLastPoint = thatlastPoint;
        thatlastPoint = point;
    }, []);

    const endStroke = useMemo(()=>(drawable:DrawableState)=>{
        const { ctx, canvas } = drawable;
        const { ctx: bufferCtx, canvas: canvas2 } = thatbuffer;
        if (!ctx || !bufferCtx) return;
        ctx?.restore();
        bufferCtx.globalCompositeOperation = 'copy';
        bufferCtx.filter = 'blur(1px)';
        bufferCtx.drawImage(canvas, 0, 0);
        canvas.width = 0;
        canvas.height = 0;
        canvas.width = canvas2.width;
        canvas.height = canvas2.height;
        ctx.globalCompositeOperation = 'copy';
        ctx.drawImage(canvas2, 0, 0);
        ctx.globalCompositeOperation = 'source-over';
        ctx.filter = 'none';
        canvas2.width = 0;
        canvas2.height = 0;
        canvas.style.filter = 'none';
    }, [thatbuffer]);
    const v = useMemo(()=>({ drawStroke, endStroke, startStroke }), [drawStroke, endStroke, startStroke]);
    return <BrushRendererContext.Provider value={v}>
        {children}
    </BrushRendererContext.Provider>;
});

export const  StiffC = (({ that, children }:BrushFunctions<SerializedStiffBrush>)=>{
    console.log('StiffC');
    const thatbuffer:DrawableState = createDrawable({ size: [1, 1] });
    const thatfibers: { position: DOMPoint, width: number, alpha:number }[] = that.fibers.map(parseSerializedJSON);
    let thatscaledFibers: { position: DOMPoint, width: number, alpha:number }[]=[];

    const startStroke = useMemo(()=>(drawable:DrawableState, point:Point, color:string, alpha:number, width:number)=>{
        thatscaledFibers = thatfibers.map(fiber => ({ ...fiber, position: scalePoint(fiber.position, width/2), width: fiber.width*width }));
        const { ctx: bufferCtx, canvas: buffer } = thatbuffer;
        const { ctx, canvas } = drawable;
        buffer.width = canvas.width+width;
        buffer.height = canvas.height+width;
        if (!bufferCtx || !ctx) return;
        ctx.globalCompositeOperation = 'source-over';
        ctx.setTransform(1, 0, 0, 1, -width/2, -width/2);
        bufferCtx.globalCompositeOperation = 'copy';
        bufferCtx.setTransform(1, 0, 0, 1, width/2, width/2);
        bufferCtx.lineCap = 'round';
        bufferCtx.lineJoin = 'round';
        bufferCtx.lineWidth = width;
        bufferCtx.strokeStyle = color;
        bufferCtx.beginPath();
        bufferCtx.moveTo(...point);
    }, []);

    const drawStroke = useMemo(()=>(drawable:DrawableState, point:Point, color:string, alpha:number, width:number)=>{
        const { ctx: bufferCtx, canvas: buffer } = thatbuffer;
        const { ctx, canvas } = drawable;
        if (!bufferCtx || !ctx) return;
        ctx.globalCompositeOperation = 'source-over';
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.setTransform(1, 0, 0, 1, -width/2, -width/2);
        bufferCtx.setTransform(1, 0, 0, 1, width/2, width/2);
        bufferCtx.lineTo(...point);
        ctx.globalAlpha = 1;
        thatscaledFibers.forEach(fiber => {
            const { width, position, alpha } = fiber;
            bufferCtx.clearRect(0, 0, buffer.width, buffer.height);
            bufferCtx.lineWidth = width;
            bufferCtx.globalAlpha = alpha;
            bufferCtx.stroke();
            ctx.drawImage(buffer, position.x, position.y);
        });
        ctx.resetTransform();
        bufferCtx.resetTransform();
        bufferCtx.globalAlpha = 1;
        bufferCtx.drawImage(canvas, 0, 0);
        ctx.globalCompositeOperation = 'copy';
        ctx.globalAlpha = alpha;
        ctx.drawImage(buffer, 0, 0);
    }, [thatbuffer, thatscaledFibers]);

    const endStroke = useMemo(()=>(drawable:DrawableState)=>{
        const { ctx, } = drawable;
        const { canvas } = thatbuffer;
        ctx?.restore();
        canvas.width = 0;
        canvas.height = 0;
    }, [thatbuffer]);
    const v = useMemo(()=>({ drawStroke, endStroke, startStroke }), [drawStroke, endStroke, startStroke]);
    return <BrushRendererContext.Provider value={v}>
        {children}
    </BrushRendererContext.Provider>;
});

export const BrushC = BrushMaper<SerializedBrush>([
    [SolidC, {
        scribbleBrushType: BrushList.Solid,
        name: 'SolidBrush',
        angle: 0,
        diameter: 1,
        hardness: 1,
        roundness: 1,
        spacing: 300
    },],
    [TextureC, {
        scribbleBrushType: BrushList.Texture,
        name: 'TextureBrush',
        brushTipImage: {
            colorSpace: 'srgb',
            height: 1,
            width: 1,
            data: [0, 0, 0, 0]
        },
        spacing: 0,
        antiAliasing: true,
    }],
    [MarkerC, {
        scribbleBrushType: BrushList.Marker,
        name: 'Marker'
    }],
    [StiffC, {
        scribbleBrushType: BrushList.Stiff,
        name: 'Stiff',
        fibers: []
    }]
]);