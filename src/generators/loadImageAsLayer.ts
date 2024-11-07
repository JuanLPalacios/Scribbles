import { createDrawable } from './createDrawable';
import { createLayer2 } from './createLayer2';
import { LayerState2 } from '../types/LayerState';

export async function loadImageAsLayer(file: File): Promise<LayerState2> {
    const { canvas, ctx } = createDrawable({ size: [1, 1] });
    return new Promise<LayerState2>((resolve, reject) => {
        const fr = new FileReader();
        fr.onload = () => {
            const imageDtaUrl = fr.result;
            if (typeof imageDtaUrl != 'string') return;
            const image = new Image;
            image.onload = () => {
                const { width, height } = image;
                canvas.width = 0; //forces the canvas to clear
                canvas.width = width;
                canvas.height = height;
                ctx.globalCompositeOperation = 'source-over';
                ctx.drawImage(image, 0, 0);
                resolve(createLayer2(file.name, ctx.getImageData(0, 0, width, height)));
            };
            image.onerror = reject;
            image.src = imageDtaUrl;
        };
        fr.onerror = reject;
        fr.readAsDataURL(file);
    });
}
