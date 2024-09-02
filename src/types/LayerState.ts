import { BlendMode } from './BlendMode';
import { DrawableState } from './DrawableState';
import { Rect } from './Rect';
import { Handle } from './Handle';
import { MenuOptions } from '../contexts/MenuOptions';

export interface LayerState {
  key: number;
  rect: Rect;
  name: string;
  canvas: DrawableState
  buffer: DrawableState
  thumbnail: DrawableState
  visible: boolean
  opacity: number
  mixBlendMode: BlendMode
  handles: Handle<MenuOptions>[]
  imageData: ImageData
}

