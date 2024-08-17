import { ChangeEventHandler, CSSProperties } from 'react';

type Params = {
    name?: string | undefined;
    value?: HTMLCanvasElement | ReadonlyArray<HTMLCanvasElement> | undefined;
    style?: CSSProperties | undefined;
    onChange?: ChangeEventHandler<HTMLInputElement> | undefined;
};
export const InputImage = ({ name, onChange, style, value }:Params)=>{
    return<></>;
};