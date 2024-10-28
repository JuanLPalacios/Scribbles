import { useEffect } from 'react';
import { useVersion } from './useVersion';
import { useStoredPalettes } from './useStoredPalettes';

export function usePalettes() {
    const [palettes, setPalettes] = useStoredPalettes();
    const updatedStoredPalettes = useVersion<{colors: string[], name:string }[]>(palettes, '0.3.0', []);
    useEffect(() => {
        if (updatedStoredPalettes != palettes)
            setPalettes(updatedStoredPalettes);
    }, [setPalettes, palettes, updatedStoredPalettes]);
    return [palettes, setPalettes] as const;
}

