import { Dispatch, ReactNode } from 'react';

export type StorageType = 'local'|'session';

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

export const storageProviders:StorageCache = { local: {}, session: {} };

export const StorageContextProvider = ({ children }:{children:ReactNode})=>{
    return Object.values(storageProviders)
        .map(providers=>Object.values(providers))
        .flat()
        .reduce((children, { Provider })=><Provider>{children}</Provider>, children);
};