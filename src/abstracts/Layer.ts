import { Rect } from "../types/Rect";

export default class Layer {
  key: number;
  rect: Rect;
  name: string;
  _canvas?: HTMLCanvasElement;
  ctx?: CanvasRenderingContext2D | null;
  _buffer?: HTMLCanvasElement;
  bufferCtx?: CanvasRenderingContext2D | null;
  _thumbnail?: HTMLCanvasElement | null;
  thumbnailCtx?: CanvasRenderingContext2D | null;
  selected:boolean

  constructor(x:number, y:number, width:number, height:number, name:string) {
    this.key = Date.now();
    this.rect = {
      position: [x,y],
      size: [width,height]
    };
    this.name = name;
    this.selected = false;
  }

  get canvas() {
    return this._canvas;
  }

  set canvas(val:HTMLCanvasElement | undefined) {
    if (!val) return;
    this._canvas = val;
    this.resizeThumbnail();
    this.ctx = val.getContext('2d');
  }

  get buffer() {
    return this._buffer;
  }

  set buffer(val:HTMLCanvasElement | undefined) {
    if (!val) return;
    this._buffer = val;
    this.bufferCtx = val.getContext('2d');
  }

  get thumbnail() {
    return this._thumbnail;
  }

  set thumbnail(val:HTMLCanvasElement|null|undefined) {
    if (this._thumbnail === val) return;
    this._thumbnail = val;
    if (!val) return;
    this.resizeThumbnail();
    this.thumbnailCtx = val.getContext('2d');
    this.renderThumbnail();
  }

  resizeThumbnail() {
    if (!this._thumbnail) return;
    if (!this._canvas) return;
    this._thumbnail.width = 100;
    this._thumbnail.height = 100 * (this._canvas.height / this._canvas.width);
  }

  renderThumbnail() {
    if (!this._thumbnail) return;
    if (!this._canvas) return;
    this._thumbnail.height = this._thumbnail.width * (this._canvas.height / this._canvas.width);
    this.thumbnailCtx?.drawImage(this._canvas, 0, 0, this._thumbnail.width, this._thumbnail.height);
  }
}
