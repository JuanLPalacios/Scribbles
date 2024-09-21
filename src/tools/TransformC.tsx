import { uid } from '../lib/uid';
import { scalePoint, sub } from '../lib/DOMMath';
import { Handle } from '../types/Handle';
import { LayerState } from '../types/LayerState';
import square from '../icons/square-svgrepo-com.svg';
import hSkew from '../icons/arrows-h-alt-svgrepo-com.svg';
import vSkew from '../icons/arrows-v-alt-svgrepo-com.svg';
import rotateBottomLeft from '../icons/corner-double-bottom-left-svgrepo-com.svg';
import rotateBottomRight from '../icons/corner-double-bottom-right-svgrepo-com.svg';
import rotateTopLeft from '../icons/corner-double-top-left-svgrepo-com.svg';
import rotateTopRight from '../icons/corner-double-top-right-svgrepo-com.svg';
import { CanvasEvent } from '../types/CanvasEvent';
import { ToolEvent } from '../types/ToolEvent';
import { createDrawable } from '../generators/createDrawable';
import { useMemo } from 'react';
import { ToolContext, ToolFunctions } from '../contexts/ToolContext';
import { renderThumbnail } from './Draw';

const SKEW_ICONS = [
    rotateTopLeft,
    vSkew,
    rotateBottomLeft,
    hSkew,
    rotateBottomRight,
    vSkew,
    rotateTopRight,
    hSkew
];

type TransformOptions = unknown;

