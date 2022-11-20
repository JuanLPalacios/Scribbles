import { Point } from "./Point";

export interface DrawableState {
  canvas:HTMLCanvasElement,
  ctx:CanvasRenderingContext2D | null
}