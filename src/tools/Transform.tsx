import Tool from '../abstracts/Tool';
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
import { createDrawable } from '../hooks/createDrawable';

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

type TransformOptions = any;

export const transform = new (class Transform extends Tool<TransformOptions> {
    lastclickTime = 0;
    center = new DOMPoint();
    handleH: Handle[] = [];
    pivot = new DOMPoint();
    rotation = 0;
    initAngle = 0;
    handles:DOMPoint[] = [];
    prevMatrix = new DOMMatrix();
    inverseMatrix = new DOMMatrix();
    matrix = new DOMMatrix();
    axis: [boolean, boolean] = [false, false];
    skewMode = false;
    action: 'none' | 'scale' | 'rotate' | 'skew' | 'translate' | 'rect-cut' | 'transform' = 'none';

    setup({ drawingContext: [drawing, setDrawing] }:ToolEvent<TransformOptions>): void {
        if(!drawing) return;
        const { layers, selectedLayer } = drawing;
        const layer = layers[selectedLayer];
        this.action = 'none';
        this.render(layer);
        setDrawing({ ...drawing });
    }

    dispose({ drawingContext: [drawing, setDrawing] }:ToolEvent<TransformOptions>): void {
        this.action = 'none';
    }

    mouseDown(e: CanvasEvent<TransformOptions>,): void {
        const { drawingContext: [drawing] } = e;
        if(!drawing) return;
        const { layers, selectedLayer } = drawing;
        const layer = layers[selectedLayer];

        switch(this.action){
        case 'none':
            this.startRectCut(e, layer);
            break;
        case 'transform':
            this.startTranslation(e, layer);
            break;
        }
    }

    mouseUp(e: CanvasEvent<TransformOptions>,): void {
        const { drawingContext: [drawing, setDrawing] } = e;
        if(!drawing) return;
        const { layers, selectedLayer } = drawing;
        const layer = layers[selectedLayer];
        switch(this.action){
        case 'rect-cut':
            this.endRectCut(e, layer);
            break;
        case 'none':
            this.endTranform(e, layer);
            break;
        default:
            this.action = 'transform';
            break;
        }

        setDrawing({ ...drawing });
    }

    mouseMove(e: CanvasEvent<TransformOptions>,): void {
        const { drawingContext: [drawing, setDrawing] } = e;
        if(!drawing) return;
        const { layers, selectedLayer } = drawing;
        const layer = layers[selectedLayer];

        switch(this.action){
        case 'scale':
            this.scale(e, layer);
            break;
        case 'skew':
            this.skew(e, layer);
            break;
        case 'rotate':
            this.rotate(e, layer);
            break;
        case 'translate':
            this.translate(e, layer);
            break;
        case 'rect-cut':
            this.rectCut(e, layer);
            break;
        }

        setDrawing({ ...drawing });
    }

    click({ point, drawingContext: [drawing, setDrawing] }: CanvasEvent<TransformOptions>,): void {
        if(!drawing) return;
        const { layers, selectedLayer } = drawing;
        const layer = layers[selectedLayer];
        this.inverseMatrix = DOMMatrix.fromFloat32Array(this.matrix.inverse().toFloat32Array());
        const { x: projectionX, y: projectionY } = point.matrixTransform(this.inverseMatrix);
        const { rect: { size: [width, height] } } = layer;
        if(
            (projectionX<0)
            ||(projectionY<0)
            ||(projectionX>width)
            ||(projectionY>height)
        ) return;
        const dt = Date.now() - this.lastclickTime;
        this.lastclickTime += dt;
        if(dt > 500) return;
        this.skewMode = !this.skewMode;
        this.render(layer);
        setDrawing({ ...drawing });
    }

    startTranslation(e: CanvasEvent<TransformOptions>, layer:LayerState){
        this.inverseMatrix = DOMMatrix.fromFloat32Array(this.matrix.inverse().toFloat32Array());
        const { point }  = e;
        const { x: projectionX, y: projectionY } = point.matrixTransform(this.inverseMatrix);
        const { x: width, y: height }  = this.handles[4];
        if(
            (projectionX<0)
            ||(projectionY<0)
            ||(projectionX>width)
            ||(projectionY>height)
        ) {
            this.action = 'none';
            return;
        }
        this.center = new DOMPoint(point.x, point.y);
        this.pivot = new DOMPoint(0, 0).matrixTransform(this.inverseMatrix);
        this.prevMatrix = this.matrix;
        this.action = 'translate';
    }

    translate({ point: e }: CanvasEvent<TransformOptions>, layer:LayerState){
        const movement =
        sub(
            this.pivot,
            new DOMPoint(
                e.x - this.center.x,
                e.y - this.center.y
            ).matrixTransform(this.inverseMatrix)
        );
        this.matrix =this.prevMatrix.translate(movement.x, movement.y);
        this.render(layer);
    }

    startSkewering({ point: e }: CanvasEvent<TransformOptions>, layer:LayerState){
        this.inverseMatrix = DOMMatrix.fromFloat32Array(this.matrix.inverse().toFloat32Array());
        this.center = this.pivot.matrixTransform(this.matrix);
        this.prevMatrix = this.matrix;

        this.initAngle = Math.atan2(e.y - this.center.y, e.x - this.center.x);

        this.action = 'skew';
    }

    skew({ point: e }: CanvasEvent<TransformOptions>, layer:LayerState){
        const angle = Math.atan2(e.y - this.center.y, e.x - this.center.x) - this.initAngle;

        if(this.axis[0])
            this.matrix = this.prevMatrix.translate(this.pivot.x, this.pivot.y).skewY(
                angle * 180 / Math.PI
            )
                .translate(-this.pivot.x, -this.pivot.y);
        else
            this.matrix = this.prevMatrix.translate(this.pivot.x, this.pivot.y).skewX(
                -angle * 180 / Math.PI
            )
                .translate(-this.pivot.x, -this.pivot.y);
        this.render(layer);
    }

    startScaling({ point: e }: CanvasEvent<TransformOptions>, layer:LayerState){
        this.inverseMatrix = DOMMatrix.fromFloat32Array(this.matrix.inverse().toFloat32Array());
        this.center = this.pivot.matrixTransform(this.matrix);
        const dv = sub(
            new DOMPoint(0, 0).matrixTransform(this.inverseMatrix),
            new DOMPoint(e.x -this.center.x, e.y -this.center.y).matrixTransform(this.inverseMatrix)
        );
        const { x: w, y: h } = this.handles[4];
        this.prevMatrix = this.matrix;
        this.matrix = this.prevMatrix
            .scale(
                this.axis[0] ? Math.abs(dv.x/w) : 1,
                this.axis[1] ? Math.abs(dv.y/h) : 1,
                1,
                this.pivot.x,
                this.pivot.y,
                0
            );
        this.render(layer);
        this.action = 'scale';
    }

    scale({ point: e }: CanvasEvent<TransformOptions>, layer:LayerState){
        const dv = sub(
            new DOMPoint(0, 0).matrixTransform(this.inverseMatrix),
            new DOMPoint(e.x -this.center.x, e.y -this.center.y).matrixTransform(this.inverseMatrix)
        );
        const { x: w, y: h } = this.handles[4];
        this.matrix = this.prevMatrix
            .scale(
                this.axis[0] ? Math.abs(dv.x/w) : 1,
                this.axis[1] ? Math.abs(dv.y/h) : 1,
                1,
                this.pivot.x,
                this.pivot.y,
                0
            )
        ;
        this.render(layer);
    }

    startRotation({ point: e }: CanvasEvent<TransformOptions>, layer:LayerState){
        this.inverseMatrix = DOMMatrix.fromFloat32Array(this.matrix.inverse().toFloat32Array());
        this.center = this.pivot.matrixTransform(this.matrix);
        this.prevMatrix = this.matrix;

        this.initAngle = Math.atan2(e.y - this.center.y, e.x - this.center.x);

        this.action = 'rotate';
    }

    rotate({ point: e }: CanvasEvent<TransformOptions>, layer:LayerState){
        const angle = Math.atan2(e.y - this.center.y, e.x - this.center.x) - this.initAngle;
        const subPivot = this.pivot.matrixTransform(this.prevMatrix);

        this.matrix = new DOMMatrix().translate(subPivot.x, subPivot.y)
            .rotate(
                angle * 180 / Math.PI
            )
            .translate(-subPivot.x, -subPivot.y)
            .multiply(this.prevMatrix);
        this.render(layer);
    }

    startRectCut({ point: e }: CanvasEvent<TransformOptions>, layer:LayerState){
        this.center = e;
        this.action = 'rect-cut';
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
    }

    endRectCut(e: CanvasEvent<TransformOptions>, layer:LayerState){
        const { x: cx, y: cy } = this.center;
        const { point: { x: px, y: py } } = e;
        const { rect: { position: [dx, dy], size: [dw, dh] } } = layer;
        const
            x = Math.min(px, cx)-dx,
            y = Math.min(py, cy)-dy,
            w = Math.abs(px-cx),
            h = Math.abs(py-cy);
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
        this.action = 'transform';
        this.startTransform(e, layer, x, y);
    }

    rectCut({ point: e }: CanvasEvent<TransformOptions>, layer:LayerState){
        const { x: cx, y: cy } = this.center;
        const { x, y } = e;
        const { rect: { position: [dx, dy], size: [w, h] } } = layer;
        const { buffer } = layer;
        if(!buffer.ctx) return;
        buffer.ctx.clearRect(0, 0, w, h);
        buffer.ctx.strokeRect(Math.min(x, cx)-dx, Math.min(y, cy)-dy, Math.abs(x-cx), Math.abs(y-cy));
    }

    startTransform({ drawingContext: [drawing, setDrawing] }: CanvasEvent<TransformOptions>, layer:LayerState, dx = 0, dy = 0){
        const { canvas, buffer, rect: { position: [x, y] } } = layer;

        const mw = buffer.canvas.width/2;
        const mh = buffer.canvas.height/2;

        this.center = new DOMPoint();
        this.pivot = new DOMPoint();
        this.rotation = 0;
        this.initAngle = 0;
        this.prevMatrix = new DOMMatrix();
        this.inverseMatrix = new DOMMatrix();
        this.matrix = new DOMMatrix().translate(x+dx, y+dy);
        this.axis = [false, false];
        this.skewMode = false;
        this.action = 'transform';
        layer.rect.position = [0, 0];

        this.handles = [
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
        const createHandle = (position: DOMPoint, i: number):Handle => ({
            key: uid(),
            icon: '',
            position,
            rotation: new DOMMatrix(),
            onMouseDown: (i%2 === 0)?(e) => {
                const { drawingContext: [drawing, setDrawing] } = e;
                if(!drawing) return;
                const { layers, selectedLayer } = drawing;
                const layer = layers[selectedLayer];
                this.axis = [true, true];
                if(this.skewMode){
                    this.pivot = scalePoint(this.handles[4], .5);
                    this.startRotation(e, layer);
                }
                else{
                    this.pivot = this.handles[(i+4)%8];
                    this.startScaling(e, layer);
                }
                setDrawing({ ...drawing });
            }:(e) => {
                //cl
                const { drawingContext: [drawing, setDrawing] } = e;
                if(!drawing) return;
                const { layers, selectedLayer } = drawing;
                const layer = layers[selectedLayer];
                this.axis = [(i%4 === 1), (i%4 !== 1)];
                this.pivot = this.handles[(i+4)%8];
                if(this.skewMode){
                    this.startSkewering(e, layer);
                }
                else{
                    this.startScaling(e, layer);
                }
                setDrawing({ ...drawing });
            }
        });
        this.handleH = this.handles.map(createHandle);
        canvas.canvas.style.transform =
        new DOMMatrix()
            .translate(x, y)
            .toString();
        this.render(layer);
        setDrawing(drawing && { ...drawing });
    }

    endTranform({ drawingContext: [drawing, setDrawing] }: CanvasEvent<TransformOptions>, layer: LayerState) {
        if(!drawing) return;
        const { layers, selectedLayer } = drawing;
        const { canvas, buffer } = layers[selectedLayer];
        const finalCords = this.handles.map(cord => cord.matrixTransform(this.matrix)),
            minX = Math.min(...finalCords.map(cord => cord.x)),
            minY = Math.min(...finalCords.map(cord => cord.y)),
            maxX = Math.max(...finalCords.map(cord => cord.x)),
            maxY = Math.max(...finalCords.map(cord => cord.y));
            // canvas.canvas.width = maxX - minX;
            // canvas.canvas.height = maxY - minY;
            // layer.rect.size = [maxX - minX, maxY - minY];
            // layer.rect.position = [layer.rect.position[0]+minX, layer.rect.position[1]+minY];
        console.log(minX+minY+maxX+maxY);
        // const p = new DOMPoint(minX, minY).matrixTransform(DOMMatrix.fromFloat32Array(this.matrix.inverse().toFloat32Array()));
        // const p2 = new DOMPoint(0, 0).matrixTransform(DOMMatrix.fromFloat32Array(this.matrix.inverse().toFloat32Array()));
        // this.matrix.translateSelf(-p.x+p2.x, -p.y+p2.y);

        if(canvas.ctx){
            canvas.ctx.globalCompositeOperation = 'source-over';
            canvas.ctx.globalAlpha = 1;
            canvas.ctx.setTransform(this.matrix);
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
        this.action = 'none';
        this.renderThumbnail(layer);
        setDrawing({ ...drawing });
    }

    render(layer: LayerState) {
        const hx = Math.sqrt(this.matrix.b*this.matrix.b+this.matrix.a*this.matrix.a);
        const hy = Math.sqrt(this.matrix.d*this.matrix.d+this.matrix.c*this.matrix.c);
        const handleMatrix = new DOMMatrix([
            this.matrix.a, this.matrix.b,
            this.matrix.c, this.matrix.d,
            0, 0
        ]).scale(1/hx, 1/hy);
        layer.handles = this.handleH.map((handle, i)=>({
            ...handle,
            icon: this.skewMode? SKEW_ICONS[i] : square,
            position: this.handles[i].matrixTransform(this.matrix),
            rotation: handleMatrix }));
        layer.buffer.canvas.style.transform = this.matrix.toString();
    }
})();