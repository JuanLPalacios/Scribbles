
export const fillBucket = new (class FillBucket extends Object {
    setup(): void {
        throw new Error('Method not implemented.');
    }
    dispose(): void {
        throw new Error('Method not implemented.');
    }
    mouseDown(): void {
        throw new Error('Method not implemented.');
    }
    mouseUp(): void {
        throw new Error('Method not implemented.');
    }
    mouseMove(): void {
        throw new Error('Method not implemented.');
    }
    click(): void {
        throw new Error('Method not implemented.');
    }
    /*
    mouseDown(brush:Brush, {nativeEvent}:React.MouseEvent, layer:LayerState, color:string, width:number) {
        nativeEvent.preventDefault();
    }

    mouseMove(brush:Brush, {nativeEvent}:React.MouseEvent, layer:LayerState, color:string, width:number) {
        nativeEvent.preventDefault();
    }

    mouseUp(brush:Brush, {nativeEvent}:React.MouseEvent, layer:LayerState, color:string, width:number) {
        nativeEvent.preventDefault();
    }

    click(brush:Brush, {nativeEvent}:React.MouseEvent, layer:LayerState, color:string, bwidth:number) {
        nativeEvent.preventDefault();
        const width = 1024;
        const height = 1024;
        const ox = nativeEvent.offsetX;
        const oy = nativeEvent.offsetY;
        const x = Math.floor(ox/width);
        const y = Math.floor(oy/height);
        const mmx = Math.ceil(layer.canvas.canvas.width/width);
        const mmy = Math.ceil(layer.canvas.canvas.height/height);
        const sx = x*width;
        const sy = y*height;
        const [UProp, DProp, LProp, RProp] = this.fillchunk(layer.canvas,x,y,parseColor(color), layer.canvas.ctx?.getImageData(nativeEvent.offsetX,nativeEvent.offsetY,1,1).data || [0,0,0,0], [[ox-sx, oy-sy]]);
        console.log(
            UProp
        );
        console.log(
            DProp
        );
        console.log(
            LProp
        );
        console.log(
            RProp
        );
        //next = nn;
    }

    fillchunk(canvas: DrawableState, sx: number, sy: number, mmx: number, mmy: number, color: Uint8ClampedArray | number[], ocolor: Uint8ClampedArray | number[], pixelStack:Point[] = []): [Point[],Point[],Point[],Point[]] {
        let nn:Point[] = [];
        let [UProp, DProp, LProp, RProp] = this.fillchunk(canvas,sx,sy,mmx,mmy,color, ocolor, pixelStack);
        if(UProp.length>0)this.fillchunk(canvas,sx,sy-1,mmx,mmy,color,ocolor, UProp)
        if(DProp.length>0)this.fillchunk(canvas,sx,sy+1,mmx,mmy,color,ocolor, DProp)
        if(LProp.length>0)this.fillchunk(canvas,sx-1,sy,mmx,mmy,color,ocolor, LProp)
        if(RProp.length>0)this.fillchunk(canvas,sx+1,sy,mmx,mmy,color,ocolor, RProp)
        //next = nn;
    }
    chunk(canvas: DrawableState, ox: number, oy: number, color: Uint8ClampedArray | number[], ocolor: Uint8ClampedArray | number[], pixelStack:Point[] = []): [Point[],Point[],Point[],Point[]] {

        const width = 1024;
        const height = 1024;
        const sx = Math.floor(ox/width)*width;
        const sy = Math.floor(oy/height)*height;
        const canvasWidth = Math.min(256,canvas.canvas.width-sx);
        const canvasHeight = Math.min(256,canvas.canvas.height-sy);
        const chunk = canvas.ctx?.getImageData(sx,sy,canvasWidth,canvasHeight);
        if(!chunk) return [[],[],[],[]];
        const LProp:Point[] = [];
        const RProp:Point[] = [];
        const UProp:Point[] = [];
        const DProp:Point[] = [];

        while(pixelStack.length)
        {
            const newPos = pixelStack.pop() as Point;
            let pixelPos, reachLeft, reachRight;
            const x = newPos[0];
            let y = newPos[1];

            pixelPos = (y*canvasWidth + x) * 4;
            while(y-- >= 0 && this.matchStartColor(chunk, pixelPos, ocolor))
            {
                pixelPos -= canvasWidth * 4;
            }
            pixelPos += canvasWidth * 4;
            ++y;
            reachLeft = false;
            reachRight = false;
            while(y++ < canvasHeight-1 && this.matchStartColor(chunk, pixelPos, ocolor))
            {
                this.colorPixel(chunk, pixelPos, color);
                if(x == 0) LProp.push([width-1, y]);
                if(y == 0) UProp.push([x, height-1]);
                if(x == width-1) RProp.push([0, y]);
                if(y == height-1) DProp.push([x, 0]);
                if(x > 0)
                {
                    if(this.matchStartColor(chunk, pixelPos - 4, ocolor))
                    {
                        if(!reachLeft){
                            pixelStack.push([x - 1, y]);
                            reachLeft = true;
                        }
                    }
                    else if(reachLeft)
                    {
                        reachLeft = false;
                    }
                }

                if(x < canvasWidth-1)
                {
                    if(this.matchStartColor(chunk, pixelPos + 4, ocolor))
                    {
                        if(!reachRight)
                        {
                            pixelStack.push([x + 1, y]);
                            reachRight = true;
                        }
                    }
                    else if(reachRight)
                    {
                        reachRight = false;
                    }
                }

                pixelPos += canvasWidth * 4;
            }
        }
        canvas.ctx?.putImageData(chunk, sx, sy);
        return [UProp, DProp, LProp, RProp];
    }
    colorPixel(colorLayer: ImageData, pixelPos: number, color: Uint8ClampedArray | number[]) {
        const fillColorR = color[0];
        const fillColorG = color[1];
        const fillColorB = color[2];
        const a = color[3];

        colorLayer.data[pixelPos] = fillColorR;
        colorLayer.data[pixelPos+1] = fillColorG;
        colorLayer.data[pixelPos+2] = fillColorB;
        colorLayer.data[pixelPos+3] = a;
    }
    matchStartColor(colorLayer: ImageData, pixelPos: number, color: Uint8ClampedArray | number[]) {
        const startR = color[0];
        const startG = color[1];
        const startB = color[2];
        const startA = color[3];

        const r = colorLayer.data[pixelPos];
        const g = colorLayer.data[pixelPos+1];
        const b = colorLayer.data[pixelPos+2];
        const a = colorLayer.data[pixelPos+3];

        return (r == startR && g == startG && b == startB && a == startA);
    }
    */
})();

//function parseColor(color:string): [number, number, number, number] {
//    return [0, 0, 0, 0];
//}
