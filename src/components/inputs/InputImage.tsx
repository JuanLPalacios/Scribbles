import { ChangeEvent, ChangeEventHandler, CSSProperties, useRef } from 'react';
import '../../css/inputs/InputImage.css';
type Params = {
    name?: string | undefined;
    value?: string;
    style?: CSSProperties | undefined;
    onChange?: ChangeEventHandler<HTMLInputElement> | undefined;
};

export const InputImage = ({ name, onChange, style, value }:Params)=>{
    const ref = useRef<HTMLInputElement>(null);
    const ref2 = useRef<HTMLInputElement>(null);
    const loadImage = (e:ChangeEvent<HTMLInputElement>)=>{
        const { target } = e;
        const { files } = target;
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
                onChange({ ...e, target: ref2.current });
            }
        };
        fr.readAsDataURL(files[0]);
    };
    return <div className='InputImage' style={style} onClick={e=>ref.current?.click()}>
        {value&&<img src={value} alt='tip image'/>}
        <input type="text" name={name} ref={ref2} style={{ display: 'none' }}/>
        <input type="file" onChange={loadImage} ref={ref} style={{ display: 'none' }}/>
    </div>;
};