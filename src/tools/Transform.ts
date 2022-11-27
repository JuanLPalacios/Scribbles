import Brush from '../abstracts/Brush';
import Tool from '../abstracts/Tool';
import { LayerState } from '../types/LayerState';
import { Point } from '../types/Point';
  
export const transform = new (class Transform extends Tool {
    center: Point = [0,0];
    rotation = 0;



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
        throw new Error('Method not implemented.');
    }

    skew(e:React.MouseEvent){
        throw new Error('Method not implemented.');
    }

    startScaling(e:React.MouseEvent){
        throw new Error('Method not implemented.');
    }

    scale(e:React.MouseEvent){
        throw new Error('Method not implemented.');
    }

    startRotation(e:React.MouseEvent, layer:LayerState){
        const {currentTarget} = <{currentTarget:HTMLElement}><unknown>e;
        const arrowRects = currentTarget.getBoundingClientRect();
        this.center = [arrowRects.left + arrowRects.width / 2, arrowRects.top + arrowRects.height / 2];
        layer.buffer.ctx?.rotate();;
    }

    rotate(e:React.MouseEvent, layer:LayerState){
        const angle = Math.atan2(e.clientY - this.center[1], e.clientX - this.center[0]) + Math.PI / 2;
        layer.buffer.ctx?.rotate(angle * 180 / Math.PI);
        this.render(layer);
    }

    render(layer: LayerState) {
        throw new Error('Method not implemented.');
    }
})();
