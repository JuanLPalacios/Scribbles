import { Dispatch, ReactNode } from 'react';

export type StorageType = 'local'|'session';
// TODO: is this i still in use? delete if not
type StorageCache = {
    local: { [key: string]: {
        Provider:(props: { children: ReactNode }) => JSX.Element
        Context:React.Context<[string, Dispatch<React.SetStateAction<string>>]>
    } }
    session: { [key: string]: {
        Provider:(props: { children: ReactNode }) => JSX.Element
        Context:React.Context<[string, Dispatch<React.SetStateAction<string>>]>
    } }
};

// eslint-disable-next-line react-refresh/only-export-components
export const storageProviders:StorageCache = { local: {}, session: {} };

export const StorageContextProvider = ({ children }:{children:ReactNode})=>{
    return Object.values(storageProviders)
        .map(providers=>Object.values(providers))
        .flat()
        .reduce((children, { Provider })=><Provider>{children}</Provider>, children);
};