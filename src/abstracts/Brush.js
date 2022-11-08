import Tool from "./Tool";

export default class Brush extends Tool {

    lastPoint;
    
    constructor(width, mode) {
        super();
        this.width = width;
        this.mode = mode;
        this.down = false
    }

    renderPreview(ctx, points, color){
        points.forEach((point, i) => {
            if(i === 0) this.startStroke(ctx, point, color)
            else this.continueStroke(ctx, point, color)
        });
        this.endStroke(ctx)
    }

    startStroke(ctx, point, color) {
        this.down = true;
        this.lastPoint = point;
    }

    drawStroke(ctx, point, color) {
        ctx.beginPath();
        ctx.moveTo(...this.lastPoint);
        ctx.strokeStyle = color;
        ctx.lineWidth = this.width;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.lineTo(point);
        ctx.stroke();
        this.lastPoint = point;
    }

    endStroke(ctx) {
        this.down = false;
    }

    mouseDown = (e, layer, color) => {
        e.preventDefault();
        this.startStroke(layer.ctx,[e.offsetX, e.offsetY], color);
    }
    mouseUp = (e, layer, color) => {
        this.endStroke()
    }
    mouseMove = (e, layer, color) => {
        e.preventDefault();
        this.continueStroke(layer.ctx,[e.offsetX, e.offsetY], color);
    }
    click = (e, layer, color) => {
        e.preventDefault();
    }
}