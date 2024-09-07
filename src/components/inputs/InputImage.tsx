import { ChangeEventHandler, CSSProperties, useRef } from 'react';
import '../../css/inputs/InputImage.css';
import { SerializedImage } from '../../brushes/SerializedOject';
import { useOpenFile } from '../../hooks/useOpenFile';
import { CustomInput } from '../../types/CustomInput';

export type ImageInput = CustomInput<SerializedImage>;

type Params = {
    name?: string | undefined;
    value?: SerializedImage;
    style?: CSSProperties | undefined;
    onChange?: ChangeEventHandler<ImageInput> | undefined;
};

export const InputImage = ({ name, onChange, style, value }:Params)=>{
    const ref2 = useRef<HTMLInputElement>(null);
    const openImage = useOpenFile((files)=>{
        if(!files){
            if(ref2.current){
                ref2.current.value = '';
            }
            return;
        }
        const fr = new FileReader();
        fr.onload=()=>{
            const image = fr.result;
            if((typeof image == 'string')&&ref2.current&&onChange){
                ref2.current.value = image;
                const target:EventTarget & ImageInput = { ...ref2.current, value: { type: 'img', value: image }, name: name||'' };
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
        fr.readAsDataURL(files[0]);
    }, [name, onChange], { accept: '.png' });
    return <div className='InputImage' style={style} onClick={openImage} onChange={onChange}>
        {value&&<img src={value.value} alt='tip image'/>}
        <input type="text" name={name} ref={ref2} style={{ display: 'none' }}/>
    </div>;
};