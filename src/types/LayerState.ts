import { DrawableState } from "./DrawableState";
import { Rect } from "./Rect";

export interface LayerState {
  key: number;
  rect: Rect;
  name: string;
  canvas:DrawableState
  buffer: DrawableState;
  thumbnail: DrawableState;
  onRenderThumbnail?: () => void
  selected:boolean
}

