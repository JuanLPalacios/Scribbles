import Tool from '../abstracts/Tool';
import { DrawableState } from '../types/DrawableState';
import { MenuOptions } from '../types/MenuOptions';
import { Point } from '../types/Point';

export const fill = new (class Fill extends Tool {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    setup(options: MenuOptions<any>, setOptions: (options: MenuOptions<any>) => void): void {
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    dispose(options: MenuOptions<any>, setOptions: (options: MenuOptions<any>) => void): void {
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    mouseDown(point: DOMPoint, options: MenuOptions<any>, setOptions: (options: MenuOptions<any>) => void): void {
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    mouseUp(point: DOMPoint, options: MenuOptions<any>, setOptions: (options: MenuOptions<any>) => void): void {
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    mouseMove(point: DOMPoint, options: MenuOptions<any>, setOptions: (options: MenuOptions<any>) => void): void {
    }

    click(point: DOMPoint, options: MenuOptions<any>, setOptions: (options: MenuOptions<any>) => void): void {
        const { drawing, selectedLayer, color } = options;
        if(!drawing) return;
        const { layers } = drawing;
        const layer = layers[selectedLayer];
        const { x, y } = point;
        const { rect: { position: [dx, dy] } } = layer;
        const px = x - dx, py = y - dy;
        const { canvas, buffer } = layer;
        if(!buffer.ctx) return;
        buffer.ctx.fillStyle = color;
        this.fill(
            canvas,
            buffer,
            .15,
            Math.floor(px),
            Math.floor(py),
            parseColor(color),
            canvas.ctx?.getImageData(px, py, 1, 1).data || [0, 0, 0, 0]
        );
        if(!canvas.ctx) return;
        canvas.ctx.globalCompositeOperation = 'source-over';
        canvas.ctx.globalAlpha = 1;
        canvas.ctx.drawImage(buffer.canvas, 0, 0);
        buffer.ctx.clearRect(0, 0, buffer.canvas.width, buffer.canvas.height);
        this, this.renderThumbnail(layer);
    }

    fill(canvas: DrawableState, buffer: DrawableState, tolerance:number, ox: number, oy: number, color: Uint8ClampedArray | number[], oColor: Uint8ClampedArray | number[]) {
        const canvasWidth = canvas.canvas.width;
        const canvasHeight = canvas.canvas.height;
        const imageData = canvas.ctx?.getImageData(0, 0, canvasWidth, canvasHeight);
        if(!imageData) return;
        const propagationStack:Point[] = [[ox, oy]];
        while(propagationStack.length>0)
        {
            const point = propagationStack.pop() as Point;
            let dataPos, reachLeft, reachRight;
            const x = point[0];
            let y = point[1];
            dataPos = (y*canvasWidth + x) * 4;
            if (this.matchStartColor(imageData, dataPos, color) === 0)
                continue;

            while(y-- >= 0 && (this.matchStartColor(imageData, dataPos, oColor)<=tolerance))
            {
                dataPos -= canvasWidth * 4;
            }
            dataPos += canvasWidth * 4;
            ++y;
            reachLeft = false;
            reachRight = false;
            const startY = y;
            let endY = y;
            while(y++ < canvasHeight-1 && (this.matchStartColor(imageData, dataPos, oColor)<=tolerance))
            {
                this.colorPixel(imageData, dataPos, color);
                endY = y;
                if(x > 0) {
                    if((this.matchStartColor(imageData, dataPos - 4, oColor)<=tolerance)) {
                        if(!reachLeft){
                            propagationStack.push([x - 1, y]);
                            reachLeft = true;
                        }
                    }
                    else if(reachLeft)
                        reachLeft = false;
                }

                if(x < canvasWidth-1) {
                    if((this.matchStartColor(imageData, dataPos + 4, oColor))<=tolerance) {
                        if(!reachRight) {
                            propagationStack.push([x + 1, y]);
                            reachRight = true;
                        }
                    }
                    else if(reachRight)
                        reachRight = false;
                }

                dataPos += canvasWidth * 4;
            }
            buffer.ctx?.fillRect(x, startY, 1, endY-startY+1);
        }
    }

    colorPixel(imageData: ImageData, dataPos: number, color: Uint8ClampedArray | number[]) {
        //this needs to affect cache

        imageData.data[dataPos] = color[0];
        imageData.data[dataPos+1] = color[1];
        imageData.data[dataPos+2] = color[2];
        imageData.data[dataPos+3] = color[3];
    }

    matchStartColor(imageData: ImageData, dataPos: number, color: Uint8ClampedArray | number[]) {
        //this needs a cache

        const r0 = color[0];
        const g0 = color[1];
        const b0 = color[2];
        const a0 = color[3];

        const r = imageData.data[dataPos];
        const g = imageData.data[dataPos+1];
        const b = imageData.data[dataPos+2];
        const a = imageData.data[dataPos+3];

        const dA = (a-a0)/255;
        return this.colordifference_ch(r, r0, dA) +
               this.colordifference_ch(g, g0, dA) +
               this.colordifference_ch(b, b0, dA);
    }

    colordifference_ch(a:number, b:number, dA:number){
        const black = (a-b)/255, white = black+dA;
        return Math.max(black*black, white*white);
    }
})();

function parseColor(color:string): [number, number, number, number] {
    //this needs to be moved to a lib or repaced by one

    return [
        parseInt(color.substring(1, 3), 16),
        parseInt(color.substring(3, 5), 16),
        parseInt(color.substring(5, 7), 16),
        parseInt(color.substring(7), 16)
    ];
}