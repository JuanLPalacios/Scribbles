import { createContext, Dispatch, ReactNode, useReducer } from 'react';

export type StorageType = 'local'|'session';

type GetStorage = {
    type: 'getStorage',
    payload:{
        storage:StorageType
        key:string
    }
}

type SetStorage = {
    type: 'setStorage',
    payload:{
        storage:StorageType
        key:string
        value:string
    }
}

type StorageActions =
| GetStorage
| SetStorage;

type StorageCache = {
    local: { [key: string]: string; };
    session: { [key: string]: string; };
};

export const StorageContext = createContext<[StorageCache, Dispatch<StorageActions>]>([{
    local: {},
    session: {}
}, ()=>{}]);

export const StorageContextProvider = ({ children }:{children:ReactNode})=>{
    const local = useReducer<(state:StorageCache, action:StorageActions)=>StorageCache>((state, { type, payload })=>{
        const { key, storage } = payload;
        const usedStorage = (storage==='local')?localStorage:sessionStorage;
        switch (type) {
        case 'getStorage':
            return { ...state, [storage]: { ...state[storage], [key]: usedStorage.getItem(key) } };
        case 'setStorage':
            usedStorage.setItem(key, payload.value);
            return { ...state, [storage]: { ...state[storage], [key]: payload.value } };
        default:
            return state;
        }
    }, {
        local: {},
        session: {}
    });
    return <StorageContext.Provider value={local}>
        {children}
    </StorageContext.Provider>;
};
