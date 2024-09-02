import { useCallback, useEffect } from 'react';

export const useShortcut = (callback:()=>void, shortcuts:string[]) => {
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
                default:
                    if(event.key.toUpperCase() !== key) return;
                    break;
                }
            }
            callback();
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shortcuts]);

    useEffect(() => {
        document.addEventListener('keydown', handleKeyPress);
        return () => {
            document.removeEventListener('keydown', handleKeyPress);
        };
    }, [handleKeyPress]);
};
