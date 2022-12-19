import { JSXElementConstructor, ReactElement, ReactFragment, ReactPortal, useState } from 'react';
import Marker from './brushes/Marker';
import Solid from './brushes/Solid';
import StiffBrush from './brushes/StiffBrush';
import { DrawingContext, DrawingState } from './contexts/DrawingState';
import { MenuOptions, MenuContext } from './contexts/MenuOptions';
import { ModalState, ModalContext } from './contexts/ModalState';
import { uid } from './lib/uid';
import { draw } from './tools/Draw';
import { erase } from './tools/Erase';
import { fill } from './tools/Fill';
import { transform } from './tools/Transform';

const roundFibers:{ position: DOMPoint, width: number, alpha:number }[] = [];
const diagonalFibers:{ position: DOMPoint, width: number, alpha:number }[] = [];
const roundFibersNumber = 16;
for (let i = 0; i < roundFibersNumber; i++) {
    const width = Math.sqrt(.7/roundFibersNumber);
    const r = (1-width)*Math.random();
    const phi = 360*Math.random();
    const alpha = Math.random();
    roundFibers.push({
        alpha,
        position: new DOMPoint(1, 0).matrixTransform(
            new DOMMatrix()
                .scale(r, r)
                .rotate(phi)),
        width
    });
}
for (let i = 0; i < roundFibersNumber/2; i++) {
    const width = Math.sqrt(.7/roundFibersNumber);
    const r = 2*(1-width)*Math.random()-1;
    const phi = 45;
    const alpha = Math.random();
    diagonalFibers.push({
        alpha,
        position: new DOMPoint(1, 0).matrixTransform(
            new DOMMatrix()
                .scale(r, r)
                .rotate(phi)),
        width
    });
}
export const AppStateProvider = (props: { children: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | ReactFragment | ReactPortal | null | undefined; }) => {
    const useDrawing = useState<DrawingState | undefined>();
    const useMenuOptions = useState<MenuOptions>({
        brushes: [
            new Solid(),
            new Marker(),
            new StiffBrush(roundFibers),
            new StiffBrush(diagonalFibers),
        ],
        selectedBrush: 0,
        brushWidth: 20,
        tools: [
            { key: uid(), Tool: draw, name: 'draw' },
            { key: uid(), Tool: erase, name: 'erase' },
            { key: uid(), Tool: fill, name: 'fill' },
            { key: uid(), Tool: transform, name: 'transform' }
        ],
        selectedTool: 0,
        color: '#000000',
        alpha: 255,
    });
    const useModal = useState<ModalState|undefined>();
    return<DrawingContext.Provider value={useDrawing}>
        <MenuContext.Provider value={useMenuOptions}>
            <ModalContext.Provider value={useModal}>
                {props.children}
            </ModalContext.Provider>
        </MenuContext.Provider>
    </DrawingContext.Provider>;
};