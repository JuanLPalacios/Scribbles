import { MouseEvent } from 'react';
import Tool from '../abstracts/Tool';
import Layer from '../components/Layer';
import { uid } from '../lib/uid';
import { Handle } from '../types/Handle';
import { LayerState } from '../types/LayerState';
import { MenuOptions } from '../types/MenuOptions';
import { Point } from '../types/Point';
  
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
    axis: [boolean,boolean] = [false,false];
    skewMode = false;
    action: 'none' | 'scale' | 'rotate' | 'skew' = 'none';
    drawnRect: { left: number; top: number; width: number; height: number; } = {left:0,top:0,height:0, width:0};
    
    setup(options: MenuOptions<any>, setOptions: (options: MenuOptions<any>) => void): void {
        //throw new Error('Method not implemented.');
        const { layers, selectedLayer, brushes, selectedBrush } = options;
        const layer = layers[selectedLayer];
        const {canvas, buffer} = layer;

        const mw = canvas.canvas.width/2;
        const mh = canvas.canvas.height/2;
        this.handles = [
            new DOMPoint(0,0),
            new DOMPoint(0,mh),
            new DOMPoint(0,2*mh),
            new DOMPoint(mw,2*mh),
            new DOMPoint(2*mw,2*mh),
            new DOMPoint(2*mw,mh),
            new DOMPoint(2*mw,0),
            new DOMPoint(mw,0)
        ];
        const sideHandle = (position: DOMPoint, i: number):Handle => ({
            key:uid(),
            icon:'',
            position,
            rotation:new DOMMatrix(),
            onMouseDown:(i%2 === 0)?(e, options, setOptions) => {
                //tl
                e.preventDefault();
                e.stopPropagation();
                const { layers, selectedLayer } = options;
                const layer = layers[selectedLayer];
                this.axis = [ true, true ];
                if(this.skewMode){
                    this.pivot = scale(sum(this.handles[0], this.handles[4]), .5);
                    this.startRotation(e, layer);
                }
                else{
                    this.pivot = this.handles[(i+4)%8];
                    this.startScaling(e, layer);
                }
                setOptions({...options});
            }:(e, options, setOptions) => {
                //cl
                e.preventDefault();
                e.stopPropagation();
                const { layers, selectedLayer } = options;
                const layer = layers[selectedLayer];
                this.axis = [ (i%4 === 1), (i%4 !== 1) ];
                this.pivot = this.handles[(i+4)%8];
                if(this.skewMode){
                    this.startSkewering(e, layer);
                }
                else{
                    this.startScaling(e, layer);
                }
                setOptions({...options});
            }
        });
        this.handleH = this.handles.map(sideHandle);
        if(buffer.ctx){
            buffer.ctx.globalCompositeOperation = 'copy';
            buffer.ctx.drawImage(canvas.canvas, 0, 0);
            canvas.canvas.style.display = 'none';
        }
        this.render(layer);
        setOptions({...options});
    }
    
    dispose(options: MenuOptions<any>, setOptions: (options: MenuOptions<any>) => void): void {
        //throw new Error('Method not implemented.');
    }
    
    mouseDown(e: MouseEvent, options: MenuOptions<any>, setOptions: (options: MenuOptions<any>) => void): void {
        const { layers, selectedLayer } = options;
        const {nativeEvent} = e;
        const layer = layers[selectedLayer];
        nativeEvent.preventDefault();
        console.log(e.currentTarget.id);
        
        // if(this.skewMode)
        //     this.startSkewering(e, layer);
        // else 
        //     this.startScaling(e, layer);
        //this.startTranslation(e, layer);
        e.stopPropagation();
    }
    
    mouseUp(e: MouseEvent, options: MenuOptions<any>, setOptions: (options: MenuOptions<any>) => void): void {
        const { layers, selectedLayer, brushes, selectedBrush } = options;
        //throw new Error('Method not implemented.');
        this.action = 'none';
        e.stopPropagation();
    }
    
    mouseMove(e: MouseEvent, options: MenuOptions<any>, setOptions: (options: MenuOptions<any>) => void): void {
        e.preventDefault();
        e.stopPropagation();
        const { layers, selectedLayer, brushes, selectedBrush } = options;
        const layer = layers[selectedLayer];
        const {currentTarget} = <{currentTarget:HTMLElement}><unknown>e;
        const {nativeEvent} = e;
        nativeEvent.preventDefault();
        
        switch(this.action){
        case 'scale':
            this.scale(e, layer);
            break;
        case 'skew':
            this.skew(e, layer);
            break;
        }
        
        setOptions({...options});
    }
    
    click(e: MouseEvent, options: MenuOptions<any>, setOptions: (options: MenuOptions<any>) => void): void {
        const { layers, selectedLayer, brushes, selectedBrush } = options;
        const layer = layers[selectedLayer];
        const dt = Date.now() - this.lastclickTime;
        this.lastclickTime += dt;
        if(dt > 500) return;
        this.skewMode = !this.skewMode;
        this.render(layer);
        setOptions({...options});
    }

    startTranslation(e:React.MouseEvent , layer:LayerState){
        throw new Error('Method not implemented.');
    }

    translate(e:React.MouseEvent , layer:LayerState){
        throw new Error('Method not implemented.');
    }

    startSkewering(e:React.MouseEvent, layer:LayerState){
        if(!layer.canvas.canvas.parentElement) throw new Error('unable to get bounding client rect');
        const canvasRect = layer.canvas.canvas.parentElement.getBoundingClientRect();
        this.inverseMatrix = DOMMatrix.fromFloat32Array(this.matrix.inverse().toFloat32Array());
        this.center = sum(this.pivot.matrixTransform(this.matrix), new DOMPoint(canvasRect.left,canvasRect.top));
        this.prevMatrix = this.matrix;
        
        this.initAngle = Math.atan2(e.clientY - this.center.y, e.clientX - this.center.x);
        
        this.action = 'skew';
    }
    
    skew(e:React.MouseEvent, layer:LayerState){
        const angle = Math.atan2(e.clientY - this.center.y, e.clientX - this.center.x) - this.initAngle;
        
        if(this.axis[0])
            this.matrix = this.prevMatrix.translate(this.pivot.x,this.pivot.y).skewY( 
                angle * 180 / Math.PI
            ).translate(-this.pivot.x,-this.pivot.y);
        else 
            this.matrix = this.prevMatrix.translate(this.pivot.x,this.pivot.y).skewX( 
                -angle * 180 / Math.PI
            ).translate(-this.pivot.x,-this.pivot.y);
        this.render(layer);
    }
        
    startScaling(f:React.MouseEvent, layer:LayerState){
        if(!layer.canvas.canvas.parentElement) throw new Error('unable to get bounding client rect');
        const canvasRect = layer.canvas.canvas.parentElement.getBoundingClientRect();
        this.inverseMatrix = DOMMatrix.fromFloat32Array(this.matrix.inverse().toFloat32Array());
        const p0 = this.handles[0];
        this.center = sum(this.pivot.matrixTransform(this.matrix), new DOMPoint(canvasRect.left,canvasRect.top));
        const dv = new DOMPoint(f.clientX -this.center.x, f.clientY -this.center.y).matrixTransform(this.inverseMatrix);
        this.prevMatrix = this.matrix;
        console.log(this.pivot);
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
        this.action = 'scale';
    }
    
    scale(e:React.MouseEvent, layer:LayerState){
        //if(this.action !== 'scale') return;
        const {currentTarget} = <{currentTarget:HTMLElement}><unknown>e;
        const canvasRect = layer.canvas.canvas;
        const dv = new DOMPoint(e.clientX -this.center.x, e.clientY -this.center.y).matrixTransform(this.inverseMatrix);
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
            
    startRotation(e:React.MouseEvent, layer:LayerState){
        const {currentTarget} = <{currentTarget:HTMLElement}><unknown>e;
        const drawnRect = currentTarget.getBoundingClientRect();
        this.center = new DOMPoint( drawnRect.left + drawnRect.width / 2, drawnRect.top + drawnRect.height / 2 );
        this.rotation = Math.atan2(e.clientY - this.center.y, e.clientX - this.center.x) + Math.PI / 2;
    }
            
    rotate(e:React.MouseEvent, layer:LayerState){
        const angle = Math.atan2(e.clientY - this.center.y, e.clientX - this.center.x) + Math.PI / 2 - this.rotation;
        layer.buffer.ctx?.rotate(angle * 180 / Math.PI);
        this.render(layer);
    }

    render(layer: LayerState) {
        //console.log(this.matrix);
        layer.handles = this.handleH.map((handle,i)=>({...handle,icon:(this.handles[i]==this.pivot? '[P]':'')+(this.skewMode?'sk':'sc')+i, position:this.handles[i].matrixTransform(this.matrix), rotation:new DOMMatrix()}));
        layer.buffer.canvas.style.transform = this.matrix.toString();
        layer.buffer.canvas.style.transformOrigin = 'top left';
    }
})();


const sum = (a:DOMPoint, b:DOMPoint) => new DOMPoint(a.x+b.x, a.y+b.y, a.z+b.z);
const sub = (a:DOMPoint, b:DOMPoint) => new DOMPoint(b.x-a.x, b.y-a.y, b.z-a.z);
const scale = (a:DOMPoint, b:DOMPoint|number) =>
    (typeof b == 'number')?
        new DOMPoint(b*a.x, b*a.y, b*a.z)
        : new DOMPoint(b.x*a.x, b.y*a.y, b.z*a.z);