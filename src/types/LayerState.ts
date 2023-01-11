import { BlendMode } from './BlendMode';
import { DrawableState } from './DrawableState';
import { Rect } from './Rect';
import { Handle } from './Handle';

export interface CompositeLayerState extends LayerCanvases, LayerState {}

export interface LayerCanvases {
  key: number;
  rect: Rect;
  canvas: DrawableState
  buffer?: DrawableState
  thumbnail: DrawableState
  handles: Handle[]
}

export interface LayerState {
  name: string;
  visible: boolean
  opacity: number
  mixBlendMode: BlendMode
  imageData:ImageData
}

