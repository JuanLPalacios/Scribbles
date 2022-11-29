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
    pivot = new DOMMatrix();
    ipivot = new DOMMatrix();
    axis: [boolean,boolean] = [false,false];
    action: 'none' | 'scale' | 'rotate' = 'none';
    
    setup(options: MenuOptions<any>, setOptions: (options: MenuOptions<any>) => void): void {
        //throw new Error('Method not implemented.');
        const { layers, selectedLayer, brushes, selectedBrush } = options;
        const layer = layers[selectedLayer];
        const {canvas} = layer;
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
        this.startScaling(e, layer);
    }
    
    mouseUp(e: MouseEvent, options: MenuOptions<any>, setOptions: (options: MenuOptions<any>) => void): void {
        const { layers, selectedLayer, brushes, selectedBrush } = options;
        //throw new Error('Method not implemented.');
        this.action = 'none';
    }
    
    mouseMove(e: MouseEvent, options: MenuOptions<any>, setOptions: (options: MenuOptions<any>) => void): void {
        const { layers, selectedLayer, brushes, selectedBrush } = options;
        const layer = layers[selectedLayer];
        const {currentTarget} = <{currentTarget:HTMLElement}><unknown>e;
        const {nativeEvent} = e;
        nativeEvent.preventDefault();
        
        this.scale(e, layer);
        
        setOptions({...options});
        /*console.log(
            'currentTarget',
            currentTarget.offsetLeft,
            currentTarget.offsetTop
        );
        console.log(
            'page',
            e.pageX,
            e.pageY
        );
        console.log(
            'client',
            e.clientX,
            e.clientY
        );
        console.log(
            'screen',
            e.screenX,
            e.screenY
        );
        console.log(
            'movement',
            e.movementX,
            e.movementY
        );
        console.log(
            'plane',
            nativeEvent.x,
            nativeEvent.y
        );
        console.log(
            'offset',
            nativeEvent.offsetX,
            nativeEvent.offsetY
        );*/
    }
    
    click(e: MouseEvent, options: MenuOptions<any>, setOptions: (options: MenuOptions<any>) => void): void {
        const { layers, selectedLayer, brushes, selectedBrush } = options;
        const {nativeEvent} = e;
        nativeEvent.preventDefault();
        console.log(
            nativeEvent.offsetX,
            nativeEvent.offsetY
        );
    }

    startTranslation(){
        throw new Error('Method not implemented.');
    }

    translate(){
        throw new Error('Method not implemented.');
    }

    startSkewering(e:React.MouseEvent){
        const {currentTarget} = <{currentTarget:HTMLElement}><unknown>e;
        const drawnRect = currentTarget.getBoundingClientRect();
        this.center = [
            drawnRect.left + ((Math.abs(drawnRect.left - e.clientX) > drawnRect.width/2) ? drawnRect.width : 0),
            drawnRect.top + ((Math.abs(drawnRect.top - e.clientY) > drawnRect.height/2) ? drawnRect.height : 0)
        ];
        this.axis = [
            (Math.abs(drawnRect.left + drawnRect.width/2 - e.clientX) > drawnRect.width/3),
            (Math.abs(drawnRect.top + drawnRect.height/2 - e.clientY) > drawnRect.height/3)
        ];
    }
    
    skew(e:React.MouseEvent, layer:LayerState){
        const {currentTarget} = <{currentTarget:HTMLElement}><unknown>e;
        const drawnRect = currentTarget.getBoundingClientRect();
        layer.buffer.ctx?.transform( 
            1,
            this.axis[0] ? (e.clientX-this.center[0])/drawnRect.height : 1,
            this.axis[1] ? (e.clientY-this.center[1])/drawnRect.width : 1,
            1,0,0
        );
        this.render(layer);
    }
        
    startScaling(e:React.MouseEvent, layer:LayerState){
        const {currentTarget} = <{currentTarget:HTMLElement}><unknown>e;
        const canvasRect = layer.canvas.canvas.getBoundingClientRect();
        const drawnRect = {
            left:this.handles[0].matrixTransform(this.matrix).x + canvasRect.left,
            top:this.handles[0].matrixTransform(this.matrix).y + canvasRect.top,
            width:this.handles[4].matrixTransform(this.matrix).x - this.handles[0].matrixTransform(this.matrix).x,
            height:this.handles[4].matrixTransform(this.matrix).y - this.handles[0].matrixTransform(this.matrix).y
        };
        console.log(drawnRect);
        console.log(this.handles);
        this.center = [
            drawnRect.left + ((Math.abs(drawnRect.left - e.clientX) < drawnRect.width/2) ? drawnRect.width : 0),
            drawnRect.top + ((Math.abs(drawnRect.top - e.clientY) < drawnRect.height/2) ? drawnRect.height : 0)
        ];
        this.axis = [
            (Math.abs(drawnRect.left + drawnRect.width/2 - e.clientX) > drawnRect.width/3),
            (Math.abs(drawnRect.top + drawnRect.height/2 - e.clientY) > drawnRect.height/3)
        ];
        this.ipivot = this.matrix.translate(this.center[0]-drawnRect.left,this.center[1]-drawnRect.top)
            .scale(
                this.axis[0] ? (e.clientX-this.center[0])/Math.abs(e.clientX-this.center[0]) : 1,
                this.axis[1] ? (e.clientY-this.center[1])/Math.abs(e.clientY-this.center[1]) : 1
            );
        this.pivot = new DOMMatrix().translate(-this.center[0]+drawnRect.left,-this.center[1]+drawnRect.top);
        this.matrix = this.ipivot
            .multiply(this.pivot)
            .scale(
                this.axis[0] ? (e.clientX-this.center[0])/drawnRect.width : 1,
                this.axis[1] ? (e.clientY-this.center[1])/drawnRect.height : 1
            );
        this.action = 'scale';
    }
    
    scale(e:React.MouseEvent, layer:LayerState){
        if(this.action !== 'scale') return;
        const {currentTarget} = <{currentTarget:HTMLElement}><unknown>e;
        const drawnRect = currentTarget.getBoundingClientRect();
        this.matrix =
        //new DOMMatrix()
        this.ipivot
            .scale(
                this.axis[0] ? (e.clientX-this.center[0])/drawnRect.width : 1,
                this.axis[1] ? (e.clientY-this.center[1])/drawnRect.height : 1
            )
            .multiply(this.pivot)
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
        layer.handles = this.handles.map((pos,i)=>({key:565616651651+i, icon:''+i, position:pos.matrixTransform(this.matrix), rotation:new DOMMatrix()}));
    }
})();
