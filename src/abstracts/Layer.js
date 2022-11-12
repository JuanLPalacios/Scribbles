export default class Layer {
  constructor(x, y, width, height, name) {
    this.key = Date.now();
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.name = name;
  }

  get canvas() {
    return this._canvas;
  }

  set canvas(val) {
    if (!val) return;
    this._canvas = val;
    this.resizeThumbnail();
    this.ctx = val.getContext('2d');
  }

  get buffer() {
    return this._buffer;
  }

  set buffer(val) {
    if (!val) return;
    this._buffer = val;
    this.bufferCtx = val.getContext('2d');
  }

  get thumbnail() {
    return this._canvas;
  }

  set thumbnail(val) {
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
    this.thumbnailCtx.drawImage(this._canvas, 0, 0, this._thumbnail.width, this._thumbnail.height);
  }
}
