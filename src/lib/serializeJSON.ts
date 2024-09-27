import { CompressedJSON } from '../brushes/CompressedOject';
import { SerializedImageData } from '../brushes/SerializedImageData';
import { Serialized } from './Serialization';

export const serializeJSON = (value: unknown): Serialized => ({ type: 'json', value: JSON.stringify(value) });
export const parseSerializedJSON = (value: CompressedJSON) => JSON.parse(value.value);
export const serializeImageData = (value: ImageData): SerializedImageData => {
    const { colorSpace, data, height, width } = value;
    return { colorSpace, height, width, data: Array.from(data) };
};
export function deserializeImageData(value: SerializedImageData, CANVAS: HTMLCanvasElement, CTX: CanvasRenderingContext2D) {
    const { colorSpace, data, height, width } = value;
    CANVAS.width = width;
    CANVAS.height = height;
    CTX.globalCompositeOperation = 'source-over';
    const imageData = CTX.getImageData(0, 0, width, height, { colorSpace });
    data.forEach((x, i) => imageData.data[i] = x);
    return imageData;
}
