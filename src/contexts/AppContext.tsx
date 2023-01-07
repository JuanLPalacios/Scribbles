import { JSXElementConstructor, ReactElement, ReactFragment, ReactPortal, useReducer, useState } from 'react';
import Marker from '../brushes/Marker';
import Solid from '../brushes/Solid';
import StiffBrush from '../brushes/StiffBrush';
import { reducer, EditorContext } from './EditorState';
import { MenuOptions, MenuContext } from './MenuOptions';
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

const randomRoundFibers:{ position: DOMPoint, width: number, alpha:number }[] = [];
const randomDiagonalFibers:{ position: DOMPoint, width: number, alpha:number }[] = [];
const roundFibersNumber = 32;
for (let i = 0; i < roundFibersNumber; i++) {
    const width = Math.sqrt(2/roundFibersNumber)*Math.random();
    const r = (1-width)*(1 - Math.pow(Math.random(), 2));
    const phi = (i%8)*360/8 + 360*Math.random()/8;
    const alpha = 1;
    randomRoundFibers.push({
        alpha,
        position: new DOMPoint(1, 0).matrixTransform(
            new DOMMatrix()
                .scale(r, r)
                .rotate(phi)),
        width
    });
}
for (let i = 0; i < roundFibersNumber/2; i++) {
    const width = Math.sqrt(.7/roundFibersNumber)*Math.random();
    const r = 2*(1-width)*Math.random()-1;
    const phi = 45;
    const alpha = 1;
    randomDiagonalFibers.push({
        alpha,
        position: new DOMPoint(1, 0).matrixTransform(
            new DOMMatrix()
                .scale(r, r)
                .rotate(phi)),
        width
    });
}

export const AppStateProvider = (props: { children: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | ReactFragment | ReactPortal | null | undefined; }) => {
    const useDrawing = useReducer(reducer, { prev: [], next: [], });
    const useMenuOptions = useState<MenuOptions>({
        brushes: [
            new Solid(),
            new Marker(),
            new StiffBrush(round as any),
            new StiffBrush(oldRound as any),
            new StiffBrush(diagonal as any),
            new StiffBrush(randomRoundFibers),
            new StiffBrush(randomDiagonalFibers),
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
        alpha: 255,
        tolerance: 0.15,
    });
    return<EditorContext.Provider value={useDrawing}>
        <MenuContext.Provider value={useMenuOptions}>
            {props.children}
        </MenuContext.Provider>
    </EditorContext.Provider>;
};