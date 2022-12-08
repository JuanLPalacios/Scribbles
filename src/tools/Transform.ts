import Tool from '../abstracts/Tool';
import { uid } from '../lib/uid';
import { scalePoint, sub } from '../lib/DOMMath';
import { Handle } from '../types/Handle';
import { LayerState } from '../types/LayerState';
import { MenuOptions } from '../types/MenuOptions';
import square from '../icons/square-svgrepo-com.svg';
import hSkew from '../icons/arrows-h-alt-svgrepo-com.svg';
import vSkew from '../icons/arrows-v-alt-svgrepo-com.svg';
import rotateBottomLeft from '../icons/corner-double-bottom-left-svgrepo-com.svg';
import rotateBottomRight from '../icons/corner-double-bottom-right-svgrepo-com.svg';
import rotateTopLeft from '../icons/corner-double-top-left-svgrepo-com.svg';
import rotateTopRight from '../icons/corner-double-top-right-svgrepo-com.svg';

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

export const transform = new (class Transform extends Tool {
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
    action: 'none' | 'scale' | 'rotate' | 'skew' | 'translate' = 'none';
    drawnRect: { left: number; top: number; width: number; height: number; } = { left: 0, top: 0, height: 0, width: 0 };

    setup(options: MenuOptions<any>, setOptions: (options: MenuOptions<any>) => void): void {
        const { drawing, selectedLayer } = options;
        if(!drawing) return;
        const { layers } = drawing;
        const layer = layers[selectedLayer];
        const { canvas, buffer } = layer;

        const mw = canvas.canvas.width/2;
        const mh = canvas.canvas.height/2;

        this.center = new DOMPoint();
        this.pivot = new DOMPoint();
        this.rotation = 0;
        this.initAngle = 0;
        this.prevMatrix = new DOMMatrix();
        this.inverseMatrix = new DOMMatrix();
        this.matrix = new DOMMatrix().translate(layer.rect.position[0], layer.rect.position[1]);
        this.axis = [false, false];
        this.skewMode = false;
        this.action = 'none';
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
            onMouseDown: (i%2 === 0)?(e, options, setOptions) => {
                const { drawing, selectedLayer } = options;
                if(!drawing) return;
                const { layers } = drawing;
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
                setOptions({ ...options });
            }:(e, options, setOptions) => {
                //cl

                const { drawing, selectedLayer } = options;
                if(!drawing) return;
                const { layers } = drawing;
                const layer = layers[selectedLayer];
                this.axis = [(i%4 === 1), (i%4 !== 1)];
                this.pivot = this.handles[(i+4)%8];
                if(this.skewMode){
                    this.startSkewering(e, layer);
                }
                else{
                    this.startScaling(e, layer);
                }
                setOptions({ ...options });
            }
        });
        this.handleH = this.handles.map(createHandle);
        if(buffer.ctx){
            buffer.ctx.globalCompositeOperation = 'copy';
            buffer.ctx.drawImage(canvas.canvas, 0, 0);
            canvas.canvas.style.display = 'none';
        }
        this.render(layer);
        setOptions({ ...options });
    }

    dispose(options: MenuOptions<any>, setOptions: (options: MenuOptions<any>) => void): void {
        const { drawing, selectedLayer } = options;
        if(!drawing) return;
        const { layers } = drawing;
        const layer = layers[selectedLayer];
        const { canvas, buffer } = layers[selectedLayer];
        const finalCords = this.handles.map(cord => cord.matrixTransform(this.matrix)),
            minX = Math.min(...finalCords.map(cord => cord.x)),
            minY = Math.min(...finalCords.map(cord => cord.y)),
            maxX = Math.max(...finalCords.map(cord => cord.x)),
            maxY = Math.max(...finalCords.map(cord => cord.y));
        canvas.canvas.width = maxX - minX;
        canvas.canvas.height = maxY - minY;
        layer.rect.size = [maxX - minX, maxY - minY];
        layer.rect.position = [layer.rect.position[0]+minX, layer.rect.position[1]+minY];
        const p = new DOMPoint(minX, minY).matrixTransform(DOMMatrix.fromFloat32Array(this.matrix.inverse().toFloat32Array()));
        const p2 = new DOMPoint(0, 0).matrixTransform(DOMMatrix.fromFloat32Array(this.matrix.inverse().toFloat32Array()));
        this.matrix.translateSelf(-p.x+p2.x, -p.y+p2.y);

        if(canvas.ctx){
            canvas.ctx.globalCompositeOperation = 'copy';
            canvas.ctx.globalAlpha = 1;
            canvas.ctx.setTransform(this.matrix);
            canvas.ctx.drawImage(buffer.canvas, 0, 0);
            canvas.ctx.resetTransform();
            canvas.canvas.style.display = 'inline';
            buffer.canvas.style.transform = '';
            buffer.canvas.style.transformOrigin = 'top left';
            buffer.ctx?.clearRect(0, 0, buffer.canvas.width, buffer.canvas.width);
        }
        layer.handles = [];
        this.renderThumbnail(layer);
        setOptions({ ...options });
    }

    mouseDown(e: DOMPoint, options: MenuOptions<any>, setOptions: (options: MenuOptions<any>) => void): void {
        const { drawing, selectedLayer } = options;
        if(!drawing) return;
        const { layers } = drawing;
        const layer = layers[selectedLayer];

        this.startTranslation(e, layer);
    }

    mouseUp(point: DOMPoint, options: MenuOptions<any>, setOptions: (options: MenuOptions<any>) => void): void {
        this.action = 'none';
    }

    mouseMove(e: DOMPoint, options: MenuOptions<any>, setOptions: (options: MenuOptions<any>) => void): void {
        const { drawing, selectedLayer } = options;
        if(!drawing) return;
        const { layers } = drawing;
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
        }

        setOptions({ ...options });
    }

    click(point: DOMPoint, options: MenuOptions<any>, setOptions: (options: MenuOptions<any>) => void): void {
        const { drawing, selectedLayer } = options;
        if(!drawing) return;
        const { layers } = drawing;
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
        setOptions({ ...options });
    }

    startTranslation(e: DOMPoint, layer:LayerState){
        this.inverseMatrix = DOMMatrix.fromFloat32Array(this.matrix.inverse().toFloat32Array());
        const { x: projectionX, y: projectionY } = e.matrixTransform(this.inverseMatrix);
        const { rect: { size: [width, height] } } = layer;
        if(
            (projectionX<0)
            ||(projectionY<0)
            ||(projectionX>width)
            ||(projectionY>height)
        ) return;
        this.center = new DOMPoint(e.x, e.y);
        this.pivot = new DOMPoint(0, 0).matrixTransform(this.inverseMatrix);
        this.prevMatrix = this.matrix;
        this.action = 'translate';
    }

    translate(e: DOMPoint, layer:LayerState){
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

    startSkewering(e: DOMPoint, layer:LayerState){
        this.inverseMatrix = DOMMatrix.fromFloat32Array(this.matrix.inverse().toFloat32Array());
        this.center = this.pivot.matrixTransform(this.matrix);
        this.prevMatrix = this.matrix;

        this.initAngle = Math.atan2(e.y - this.center.y, e.x - this.center.x);

        this.action = 'skew';
    }

    skew(e: DOMPoint, layer:LayerState){
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

    startScaling(e: DOMPoint, layer:LayerState){
        this.inverseMatrix = DOMMatrix.fromFloat32Array(this.matrix.inverse().toFloat32Array());
        this.center = this.pivot.matrixTransform(this.matrix);
        const dv = sub(
            new DOMPoint(0, 0).matrixTransform(this.inverseMatrix),
            new DOMPoint(e.x -this.center.x, e.y -this.center.y).matrixTransform(this.inverseMatrix)
        );
        this.prevMatrix = this.matrix;
        this.matrix = this.prevMatrix
            .scale(
                this.axis[0] ? Math.abs(dv.x/layer.rect.size[0]) : 1,
                this.axis[1] ? Math.abs(dv.y/layer.rect.size[1]) : 1,
                1,
                this.pivot.x,
                this.pivot.y,
                0
            );
        this.render(layer);
        this.action = 'scale';
    }

    scale(e: DOMPoint, layer:LayerState){
        const canvasRect = layer.canvas.canvas;
        const dv = sub(
            new DOMPoint(0, 0).matrixTransform(this.inverseMatrix),
            new DOMPoint(e.x -this.center.x, e.y -this.center.y).matrixTransform(this.inverseMatrix)
        );
        this.matrix = this.prevMatrix
            .scale(
                this.axis[0] ? Math.abs(dv.x/canvasRect.width) : 1,
                this.axis[1] ? Math.abs(dv.y/canvasRect.height) : 1,
                1,
                this.pivot.x,
                this.pivot.y,
                0
            )
        ;
        this.render(layer);
    }

    startRotation(e: DOMPoint, layer:LayerState){
        this.inverseMatrix = DOMMatrix.fromFloat32Array(this.matrix.inverse().toFloat32Array());
        this.center = this.pivot.matrixTransform(this.matrix);
        this.prevMatrix = this.matrix;

        this.initAngle = Math.atan2(e.y - this.center.y, e.x - this.center.x);

        this.action = 'rotate';
    }

    rotate(e: DOMPoint, layer:LayerState){
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