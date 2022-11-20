import { DrawableState } from "./DrawableState";
import { Rect } from "./Rect";
import { RefState } from "./RefState";

export interface LayerState {
  key: number;
  rect: Rect;
  name: string;
  canvas?: RefState<DrawableState>
  buffer?: RefState<DrawableState>
  thumbnail?: RefState<DrawableState>
  onRenderThumbnail?: () => void
  selected:boolean
}

