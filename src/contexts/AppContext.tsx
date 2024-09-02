import { JSXElementConstructor, ReactElement, ReactFragment, ReactPortal } from 'react';
import { EditorContextProvider } from './DrawingState';
import { MenuContextProvider } from './MenuOptions';
import { SingletonElementReferencesContextProvider } from './SingletonElementReferences';
import { StorageContextProvider } from './StorageContext';

export const AppStateProvider = (props: { children: string | number | boolean | ReactElement<unknown, string | JSXElementConstructor<unknown>> | ReactFragment | ReactPortal | null | undefined; }) => {
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