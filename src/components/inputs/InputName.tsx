import '../../css/inputs/InputName.css';
import { ChangeEventHandler, CSSProperties, useEffect, useState } from 'react';
import { useConfig } from '../../hooks/useConfig';

type Params = {
    name?: string;
    value?: string;
    style?: CSSProperties;
    onChange?: ChangeEventHandler<HTMLInputElement>;
    validate?: (value:string)=>string[]
};

export const InputName = ({ name, onChange, style, value, validate=()=>[] }:Params)=>{
    const [{ doubleClickTimeOut }] = useConfig();
    const [valueBuffer, setValueBuffer] = useState(value);
    const [error, setError] = useState<string>();
    const [editing, setEditing] = useState(false);
    const [t, setT] = useState<NodeJS.Timeout>();
    function onClick(){
        if(editing)return;
        setEditing(true);
        setT(
            setTimeout(()=>{
                setEditing(false);
            }, doubleClickTimeOut)
        );
    }
    function onBufferChange(e:React.ChangeEvent<HTMLInputElement>){
        const errors = validate(e.target.value);
        setError(errors[0]);
        setValueBuffer(e.target.value);
    }
    function onFocus(){
        if(t)clearTimeout(t);
    }
    function onBlur(e:React.FocusEvent<HTMLInputElement>){
        if((!error)&&onChange)onChange(e);
        else {
            setValueBuffer(value);
            setError(undefined);
        }
        setEditing(false);
    }
    useEffect(()=>{
        setValueBuffer(value);
    }, [value]);
    return <span className='InputName' style={style} onClick={onClick}  data-tip={editing?error:undefined}>
        {editing&&<input type="text" name={name} value={valueBuffer} onChange={onBufferChange} onFocus={onFocus} onBlur={onBlur} />}
        {valueBuffer}
    </span>;
};