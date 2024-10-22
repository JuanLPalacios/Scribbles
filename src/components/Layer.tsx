import { useEffect } from 'react';
import { Drawable } from './Drawable';
import { EditorLayerState, LayerState2 } from '../types/LayerState';
import { DrawableState } from '../types/DrawableState';
import { renderThumbnail } from '../lib/Graphics';

const Layer = ({ values, editor, buffer }:{ values:LayerState2, editor:EditorLayerState, buffer:DrawableState|undefined }) => {
    const { visible, opacity, mixBlendMode, imageData } = values;
    const { canvas, thumbnail } = editor;

    //update state of layer
    useEffect(()=>{
        canvas.ctx.putImageData(imageData, 0, 0);
    }, [canvas, imageData]);
    //update thumbnail
    useEffect(()=>{
        renderThumbnail(imageData, thumbnail);
    }, [imageData, thumbnail]);
    return (
        <div style={{ display: visible?'block':'none', left: '0px', top: '0px', opacity, mixBlendMode }}>
            <Drawable canvas={canvas?.canvas}/>
            <Drawable canvas={buffer?.canvas}/>
        </div>
    );
};

export default Layer;
