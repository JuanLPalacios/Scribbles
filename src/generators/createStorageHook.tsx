import { createContext, Dispatch, ReactNode, useState, useContext, useMemo, useCallback } from 'react';
import { Serialized, SerializedValue } from '../lib/Serialization';
import { storageProviders, StorageType } from '../contexts/StorageContext';

export function createStorageHook<T extends Serialized | SerializedValue[]>(key: string, storage?: StorageType): () => [T | undefined, (value: T) => void]
export function createStorageHook<T extends Serialized | SerializedValue[]>(key: string, storage: StorageType, defaultValue: T): () => [T, (value: T) => void]
export function createStorageHook<T extends Serialized | SerializedValue[]>(key: string, storage: StorageType = 'local', defaultValue?: T): () => [T | undefined, (value: T) => void] {
    const usedStorage = (storage === 'local') ? localStorage : sessionStorage;
    const { Context } = storageProviders[storage][key] = storageProviders[storage][key] || (() => {
        const Context = createContext<[string, Dispatch<React.SetStateAction<string>>]>(['', () => { }]);
        return {
            Context,
            Provider({ children }: { children: ReactNode; }) {
                const pair = useState<string>(usedStorage.getItem(key) || JSON.stringify(defaultValue));
                return <Context.Provider value={pair}>{children}</Context.Provider>;
            }
        };
    })();
    return () => {
        const [stringValue, dispatch] = useContext(Context);
        const value: T | undefined = useMemo(() => stringValue ? JSON.parse(stringValue) : undefined, [stringValue]);
        const setValue = useCallback((value: T) => {
            dispatch(() => {
                const stringValue = JSON.stringify(value);
                usedStorage.setItem(key, stringValue);
                return stringValue;
            });
        }, [dispatch]);
        return [value || defaultValue, setValue] as const;
    };
}
