import { useEffect, useMemo } from 'react';
import { useVersion } from './useVersion';
import { useStoredPalette } from './useStoredPalette';

export function usePalette() {
    const [palette, setPalette] = useStoredPalette();
    const updatedStoredFiles = useVersion<string[]>(palette, '0.3.0', []);
    useEffect(() => {
        if (updatedStoredFiles != palette)
            setPalette(updatedStoredFiles);
    }, [setPalette, palette, updatedStoredFiles]);
    const actions = useMemo(()=>{
        return {
            addColor(color:string){
                setPalette([...palette.filter(x=>x!=color), color]);
            }
        };
    }, [setPalette, palette]);
    return [palette, actions] as const;
}

