import { ChangeEventHandler, CSSProperties, useMemo, useRef } from 'react';
import '../../css/inputs/InputImage.css';
import { useOpenFile } from '../../hooks/useOpenFile';
import { CustomInput } from '../../types/CustomInput';
import { SerializedImageData } from '../../brushes/SerializedImageData';
import { Drawable } from '../Drawable';
import { createDrawable } from '../../generators/createDrawable';
import { serializeImageData } from '../../lib/serializeJSON';

export type ImageInput = CustomInput<SerializedImageData>;

type Params = {
    name?: string | undefined;
    value?: SerializedImageData;
    style?: CSSProperties | undefined;
    onChange?: ChangeEventHandler<ImageInput> | undefined;
};

export const InputImage = ({ name, onChange, style, value }:Params)=>{
    const { canvas, ctx } = useMemo(()=>createDrawable({ size: [1, 1] }), []);
    const ref2 = useRef<HTMLInputElement>(null);
    const openImage = useOpenFile((files)=>{
        if(!ctx)return;
        if(!files){
            if(ref2.current){
                ref2.current.value = '';
            }
            return;
        }
        const fr = new FileReader();
        fr.onload=()=>{
            const image = fr.result;
            if(typeof image != 'string')return;
            const img = new Image;
            img.onload = ()=>{
                if(ref2.current&&onChange){
                    canvas.width = 0; //forces the canvas to clear
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.globalCompositeOperation = 'source-over';
                    ctx.drawImage(img, 0, 0);
                    ref2.current.value = image;
                    const target:EventTarget & ImageInput = { ...ref2.current, value: serializeImageData(ctx.getImageData(0, 0, 20, 20)), name: name||'' };
                    const nativeEvent = new Event('change', { bubbles: false, cancelable: false, composed: true });
                    const { bubbles, type, cancelable, defaultPrevented, eventPhase, isTrusted, preventDefault, stopPropagation, timeStamp } = nativeEvent;
                    onChange({
                        nativeEvent,
                        currentTarget: target,
                        target,
                        bubbles,
                        cancelable,
                        defaultPrevented,
                        eventPhase,
                        isTrusted,
                        preventDefault,
                        isDefaultPrevented: ()=>false,
                        stopPropagation,
                        isPropagationStopped: ()=>false,
                        persist: ()=>{},
                        timeStamp,
                        type
                    });
                }
            };
            img.src = image;
        };
        fr.readAsDataURL(files[0]);
    }, [name, onChange], { accept: '.png' });
    return <div className='InputImage' style={style} onClick={openImage} onChange={onChange}>
        {value&&<Drawable canvas={canvas}></Drawable>}
        <input type="text" name={name} ref={ref2} style={{ display: 'none' }}/>
    </div>;
};