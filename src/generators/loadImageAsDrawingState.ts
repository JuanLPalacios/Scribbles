import { DrawingState } from '../contexts/DrawingContext';
import { loadImageAsLayer } from './loadImageAsLayer';

export async function loadImageAsDrawingState(file: File): Promise<DrawingState> {
    return loadImageAsLayer(file).then(layer => {
        const { name, imageData: { height, width } } = layer;
        return {
            name,
            width,
            height,
            layers: [layer]
        };
    });
}