export const TransformC = ({ children }: ToolFunctions) => {
    const r = useMemo(() => {
        let lastclickTime = 0;
        let center = new DOMPoint();
        let handleH: Handle<unknown>[] = [];
        let pivot = new DOMPoint();
        let initAngle = 0;
        let handles:DOMPoint[] = [];
        let prevMatrix = new DOMMatrix();
        let inverseMatrix = new DOMMatrix();
        let matrix = new DOMMatrix();
        let axis: [boolean, boolean] = [false, false];
        let skewMode = false;
        let action: 'none' | 'scale' | 'rotate' | 'skew' | 'translate' | 'rect-cut' | 'transform' = 'none';

        const setup = function({ editorContext: [drawing, setDrawing] }:ToolEvent<TransformOptions>): void {
            if(!drawing.drawing) return;
            action = 'none';
            setDrawing({ type: 'editor/forceUpdate', payload: { ...drawing } });
        };

        const dispose = function(e:ToolEvent<TransformOptions>): void {
            action = 'none';
            const { editorContext: [drawing, setDrawing] } = e;
            if(!drawing.drawing) return;
            const { layers, selectedLayer } = drawing.drawing;
            const layer = layers[selectedLayer];
            endTransform(e, layer);
            setDrawing({ type: 'editor/forceUpdate', payload: { ...drawing } });
        };

        const mouseDown = function(e: CanvasEvent<TransformOptions>,): void {
            const { editorContext: [drawing] } = e;
            if(!drawing.drawing) return;
            const { layers, selectedLayer } = drawing.drawing;
            const layer = layers[selectedLayer];

            switch(action){
            case 'none':
                startRectCut(e, layer);
                break;
            case 'transform':
                startTranslation(e, layer);
                break;
            }
        };

        const mouseUp = function(e: CanvasEvent<TransformOptions>,): void {
            const { editorContext: [drawing] } = e;
            if(!drawing.drawing) return;
            const { layers, selectedLayer } = drawing.drawing;
            const layer = layers[selectedLayer];
            switch(action){
            case 'rect-cut':
                endRectCut(e, layer);
                break;
            case 'none':
                endTransform(e, layer);
                break;
            default:
                action = 'transform';
                break;
            }

            //setDrawing({ type: 'editor/forceUpdate', payload: { ...drawing } });
        };

        const mouseMove = function(e: CanvasEvent<TransformOptions>,): void {
            const { editorContext: [drawing, setDrawing] } = e;
            if(!drawing.drawing) return;
            const { layers, selectedLayer } = drawing.drawing;
            const layer = layers[selectedLayer];

            switch(action){
            case 'scale':
                scale(e, layer);
                break;
            case 'skew':
                skew(e, layer);
                break;
            case 'rotate':
                rotate(e, layer);
                break;
            case 'translate':
                translate(e, layer);
                break;
            case 'rect-cut':
                rectCut(e, layer);
                break;
            }

            setDrawing({ type: 'editor/forceUpdate', payload: { ...drawing } });
        };

        const click = function({ point, editorContext: [drawing, setDrawing] }: CanvasEvent<TransformOptions>,): void {
            if(!drawing.drawing) return;
            const { layers, selectedLayer } = drawing.drawing;
            const layer = layers[selectedLayer];
            inverseMatrix = DOMMatrix.fromFloat32Array(matrix.inverse().toFloat32Array());
            const { x: projectionX, y: projectionY } = point.matrixTransform(inverseMatrix);
            const { x: width, y: height }  = handles[4];
            if(
                (projectionX<0)
            ||(projectionY<0)
            ||(projectionX>width)
            ||(projectionY>height)
            ) return;
            const dt = Date.now() - lastclickTime;
            lastclickTime += dt;
            if(dt > 500) return;
            skewMode = !skewMode;
            render(layer);
            setDrawing({ type: 'editor/forceUpdate', payload: { ...drawing } });
        };

        const startTranslation = function(e: CanvasEvent<TransformOptions>, layer: LayerState){
            inverseMatrix = DOMMatrix.fromFloat32Array(matrix.inverse().toFloat32Array());
            const { point }  = e;
            const { x: projectionX, y: projectionY } = point.matrixTransform(inverseMatrix);
            const { x: width, y: height }  = handles[4];
            if(
                (projectionX<0)
            ||(projectionY<0)
            ||(projectionX>width)
            ||(projectionY>height)
            ) {
                action = 'none';
                return;
            }
            center = new DOMPoint(point.x, point.y);
            pivot = new DOMPoint(0, 0).matrixTransform(inverseMatrix);
            prevMatrix = matrix;
            action = 'translate';
        };

        const translate = function({ point: e }: CanvasEvent<TransformOptions>, layer:LayerState){
            const movement =
        sub(
            pivot,
            new DOMPoint(
                e.x - center.x,
                e.y - center.y
            ).matrixTransform(inverseMatrix)
        );
            matrix =prevMatrix.translate(movement.x, movement.y);
            render(layer);
        };

        const startSkewering = function({ point: e }: CanvasEvent<TransformOptions>, layer: LayerState){
            inverseMatrix = DOMMatrix.fromFloat32Array(matrix.inverse().toFloat32Array());
            center = pivot.matrixTransform(matrix);
            prevMatrix = matrix;

            initAngle = Math.atan2(e.y - center.y, e.x - center.x);

            action = 'skew';
        };

        const skew = function({ point: e }: CanvasEvent<TransformOptions>, layer:LayerState){
            const angle = Math.atan2(e.y - center.y, e.x - center.x) - initAngle;

            if(axis[0])
                matrix = prevMatrix.translate(pivot.x, pivot.y).skewY(
                    angle * 180 / Math.PI
                )
                    .translate(-pivot.x, -pivot.y);
            else
                matrix = prevMatrix.translate(pivot.x, pivot.y).skewX(
                    -angle * 180 / Math.PI
                )
                    .translate(-pivot.x, -pivot.y);
            render(layer);
        };

        const startScaling = function({ point: e }: CanvasEvent<TransformOptions>, layer:LayerState){
            inverseMatrix = DOMMatrix.fromFloat32Array(matrix.inverse().toFloat32Array());
            center = pivot.matrixTransform(matrix);
            const dv = sub(
                new DOMPoint(0, 0).matrixTransform(inverseMatrix),
                new DOMPoint(e.x -center.x, e.y -center.y).matrixTransform(inverseMatrix)
            );
            const { x: w, y: h } = handles[4];
            prevMatrix = matrix;
            matrix = prevMatrix
                .scale(
                    axis[0] ? Math.abs(dv.x/w) : 1,
                    axis[1] ? Math.abs(dv.y/h) : 1,
                    1,
                    pivot.x,
                    pivot.y,
                    0
                );
            render(layer);
            action = 'scale';
        };

        const scale = function({ point: e }: CanvasEvent<TransformOptions>, layer:LayerState){
            const dv = sub(
                new DOMPoint(0, 0).matrixTransform(inverseMatrix),
                new DOMPoint(e.x -center.x, e.y -center.y).matrixTransform(inverseMatrix)
            );
            const { x: w, y: h } = handles[4];
            matrix = prevMatrix
                .scale(
                    axis[0] ? Math.abs(dv.x/w) : 1,
                    axis[1] ? Math.abs(dv.y/h) : 1,
                    1,
                    pivot.x,
                    pivot.y,
                    0
                )
            ;
            render(layer);
        };

        const startRotation = function({ point: e }: CanvasEvent<TransformOptions>, layer: LayerState){
            inverseMatrix = DOMMatrix.fromFloat32Array(matrix.inverse().toFloat32Array());
            center = pivot.matrixTransform(matrix);
            prevMatrix = matrix;

            initAngle = Math.atan2(e.y - center.y, e.x - center.x);

            action = 'rotate';
        };

        const rotate = function({ point: e }: CanvasEvent<TransformOptions>, layer:LayerState){
            const angle = Math.atan2(e.y - center.y, e.x - center.x) - initAngle;
            const subPivot = pivot.matrixTransform(prevMatrix);

            matrix = new DOMMatrix().translate(subPivot.x, subPivot.y)
                .rotate(
                    angle * 180 / Math.PI
                )
                .translate(-subPivot.x, -subPivot.y)
                .multiply(prevMatrix);
            render(layer);
        };

        const startRectCut = function({ editorContext: [drawing, setDrawing], point: e }: CanvasEvent<TransformOptions>, layer:LayerState){
            if(!drawing.drawing) return;
            const { selectedLayer } = drawing.drawing;
            center = e;
            action = 'rect-cut';
            const { buffer } = layer;
            if(!buffer.ctx) return;
            const tile = document.createElement('canvas');
            const square = 5;
            tile.width = tile.height = 2*square;
            const ctx = tile.getContext('2d');
            if(!ctx) return;
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, tile.width, tile.height);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, square, square);
            ctx.fillRect(square, square, square, square);
            buffer.ctx.strokeStyle = buffer.ctx.createPattern(tile, 'repeat') || '';
            buffer.ctx.lineWidth = 1;
            buffer.ctx.fillStyle = '#000000';
            setDrawing({ type: 'editor/do', payload: { type: 'drawing/workLayer', payload: { at: selectedLayer, layer } } });
        };

        const endRectCut = function(e: CanvasEvent<TransformOptions>, layer:LayerState){
            const { x: cx, y: cy } = center;
            const { point: { x: px, y: py } } = e;
            const { rect: { position: [dx, dy], size: [dw, dh] } } = layer;
            const
                x = Math.min(px, cx)-dx,
                y = Math.min(py, cy)-dy,
                w = Math.abs(px-cx),
                h = Math.abs(py-cy);
            if((w==0)||(h==0)){
                action = 'none';
                return;
            }
            const { buffer, canvas } = layer;
            const mask = createDrawable({ size: [buffer.canvas.width, buffer.canvas.height] });
            if(!buffer.ctx || !mask.ctx || !canvas.ctx) return;
            buffer.ctx.clearRect(0, 0, dw, dh);
            //this is unnecesary but is ment to be a reference, once the other selection are bing implemented
            buffer.ctx.fillRect(x, y, w, h);
            mask.ctx.drawImage(buffer.canvas, 0, 0);
            buffer.ctx.globalCompositeOperation = 'source-in';
            buffer.ctx.drawImage(canvas.canvas, 0, 0);
            canvas.ctx.globalCompositeOperation = 'destination-out';
            canvas.ctx.drawImage(mask.canvas, 0, 0);
            mask.canvas.width = w;
            mask.canvas.height = h;
            mask.ctx.drawImage(buffer.canvas, x, y, w, h, 0, 0, w, h);
            buffer.canvas.width = w;
            buffer.canvas.height = h;
            buffer.ctx.globalCompositeOperation = 'source-over';
            buffer.ctx.drawImage(mask.canvas, 0, 0);
            canvas.ctx.globalCompositeOperation = 'source-over';
            action = 'transform';
            startTransform(e, layer, x, y);
        };

        const rectCut = function({ point: e }: CanvasEvent<TransformOptions>, layer:LayerState){
            const { x: cx, y: cy } = center;
            const { x, y } = e;
            const { rect: { position: [dx, dy], size: [w, h] } } = layer;
            const { buffer } = layer;
            if(!buffer.ctx) return;
            buffer.ctx.clearRect(0, 0, w, h);
            buffer.ctx.strokeRect(Math.min(x, cx)-dx, Math.min(y, cy)-dy, Math.abs(x-cx), Math.abs(y-cy));
        };

        const startTransform = function({ editorContext: [drawing, setDrawing] }: CanvasEvent<TransformOptions>, layer:LayerState, dx = 0, dy = 0){
            const { canvas, buffer, rect: { position: [x, y] } } = layer;

            const mw = buffer.canvas.width/2;
            const mh = buffer.canvas.height/2;

            center = new DOMPoint();
            pivot = new DOMPoint();
            initAngle = 0;
            prevMatrix = new DOMMatrix();
            inverseMatrix = new DOMMatrix();
            matrix = new DOMMatrix().translate(x+dx, y+dy);
            axis = [false, false];
            skewMode = false;
            action = 'transform';
            layer.rect.position = [0, 0];

            handles = [
                new DOMPoint(0, 0),
                new DOMPoint(0, mh),
                new DOMPoint(0, 2*mh),
                new DOMPoint(mw, 2*mh),
                new DOMPoint(2*mw, 2*mh),
                new DOMPoint(2*mw, mh),
                new DOMPoint(2*mw, 0),
                new DOMPoint(mw, 0)
            ];
            layer.buffer.canvas.style.transformOrigin = 'top left';
            const createHandle = (position: DOMPoint, i: number):Handle<TransformOptions> => ({
                key: uid(),
                icon: '',
                position,
                rotation: new DOMMatrix(),
                onMouseDown: (i%2 === 0)?(e) => {
                    const { editorContext: [drawing, setDrawing] } = e;
                    if(!drawing.drawing) return;
                    const { layers, selectedLayer } = drawing.drawing;
                    const layer = layers[selectedLayer];
                    axis = [true, true];
                    if(skewMode){
                        pivot = scalePoint(handles[4], .5);
                        startRotation(e, layer);
                    }
                    else{
                        pivot = handles[(i+4)%8];
                        startScaling(e, layer);
                    }
                    setDrawing({ type: 'editor/forceUpdate', payload: { ...drawing } });
                }:(e) => {
                    const { editorContext: [drawing, setDrawing] } = e;
                    if(!drawing.drawing) return;
                    const { layers, selectedLayer } = drawing.drawing;
                    const layer = layers[selectedLayer];
                    axis = [(i%4 === 1), (i%4 !== 1)];
                    pivot = handles[(i+4)%8];
                    if(skewMode){
                        startSkewering(e, layer);
                    }
                    else{
                        startScaling(e, layer);
                    }
                    setDrawing({ type: 'editor/forceUpdate', payload: { ...drawing } });
                }
            });
            handleH = handles.map(createHandle);
            canvas.canvas.style.transform =
        new DOMMatrix()
            .translate(x, y)
            .toString();
            render(layer);
            setDrawing({ type: 'editor/forceUpdate', payload: { ...drawing } });
        };

        const endTransform = function({ editorContext: [drawing, setDrawing] }: ToolEvent<TransformOptions>, layer: LayerState) {
            if(!drawing.drawing) return;
            const { layers, selectedLayer } = drawing.drawing;
            const { canvas, buffer } = layers[selectedLayer];
            if(canvas.ctx){
                canvas.ctx.globalCompositeOperation = 'source-over';
                canvas.ctx.globalAlpha = 1;
                canvas.ctx.setTransform(matrix);
                canvas.ctx.drawImage(buffer.canvas, 0, 0);
                canvas.ctx.resetTransform();
                canvas.canvas.style.transform = '';
                buffer.canvas.width = canvas.canvas.width;
                buffer.canvas.height = canvas.canvas.height;
                buffer.canvas.style.transform = '';
                buffer.canvas.style.transformOrigin = 'top left';
                buffer.ctx?.clearRect(0, 0, buffer.canvas.width, buffer.canvas.width);
            }
            layer.handles = [];
            action = 'none';
            const { rect, canvas: { ctx } } = layer;
            if(!ctx)return;
            setDrawing({ type: 'editor/do', payload: { type: 'drawing/workLayer', payload: { at: selectedLayer, layer: { ...layer, imageData: ctx.getImageData(0, 0, ...rect.size) } } } });
            renderThumbnail(layer);
        };

        const render = function(layer: LayerState) {
            const hx = Math.sqrt(matrix.b*matrix.b+matrix.a*matrix.a);
            const hy = Math.sqrt(matrix.d*matrix.d+matrix.c*matrix.c);
            const handleMatrix = new DOMMatrix([
                matrix.a, matrix.b,
                matrix.c, matrix.d,
                0, 0
            ]).scale(1/hx, 1/hy);
            layer.handles = handleH.map((handle, i)=>({
                ...handle,
                icon: skewMode? SKEW_ICONS[i] : square,
                position: handles[i].matrixTransform(matrix),
                rotation: handleMatrix })) as any;
            layer.buffer.canvas.style.transform = matrix.toString();
        };
        return {
            click,
            dispose,
            mouseDown,
            mouseMove,
            mouseUp,
            setup
        };
    }, []);
    return <ToolContext.Provider value={r}>
        {children}
    </ToolContext.Provider>;
};
