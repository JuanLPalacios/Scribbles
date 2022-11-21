import { BlendMode } from "./BlendMode";
import { DrawableState } from "./DrawableState";
import { Rect } from "./Rect";

export interface LayerState {
  key: number;
  rect: Rect;
  name: string;
  canvas?: DrawableState
  buffer?: DrawableState
  thumbnail?: DrawableState
  onRenderThumbnail?: () => void
  visible: boolean
  opacity: number
  mixBlendMode: BlendMode
}

