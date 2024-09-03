import { ReactNode } from 'react';
import { EditorContextProvider } from './DrawingState';
import { MenuContextProvider } from './MenuOptions';
import { SingletonElementReferencesContextProvider } from './SingletonElementReferences';
import { StorageContextProvider } from './StorageContext';

export const AppStateProvider = (props: { children: ReactNode }) => {
    return<StorageContextProvider>
        <SingletonElementReferencesContextProvider>
            <EditorContextProvider>
                <MenuContextProvider>
                    {props.children}
                </MenuContextProvider>
            </EditorContextProvider>
        </SingletonElementReferencesContextProvider>
    </StorageContextProvider>;
};