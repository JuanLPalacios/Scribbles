import { useCallback } from 'react';
import { useSingletonElementReferences } from './useSingletonElementReferences';
type Config = {
    accept?:string
    multiple?:boolean
};
export const useOpenFile = (callback:(files:FileList)=>void, { accept, multiple }:Config) => {
    const { fileInput: { current: fileInput } } = useSingletonElementReferences();
    const openFile = useCallback(()=>{
        if(!fileInput)return;
        if(accept)fileInput.accept=accept;
        fileInput.multiple = multiple?true:false ;
        fileInput.onchange = (e)=>fileInput.files&&callback(fileInput.files);
        fileInput.click();
    }, [accept, callback, fileInput, multiple]);
    return openFile;
};
