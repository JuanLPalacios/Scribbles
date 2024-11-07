import { Dispatch, ReactNode } from 'react';

// TODO: is this i still in use? delete if not
type StorageCache = { [key: string]: {
        Provider:(props: { children: ReactNode }) => JSX.Element
        Context:React.Context<[any, Dispatch<React.SetStateAction<any>>]>
    }
};

// eslint-disable-next-line react-refresh/only-export-components
export const basicGlobalProviders:StorageCache = {};

export const BasicGlobalContextProvider = ({ children }:{children:ReactNode})=>{
    return Object.values(basicGlobalProviders)
        .reduce((children, { Provider })=><Provider>{children}</Provider>, children);
};