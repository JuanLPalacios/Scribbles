import { uid } from '../lib/uid';
import { LayerState2, EditorLayerState } from '../types/LayerState';
import { createDrawable } from './createDrawable';

export const createEditorLayer = ({ imageData }: LayerState2): EditorLayerState => {
    const { width, height } = imageData;
    const canvas = createDrawable({ size: [width, height] });
    const thumbnail = createDrawable({ size: [40, 40 * (height / width)] });

    // dummy context and canvas for creating initial imageData state
    const ctx = document.createElement('canvas').getContext('2d');
    if (!ctx) throw new Error('2d context could not be created');

    return {
        key: uid(),
        canvas,
        thumbnail,
        handles: [],
    };
};
