import { useCallback, useEffect } from 'react';
import { useShortcutLock } from './useShortcutLock';

export const useShortcut = (callback:(shortcut?:string)=>void, shortcuts:string[]) => {
    const [isLocked] = useShortcutLock();
    const handleKeyPress = useCallback((event:KeyboardEvent) => {
        shortcuts.forEach((shortcut)=>{
            const keys = shortcut.split('+');
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                switch(key){
                case('CTRL'):
                    if(!event.ctrlKey) return;
                    break;
                case('SHIFT'):
                    if(!event.shiftKey) return;
                    break;
                case('ALT'):
                    if(!event.altKey) return;
                    break;
                default:
                    if(event.key.toUpperCase() !== key) return;
                    break;
                }
            }
            callback(shortcut);
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shortcuts]);

    useEffect(() => {
        if(!isLocked)document.addEventListener('keydown', handleKeyPress);
        return () => {
            if(!isLocked)document.removeEventListener('keydown', handleKeyPress);
        };
    }, [handleKeyPress, isLocked]);
};
