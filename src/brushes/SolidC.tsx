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
