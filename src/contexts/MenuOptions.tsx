import { createContext, JSXElementConstructor, ReactElement, ReactFragment, ReactPortal, useEffect, useState } from 'react';
import Marker from '../brushes/Marker';
import SolidBrush from '../brushes/Solid';
import StiffBrush from '../brushes/StiffBrush';
import { uid } from '../lib/uid';
import { draw } from '../tools/Draw';
import { erase } from '../tools/Erase';
import { fill } from '../tools/Fill';
import { transform } from '../tools/Transform';
import round from '../brushes/stiff/round.json';
import oldRound from '../brushes/stiff/oldRound.json';
import diagonal from '../brushes/stiff/flat.json';
import drawIcon from '../icons/brush-f-svgrepo-com.svg';
import eraseIcon from '../icons/erase-svgrepo-com.svg';
import fillIcon from '../icons/color-bucket-svgrepo-com.svg';
import transformIcon from '../icons/nametag-svgrepo-com.svg';
import TextureBrush from '../brushes/TextureBrush';
import Brush from '../abstracts/Brush';
import { ToolButton } from '../types/ToolButton';
import { StatePair } from '../types/StatePair';
import { useStorage } from '../hooks/useStorage';
import { brushFormObj, SerializedBrush } from '../lib/Serialization';

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

export type BrushOptions = {
    brushes:Brush[],
    selectedBrush:number,
    brushWidth:number,
};

export type ToleranceOptions = {
    tolerance:number,
};

export const MenuContext = createContext<StatePair<MenuOptions>>([
    {
        brushes: [],
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

export const MenuContextProvider = (props: { children: string | number | boolean | ReactElement<unknown, string | JSXElementConstructor<unknown>> | ReactFragment | ReactPortal | null | undefined; }) => {
    const [brushes] = useStorage<SerializedBrush[]>('brushes');
    const useMenuOptions = useState<MenuOptions>(()=>{
        const r:MenuOptions = {
            brushes: [
                new SolidBrush(),
                new TextureBrush(),
                new Marker(),
                new StiffBrush(round as ConstructorParameters<typeof StiffBrush>[0]),
                new StiffBrush(oldRound as ConstructorParameters<typeof StiffBrush>[0]),
                new StiffBrush(diagonal as ConstructorParameters<typeof StiffBrush>[0]),
            ],
            selectedBrush: 0,
            brushWidth: 20,
            tools: [
                { key: uid(), Tool: draw, name: 'draw', icon: drawIcon },
                { key: uid(), Tool: erase, name: 'erase', icon: eraseIcon },
                { key: uid(), Tool: fill, name: 'fill', icon: fillIcon },
                { key: uid(), Tool: transform, name: 'transform', icon: transformIcon }
            ],
            selectedTool: 0,
            color: '#000000',
            alpha: 1,
            tolerance: 0.15,
        };
        return r;
    });
    const [options, setOptions] = useMenuOptions;
    useEffect(()=>{
        if(brushes)
            setOptions({ ...options, brushes: brushes.map(brushFormObj) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [brushes]);
    return<MenuContext.Provider value={useMenuOptions}>
        {props.children}
    </MenuContext.Provider>;
};