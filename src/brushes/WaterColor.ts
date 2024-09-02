import Brush from '../abstracts/Brush';
import { createDrawable } from '../generators/createDrawable';
import { DrawableState } from '../types/DrawableState';
import { Point } from '../types/Point';

export default class WaterColor extends Brush {
    loadObj(_obj: object): void {
        throw new Error('Method not implemented.');
    }
    toObj(): object {
        throw new Error('Method not implemented.');
    }
    lastPoint: Point = [0, 0];
    spred = 2;
    alpha:DrawableState;
    path:DrawableState;

    constructor(){
        super();
        this.alpha = createDrawable({ size: [1, 1] });
        this.path = createDrawable({ size: [1, 1] });
    }

    startStroke(drawable:DrawableState, point:Point, color:string, width:number) {
        this.lastPoint = point;
        const { canvas } = drawable;
        this.alpha.canvas.width = this.path.canvas.width = canvas.width;
        this.alpha.canvas.height = this.path.canvas.height = canvas.height;
        this.spred = 0;

        if (!this.alpha.ctx) return;
        if (!this.path.ctx) return;

        this.alpha.ctx.lineCap = 'round';
        this.alpha.ctx.lineJoin = 'round';

        this.path.ctx.strokeStyle = '#000000';
        this.path.ctx.lineCap = 'round';
        this.path.ctx.lineJoin = 'round';

        this.alpha.ctx.strokeStyle = color;
        this.alpha.ctx.lineWidth = width;
        this.path.ctx.lineWidth = width;
        this.drawStroke(drawable, point, color, width);
    }

    f = (x:number, c:number) => 0.5 * ((x-c) / (1 + Math.abs(x-c)) + 1);

    drawStroke(drawable:DrawableState, point:Point, color:string, width:number) {
        const [x, y] = point;
        const ctx = drawable.ctx;
        const fx0 = this.f(this.spred/5, 25);
        console.log('fx0', fx0);

        const c = 3;
        const maxW = width + c;
        if (!ctx) return;
        if (!this.alpha.ctx) return;
        if (!this.path.ctx) return;
        this.alpha.ctx.beginPath();
        this.alpha.ctx.strokeStyle = color;
        const dilution = .2 ;
        console.log('dilution', dilution);
        let diluted = 0;
        diluted += this.alpha.ctx.getImageData(...point, 1, 1).data[3];
        diluted += this.alpha.ctx.getImageData(x - maxW, y, 1, 1).data[3];
        diluted += this.alpha.ctx.getImageData(x + maxW, y, 1, 1).data[3];
        diluted += this.alpha.ctx.getImageData(x, y - maxW, 1, 1).data[3];
        diluted += this.alpha.ctx.getImageData(x, y + maxW, 1, 1).data[3];
        this.alpha.ctx.globalCompositeOperation = 'destination-out';
        this.alpha.ctx.globalAlpha = dilution/3;
        this.alpha.ctx.lineWidth = maxW;
        this.alpha.ctx.moveTo(...this.lastPoint);
        this.alpha.ctx.lineTo(...point);
        this.alpha.ctx.stroke();
        this.alpha.ctx.lineWidth = maxW+2*c;
        this.alpha.ctx.moveTo(...this.lastPoint);
        this.alpha.ctx.lineTo(...point);
        this.alpha.ctx.stroke();
        this.alpha.ctx.lineWidth = maxW+4*c;
        this.alpha.ctx.moveTo(...this.lastPoint);
        this.alpha.ctx.lineTo(...point);
        this.alpha.ctx.stroke();
        this.alpha.ctx.globalCompositeOperation = 'source-over';
        this.alpha.ctx.globalAlpha = Math.max((dilution*diluted*(maxW/width)/6), 1-fx0)/2;
        this.alpha.ctx.lineWidth = width;
        this.alpha.ctx.moveTo(...this.lastPoint);
        this.alpha.ctx.lineTo(...point);
        this.alpha.ctx.stroke();
        this.alpha.ctx.lineWidth = maxW;
        this.alpha.ctx.moveTo(...this.lastPoint);
        this.alpha.ctx.lineTo(...point);
        this.alpha.ctx.stroke();
        //this.alpha.ctx.lineWidth = width;
        //this.alpha.ctx.globalAlpha = 1/(10*this.spred);
        //this.alpha.ctx.beginPath();
        //this.alpha.ctx.strokeStyle = '#000000'+(~~(255*(1 - 1/this.spred))).toString(16);

        this.path.ctx.beginPath();
        this.path.ctx.moveTo(...this.lastPoint);
        this.path.ctx.lineTo(...point);
        this.path.ctx.stroke();
        ctx.globalCompositeOperation = 'copy';
        //ctx.globalAlpha = 1-.5*fx3;
        ctx.globalAlpha = 1;
        ctx.drawImage(this.alpha.canvas, 0, 0);
        ctx.globalCompositeOperation = 'destination-in';
        ctx.filter = 'none';
        ctx.drawImage(this.path.canvas, 0, 0);
        this.spred++;
        this.lastPoint = point;
    }

    endStroke(_drawable:DrawableState, _point:Point, _color:string, _width:number) {
        //this.alpha.ctx?.clearRect(0,0,this.alpha.canvas.width, this.alpha.canvas.height);
        //this.path.ctx?.clearRect(0,0,this.path.canvas.width, this.path.canvas.height);
    }
}
