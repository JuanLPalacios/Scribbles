import { DependencyList, useCallback } from 'react';
import { useSingletonElementReferences } from './useSingletonElementReferences';
type Config = {
    accept?:string
    multiple?:boolean
};
export const useOpenFile = (callback:(files:FileList)=>void, deps: DependencyList, { accept, multiple }:Config) => {
    const { fileInput: fileInputRef } = useSingletonElementReferences();
    // react-hooks/exhaustive-deps is checked for useOpenFile so here it can be ignored
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const callbackCash = useCallback(callback, deps);
    const openFile = useCallback(()=>{
        const { current: fileInput } = fileInputRef;
        if(!fileInput)return;
        if(accept)fileInput.accept=accept;
        fileInput.multiple = multiple?true:false ;
        fileInput.onchange = ()=>{};
        fileInput.value = null as never;
        fileInput.onchange = ()=>fileInput.files&&callbackCash(fileInput.files);
        fileInput.click();
    }, [accept, callbackCash, fileInputRef, multiple]);
    return openFile;
};
