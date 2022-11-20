import { ReactNode, useState } from 'react';
import { LayerState } from '../types/LayerState';
import Tool from './Tool';

export default abstract class Brush extends Tool {
  abstract lastPoint: any;
  abstract width: number;
  abstract mode: string;
  abstract down: boolean;
  setWidth: (width: number) => void;

  constructor(){
    super();
    this.setWidth = (width:number) => {
      this.width = width;
    }
  }

  abstract renderPreview(ctx:any, points:[number, number][], color:string):void
  
  abstract startStroke(layer:LayerState, point:[number, number], color:string):void

  abstract drawStroke(layer:LayerState, point:[number, number], color:string):void

  abstract endStroke(layer:LayerState, point:[number, number], color:string):void

  mouseDown({nativeEvent}:React.MouseEvent, layer:LayerState, color:string) {
    
    nativeEvent.preventDefault();
    this.startStroke(layer, [nativeEvent.offsetX, nativeEvent.offsetY], color);
  }

  mouseUp({nativeEvent}:React.MouseEvent, layer:LayerState, color:string) {
    this.endStroke(layer, [nativeEvent.offsetX, nativeEvent.offsetY], color);
    if(layer.onRenderThumbnail)layer.onRenderThumbnail();
  }

  mouseMove({nativeEvent}:React.MouseEvent, layer:LayerState, color:string) {
    nativeEvent.preventDefault();
    this.drawStroke(layer, [nativeEvent.offsetX, nativeEvent.offsetY], color);
  }

  click({nativeEvent}:React.MouseEvent, layer:LayerState, color:string) {
    nativeEvent.preventDefault();
  }

  Menu = Menu;
}


function Menu(props: any): ReactNode {
  const {width, mode, setWidth, setMode} = props
  return <label>
    width
  <input type="number" value={width} onChange={(e)=>setWidth(e.target.value)}/>
  </label>;
}