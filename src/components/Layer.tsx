import { useEffect } from 'react';
import '../css/Layer.css';
import { Drawable } from './Drawable';
import { LayerState } from '../types/LayerState';
import { create } from 'domain';
import { createDrawable } from '../hooks/createDrawable';

const Layer = ({values}:{values:LayerState}) => {
    const {rect, canvas, buffer, thumbnail, visible, opacity, mixBlendMode} = values;
    const {
        position:[x, y],
        size: [ width, height ]
    } = rect;
  
    // resizeCanvas
    useEffect(()=>{
        if(buffer&&canvas){
            buffer.ctx?.restore();
            buffer.canvas.width = width;
            buffer.canvas.height =height;
            buffer.ctx?.drawImage(canvas.canvas, 0, 0);
            canvas.canvas.width = width;
            canvas.canvas.height =height;
            canvas.ctx?.restore();
            canvas.ctx?.drawImage(buffer.canvas, 0, 0);
        }
        if(thumbnail){
            const temp = createDrawable({size:[thumbnail.canvas.width,thumbnail.canvas.height]});
            temp.ctx?.drawImage(thumbnail.canvas, 0, 0);
            thumbnail.canvas.width = 40;
            thumbnail.canvas.height = thumbnail.canvas.width * (height / width);
            thumbnail.ctx?.drawImage(temp.canvas, 0, 0);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[width, height]);

    return (
        <div style={{ display:visible?'block':'none', left: `${x}px`, top: `${y}px`, opacity, mixBlendMode }}>
            <Drawable canvas={canvas?.canvas}/>
            <Drawable canvas={buffer?.canvas}/>
        </div>
    );
};

export default Layer;
