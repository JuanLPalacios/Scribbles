import { useCallback, useContext, useEffect } from 'react';
import { Serialized } from '../lib/Serialization';
import { StorageContext, StorageType } from '../contexts/StorageContext';

export function useStorage<T extends Serialized> (key:string, storage:StorageType='local') {
    const [{ local, session }, dispatch] = useContext(StorageContext);
    const usedContext = (storage==='local')?local:session;
    const setValue = useCallback((value:T) => {
        dispatch({ type: 'setStorage', payload: { key, storage, value: JSON.stringify(value) } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key, storage]);

    useEffect(() => {
        if(!(key in usedContext))
            dispatch({ type: 'getStorage', payload: { key, storage } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key, storage, usedContext]);
    return [JSON.parse(usedContext[key]), setValue];
};
