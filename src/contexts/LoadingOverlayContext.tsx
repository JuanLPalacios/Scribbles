import loadingIcon from '../icons/folder-open-svgrepo-com.svg';
import savingIcon from '../icons/save-svgrepo-com.svg';
import { createContext, useState, ReactNode } from 'react';
import { StatePair } from '../types/StatePair';
import ReactModal from 'react-modal';

export enum LoadingState {
    None,
    Loading,
    Saving
};

export const LoadingOverlayContext = createContext<StatePair<LoadingState>>([
    LoadingState.None,
    () => undefined
]
);

export const LoadingOverlayContextProvider = (props: { children: ReactNode }) => {
    const useLoadingOverlay = useState<LoadingState>(LoadingState.None);
    const [state] = useLoadingOverlay;
    return<LoadingOverlayContext.Provider value={useLoadingOverlay}>
        {props.children}
        <ReactModal isOpen={state!==LoadingState.None} style={{ content: { background: 'trasparent', borderWidth: 0 }, overlay: { zIndex: 11 } }} >
            {(state==LoadingState.Loading)&&<img src={loadingIcon} alt='Loading...' className='pulsating'/>}
            {(state==LoadingState.Saving)&&<img src={savingIcon} alt='Saving...' className='pulsating'/>}
        </ReactModal>
    </LoadingOverlayContext.Provider>;
};

