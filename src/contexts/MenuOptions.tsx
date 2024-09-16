import { createContext, ReactNode, useMemo, useState } from 'react';
import { uid } from '../lib/uid';
import { draw } from '../tools/Draw';
import { erase } from '../tools/Erase';
import { fill } from '../tools/Fill';
import { transform } from '../tools/Transform';
import drawIcon from '../icons/brush-f-svgrepo-com.svg';
import eraseIcon from '../icons/erase-svgrepo-com.svg';
import fillIcon from '../icons/color-bucket-svgrepo-com.svg';
import transformIcon from '../icons/nametag-svgrepo-com.svg';
import { ToolButton } from '../types/ToolButton';
import { StatePair } from '../types/StatePair';
import { useBrushes } from '../hooks/useBrushes';
import { BrushesContextProvider, BrushOptions } from './BrushOptions';
import { DrawC } from '../tools/DrawC';
import { EraseC } from '../tools/EraseC';

export type MenuOptions2 = ToolOptions & ColorOptions & AlphaOptions & ToleranceOptions

export type MenuOptions = ToolOptions & BrushOptions & ColorOptions & AlphaOptions & ToleranceOptions

export type ToolOptions = {
    tools:ToolButton[],
    selectedTool:number
};

export type ColorOptions = {
    color:string,
};

export type AlphaOptions = {
    alpha:number,
};

export type ToleranceOptions = {
    tolerance:number,
};

export const MenuContext = createContext<StatePair<MenuOptions>>([
    {
        brushesPacks: [],
        brushWidth: 0,
        selectedBrush: 0,
        selectedTool: 0,
        tools: [],
        color: '#000000',
        alpha: 1,
        tolerance: 0,
    },
    ()=>undefined]
);

export const MenuContextProvider2 = (props: { children: ReactNode }) => {
    const [brushesOptions, setBrushesOptions] = useBrushes();
    const [options2, setOptions2] = useState<MenuOptions2>(()=>{
        const r:MenuOptions2 = {
            tools: [
                { key: uid(), Tool: draw, ToolC: DrawC, name: 'draw', icon: drawIcon },
                { key: uid(), Tool: erase, ToolC: EraseC, name: 'erase', icon: eraseIcon },
                { key: uid(), Tool: fill, ToolC: DrawC, name: 'fill', icon: fillIcon },
                { key: uid(), Tool: transform, ToolC: DrawC, name: 'transform', icon: transformIcon }
            ],
            selectedTool: 0,
            color: '#000000',
            alpha: 1,
            tolerance: 0.15,
        };
        return r;
    });
    const useMenuOptions = useMemo<StatePair<MenuOptions>>(()=>([
        {
            ...options2,
            ...brushesOptions
        },
        (options)=>{
            if(typeof options === 'function') options = options(useMenuOptions[0]);
            const { brushesPacks: brushes, brushWidth, selectedBrush, ...options2 } =  options;
            setBrushesOptions({ brushesPacks: brushes, brushWidth, selectedBrush });
            setOptions2(options2);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    ]), [brushesOptions, options2]);
    return<MenuContext.Provider value={useMenuOptions}>
        {props.children}
    </MenuContext.Provider>;
};

export const MenuContextProvider = (props: { children: ReactNode }) => {
    const providers = [
        BrushesContextProvider,
        MenuContextProvider2
    ];
    return providers.reverse().reduce((children, Provider)=><Provider>{children}</Provider>, props.children);
};

