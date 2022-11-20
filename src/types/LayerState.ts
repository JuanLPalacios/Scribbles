import { DrawableState } from "./DrawableState";
import { Rect } from "./Rect";
import { RefState } from "./RefState";

export interface LayerState {
  key: number;
  rect: Rect;
  name: string;
  canvas?: DrawableState
  buffer?: DrawableState
  thumbnail?: DrawableState
  onRenderThumbnail?: () => void
  visible:boolean
  selected:boolean
}

