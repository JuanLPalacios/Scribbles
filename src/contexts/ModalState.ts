import { ReactNode, createContext } from 'react';
import { OnAfterOpenCallback } from 'react-modal';
import { StatePair } from '../types/StatePair';

export type ModalState = {
    isOpen:boolean,
    contents: ReactNode
    onRequestClose:()=>void,
    onAfterClose: (() => void) | undefined
    onAfterOpen: OnAfterOpenCallback | undefined
}

export const ModalContext = createContext<StatePair<ModalState|undefined>>([
    undefined,
    ()=>undefined]
);