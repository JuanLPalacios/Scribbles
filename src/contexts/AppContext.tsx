import { ReactNode } from 'react';
import { MenuContextProvider } from './MenuOptions';
import { SingletonElementReferencesContextProvider } from './SingletonElementReferences';
import { StorageContextProvider } from './StorageContext';
import { EditorContextProvider } from './EditorContext';
import { BasicGlobalContextProvider } from './BasicGlobalContext';

export const AppStateProvider = (props: { children: ReactNode }) => {
    return<BasicGlobalContextProvider>
        <StorageContextProvider>
            <SingletonElementReferencesContextProvider>
                <EditorContextProvider>
                    <MenuContextProvider>
                        {props.children}
                    </MenuContextProvider>
                </EditorContextProvider>
            </SingletonElementReferencesContextProvider>
        </StorageContextProvider>
    </BasicGlobalContextProvider>;
};