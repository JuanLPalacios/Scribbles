import { ReactNode } from "react";
import Layer from "./Layer";

export default abstract class Tool {
  abstract mouseDown(e:React.MouseEvent, layer:Layer, color:string):void;
  abstract mouseUp(e:React.MouseEvent, layer:Layer, color:string):void;
  abstract mouseMove(e:React.MouseEvent, layer:Layer, color:string):void;
  abstract click(e:React.MouseEvent, layer:Layer, color:string):void;
  abstract Menu(props:any):any
}
