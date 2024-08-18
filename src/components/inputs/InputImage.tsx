import { ChangeEvent, ChangeEventHandler, CSSProperties, useRef, useState } from 'react';
import '../../css/inputs/InputImage.css';
type Params = {
    name?: string | undefined;
    value?: HTMLCanvasElement | ReadonlyArray<HTMLCanvasElement> | undefined;
    style?: CSSProperties | undefined;
    onChange?: ChangeEventHandler<HTMLInputElement> | undefined;
};

type State = {
    image?: string;
};

export const InputImage = ({ name, onChange, style, value }:Params)=>{
    const ref = useRef<HTMLInputElement>(null);
    const [state, setState] = useState<State>({});
    const { image } = state;
    const loadImage = (e:ChangeEvent<HTMLInputElement>)=>{
        const { target } = e;
        const { files } = target;
        if(!files){
            setState({ ...state, image: undefined });
            return;
        }
        const fr = new FileReader();
        fr.onload=()=>{
            const image = fr.result;
            if(typeof image == 'string')
                setState({ ...state, image });
        };
        fr.readAsDataURL(files[0]);
    };
    return <div className='InputImage' onClick={e=>ref.current?.click()}>
        {image&&<img src={image} alt='tip image'/>}
        <input type="file" name={name} onChange={loadImage} ref={ref} style={{ display: 'none' }}/>
    </div>;
};