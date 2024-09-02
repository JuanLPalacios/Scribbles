import { useCallback, useContext, useEffect, useMemo } from 'react';
import { Serialized } from '../lib/Serialization';
import { StorageContext, StorageType } from '../contexts/StorageContext';

export function useStorage<T extends Serialized|Serialized[]> (key:string, storage:StorageType='local'):[T|undefined, (value: T) => void] {
    const [{ local, session }, dispatch] = useContext(StorageContext);
    const usedContext = (storage==='local')?local:session;
    const value = useMemo(()=>usedContext[key]?JSON.parse(usedContext[key]):undefined, [key, usedContext]);
    const setValue = useCallback((value:T) => {
        dispatch({ type: 'setStorage', payload: { key, storage, value: JSON.stringify(value) } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key, storage]);

    useEffect(() => {
        if(!(key in usedContext))
            dispatch({ type: 'getStorage', payload: { key, storage } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key, storage, usedContext]);
    return [value, setValue];
};
