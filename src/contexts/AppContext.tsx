import { ReactNode } from 'react';
import { MenuContextProvider } from './MenuOptions';
import { SingletonElementReferencesContextProvider } from './SingletonElementReferences';
import { StorageContextProvider } from './StorageContext';
import { EditorContextProvider } from './EditorContext';
import { BasicGlobalContextProvider } from './BasicGlobalContext';
import { GoogleDriveContextProvider } from './GoogleDriveContext';
import { useConfig } from '../hooks/useConfig';

const GoogleDriveWrapper = ({ children }: { children: ReactNode }) => {
    const [config, setConfig] = useConfig();

    return (
        <GoogleDriveContextProvider
            config={config?.googleDrive}
            onConfigUpdate={(googleDrive) => {
                setConfig({
                    ...config,
                    googleDrive,
                });
            }}
        >
            {children}
        </GoogleDriveContextProvider>
    );
};

export const AppStateProvider = (props: { children: ReactNode }) => {
    return<BasicGlobalContextProvider>
        <StorageContextProvider>
            <SingletonElementReferencesContextProvider>
                <EditorContextProvider>
                    <GoogleDriveWrapper>
                        <MenuContextProvider>
                            {props.children}
                        </MenuContextProvider>
                    </GoogleDriveWrapper>
                </EditorContextProvider>
            </SingletonElementReferencesContextProvider>
        </StorageContextProvider>
    </BasicGlobalContextProvider>;
};