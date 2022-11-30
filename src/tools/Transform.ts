import { MouseEvent } from 'react';
import Tool from '../abstracts/Tool';
import Layer from '../components/Layer';
import { LayerState } from '../types/LayerState';
import { MenuOptions } from '../types/MenuOptions';
import { Point } from '../types/Point';
  
export const transform = new (class Transform extends Tool {
    center: Point = [0,0];
    rotation = 0;
    handles:DOMPoint[] = [];
    matrix = new DOMMatrix();
    pivot = new DOMPoint();
    prevMatrix = new DOMMatrix();
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
        
        if(this.skewMode)
            this.startScaling(e, layer);
        else 
            this.startSkewering(e, layer);
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
        const {currentTarget} = <{currentTarget:HTMLElement}><unknown>e;
        const canvasRect = currentTarget.getBoundingClientRect();
        const 
            minX = Math.min(this.handles[0].matrixTransform(this.matrix).x, this.handles[2].matrixTransform(this.matrix).x, this.handles[4].matrixTransform(this.matrix).x, this.handles[6].matrixTransform(this.matrix).x),
            minY = Math.min(this.handles[0].matrixTransform(this.matrix).y, this.handles[2].matrixTransform(this.matrix).y, this.handles[4].matrixTransform(this.matrix).y, this.handles[6].matrixTransform(this.matrix).y),
            maxX = Math.max(this.handles[0].matrixTransform(this.matrix).x, this.handles[2].matrixTransform(this.matrix).x, this.handles[4].matrixTransform(this.matrix).x, this.handles[6].matrixTransform(this.matrix).x),
            maxY = Math.max(this.handles[0].matrixTransform(this.matrix).y, this.handles[2].matrixTransform(this.matrix).y, this.handles[4].matrixTransform(this.matrix).y, this.handles[6].matrixTransform(this.matrix).y);
        this.drawnRect = {
            left:minX + canvasRect.left,
            top:minY + canvasRect.top,
            width:maxX - minX,
            height:maxY - minY
        };
        const drawnRect = this.drawnRect;
        this.center = [
            drawnRect.left + ((Math.abs(drawnRect.left - e.clientX) < drawnRect.width/2) ? drawnRect.width : 0),
            drawnRect.top + ((Math.abs(drawnRect.top - e.clientY) < drawnRect.height/2) ? drawnRect.height : 0)
        ];
        console.log(this.center);
        
        this.axis = [
            (Math.abs(drawnRect.top + drawnRect.height/2 - e.clientY) > drawnRect.height/3),
            (Math.abs(drawnRect.left + drawnRect.width/2 - e.clientX) > drawnRect.width/3)
        ];
        this.prevMatrix = this.matrix;
        this.pivot = new DOMPoint(this.center[0] - canvasRect.left, this.center[1] - canvasRect.top)
            .matrixTransform(DOMMatrix.fromFloat32Array(this.matrix.inverse().toFloat32Array()))
        ;
        this.action = 'skew';
    }
    
    skew(e:React.MouseEvent, layer:LayerState){
        const {currentTarget} = <{currentTarget:HTMLElement}><unknown>e;
        const drawnRect = this.drawnRect;
        console.log(
            (e.clientX-this.center[0])/2,
            (e.clientY-this.center[1])/2
        );
        
        if(this.axis[0])
            this.matrix = this.prevMatrix.skewX( 
                (e.clientX-this.center[0])*drawnRect.height/(drawnRect.width*drawnRect.width*2)
            );
        else 
            this.matrix = this.prevMatrix.skewY( 
                (e.clientY-this.center[1])/2
            );
        this.render(layer);
    }
        
    startScaling(e:React.MouseEvent, layer:LayerState){
        const {currentTarget} = <{currentTarget:HTMLElement}><unknown>e;
        const canvasRect = currentTarget.getBoundingClientRect();
        const 
            minX = Math.min(this.handles[0].matrixTransform(this.matrix).x, this.handles[2].matrixTransform(this.matrix).x, this.handles[4].matrixTransform(this.matrix).x, this.handles[6].matrixTransform(this.matrix).x),
            minY = Math.min(this.handles[0].matrixTransform(this.matrix).y, this.handles[2].matrixTransform(this.matrix).y, this.handles[4].matrixTransform(this.matrix).y, this.handles[6].matrixTransform(this.matrix).y),
            maxX = Math.max(this.handles[0].matrixTransform(this.matrix).x, this.handles[2].matrixTransform(this.matrix).x, this.handles[4].matrixTransform(this.matrix).x, this.handles[6].matrixTransform(this.matrix).x),
            maxY = Math.max(this.handles[0].matrixTransform(this.matrix).y, this.handles[2].matrixTransform(this.matrix).y, this.handles[4].matrixTransform(this.matrix).y, this.handles[6].matrixTransform(this.matrix).y);
        this.drawnRect = {
            left:minX + canvasRect.left,
            top:minY + canvasRect.top,
            width:maxX - minX,
            height:maxY - minY
        };
        const drawnRect = this.drawnRect;
        console.log(canvasRect);
        console.log(drawnRect);
        console.log(this.handles.map((x)=>x.matrixTransform(this.matrix)));
        this.center = [
            drawnRect.left + ((Math.abs(drawnRect.left - e.clientX) < drawnRect.width/2) ? drawnRect.width : 0),
            drawnRect.top + ((Math.abs(drawnRect.top - e.clientY) < drawnRect.height/2) ? drawnRect.height : 0)
        ];
        this.axis = [
            (Math.abs(drawnRect.left + drawnRect.width/2 - e.clientX) > drawnRect.width/3),
            (Math.abs(drawnRect.top + drawnRect.height/2 - e.clientY) > drawnRect.height/3)
        ];
        this.prevMatrix = this.matrix;
        this.pivot = new DOMPoint(this.center[0] - canvasRect.left, this.center[1] - canvasRect.top)
            .matrixTransform(DOMMatrix.fromFloat32Array(this.matrix.inverse().toFloat32Array()))
        ;
        console.log(this.pivot);
        this.matrix = this.prevMatrix
            .scale(
                this.axis[0] ? Math.abs(e.clientX-this.center[0])/drawnRect.width : 1,
                this.axis[1] ? Math.abs(e.clientY-this.center[1])/drawnRect.height : 1,
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

        const drawnRect = this.drawnRect;
        this.matrix =
        //new DOMMatrix()
        this.prevMatrix
            .scale(
                this.axis[0] ? Math.abs(e.clientX-this.center[0])/drawnRect.width : 1,
                this.axis[1] ? Math.abs(e.clientY-this.center[1])/drawnRect.height : 1,
                1,
                this.pivot.x,
                this.pivot.y,
                0
            )
            //.translate(this.center[0]-drawnRect.left,this.center[1]-drawnRect.top)
        ;
        this.render(layer);
    }
            
    startRotation(e:React.MouseEvent){
        const {currentTarget} = <{currentTarget:HTMLElement}><unknown>e;
        const drawnRect = currentTarget.getBoundingClientRect();
        this.center = [drawnRect.left + drawnRect.width / 2, drawnRect.top + drawnRect.height / 2];
        this.rotation = Math.atan2(e.clientY - this.center[1], e.clientX - this.center[0]) + Math.PI / 2;
    }
            
    rotate(e:React.MouseEvent, layer:LayerState){
        const angle = Math.atan2(e.clientY - this.center[1], e.clientX - this.center[0]) + Math.PI / 2 - this.rotation;
        layer.buffer.ctx?.rotate(angle * 180 / Math.PI);
        this.render(layer);
    }

    render(layer: LayerState) {
        //console.log(this.matrix);
        layer.handles = this.handles.map((pos,i)=>({key:565616651651+i, icon:(this.skewMode?'sk':'sc')+i, position:pos.matrixTransform(this.matrix), rotation:new DOMMatrix()}));
        layer.buffer.canvas.style.transform = this.matrix.toString();
        layer.buffer.canvas.style.transformOrigin = 'top left';
    }
})();
