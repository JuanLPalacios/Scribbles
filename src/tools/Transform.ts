import Brush from '../abstracts/Brush';
import Tool from '../abstracts/Tool';
import { LayerState } from '../types/LayerState';
  
export const transform = new (class Transform extends Tool {
    mouseDown(brush:Brush, {nativeEvent}:React.MouseEvent, layer:LayerState, color:string, width:number) {
        nativeEvent.preventDefault();
    }

    mouseMove(brush:Brush, e:React.MouseEvent, layer:LayerState, color:string, width:number) {
        const {nativeEvent} = e;
        nativeEvent.preventDefault();
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
})();
