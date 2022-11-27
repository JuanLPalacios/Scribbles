import Brush from '../abstracts/Brush';
import Tool from '../abstracts/Tool';
import { LayerState } from '../types/LayerState';
import { Point } from '../types/Point';
  
export const transform = new (class Transform extends Tool {
    center: Point = [0,0];
    rotation = 0;
    axis: [boolean,boolean] = [false,false];



    mouseDown(brush:Brush, {nativeEvent}:React.MouseEvent, layer:LayerState, color:string, width:number) {
        nativeEvent.preventDefault();
    }

    mouseMove(brush:Brush, e:React.MouseEvent, layer:LayerState, color:string, width:number) {
        const {nativeEvent} = e;
        const {currentTarget} = <{currentTarget:HTMLElement}><unknown>e;
        nativeEvent.preventDefault();
        
        console.log(
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
        );
    }


    
    mouseUp(brush:Brush, {nativeEvent}:React.MouseEvent, layer:LayerState, color:string, width:number) {
        nativeEvent.preventDefault();
    }
    
    click(brush:Brush, e:React.MouseEvent, layer:LayerState, color:string, bwidth:number) {
        const {nativeEvent} = e;
        nativeEvent.preventDefault();
        console.log(
            nativeEvent.offsetX,
            nativeEvent.offsetY
        );
    }

    startTranslation(e:React.MouseEvent){
        throw new Error('Method not implemented.');
    }

    translate(e:React.MouseEvent){
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

    startScaling(e:React.MouseEvent){
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

    scale(e:React.MouseEvent, layer:LayerState){
        const {currentTarget} = <{currentTarget:HTMLElement}><unknown>e;
        const drawnRect = currentTarget.getBoundingClientRect();
        layer.buffer.ctx?.scale(
            this.axis[0] ? (e.clientX-this.center[0])/drawnRect.width : 1,
            this.axis[1] ? (e.clientY-this.center[1])/drawnRect.height : 1
        );
        this.render(layer);
    }

    startRotation(e:React.MouseEvent, layer:LayerState){
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
        throw new Error('Method not implemented.');
    }
})();
