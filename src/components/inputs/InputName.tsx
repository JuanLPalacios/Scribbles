import { ChangeEventHandler, CSSProperties, useMemo, useState } from 'react';
import '../../css/inputs/InputName.css';
import { CustomInput } from '../../types/CustomInput';
import { SerializedImageData } from '../../types/SerializedImageData';

export type ImageInput = CustomInput<SerializedImageData>;

type Params = {
    name?: string;
    value?: string;
    style?: CSSProperties;
    onChange?: ChangeEventHandler<HTMLInputElement>;
};

export const InputName = ({ name, onChange, style, value }:Params)=>{
    const [valueBuffer, setValueBuffer] = useState(value);
    const [editing, setEditing] = useState(false);
    const { onClick, onBlur } = useMemo(()=>{
        let t = 0;
        return {
            onClick(){
                if(editing)return;
                const timeStamp = Date.now();
                const a = timeStamp - t;
                if(a <= 10000000){
                    setEditing(true);
                }
                t = timeStamp;
            },
            onBlur(e:React.FocusEvent<HTMLInputElement>){
                if(onChange)onChange(e);
                setEditing(false);
            }
        };
    }, [editing, onChange]);
    return <span className='InputName' style={style} onClick={onClick}>
        {editing&&<input type="text" name={name} value={valueBuffer} onChange={e=>setValueBuffer(e.target.value)} onBlur={onBlur}/>}
        {value}
    </span>;
};