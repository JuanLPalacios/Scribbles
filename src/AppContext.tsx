import { JSXElementConstructor, ReactElement, ReactFragment, ReactPortal, useState } from 'react';
import Marker from './brushes/Marker';
import { DrawingContext, DrawingState } from './contexts/DrawingState';
import { MenuOptions, MenuContext } from './contexts/MenuOptions';
import { ModalState, ModalContext } from './contexts/ModalState';
import { uid } from './lib/uid';
import { draw } from './tools/Draw';
import { erase } from './tools/Erase';
import { fill } from './tools/Fill';
import { transform } from './tools/Transform';

export const AppStateProvider = (props: { children: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | ReactFragment | ReactPortal | null | undefined; }) => {
    const useDrawing = useState<DrawingState | undefined>();
    const useMenuOptions = useState<MenuOptions>({
        selectedLayer: 0,
        brushes: [new Marker()],
        selectedBrush: 0,
        brushWidth: 20,
        tools: [
            { key: uid(), tool: draw, name: 'draw' },
            { key: uid(), tool: erase, name: 'erase' },
            { key: uid(), tool: fill, name: 'fill' },
            { key: uid(), tool: transform, name: 'transform' }
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