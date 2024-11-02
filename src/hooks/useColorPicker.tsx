import { useContext, useMemo } from 'react';
import { ColorPickingContext } from '../contexts/ColorPickingContext';

export const useColorPicker = ()=>{
    const[state, setState] = useContext(ColorPickingContext);
    return useMemo(()=>([state, {
        activateColorPicker(){
            setState({ color: '', active: true });
        },
        stopColorPicker(){
            setState({ ...state, active: false });
        },
        changeColor(color?:string){
            console.log(color);
            setState({ color, active: false });
        }
    }] as const), [setState, state]);
};
