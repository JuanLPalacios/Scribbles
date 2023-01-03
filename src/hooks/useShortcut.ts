import { useCallback, useEffect } from 'react';

export const useShortcut = (callback:()=>void, shorcuts:string[]) => {
    const handleKeyPress = useCallback((event:KeyboardEvent) => {
        shorcuts.forEach((shorcut)=>{
            const keys = shorcut.split('+');
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
    }, shorcuts);

    useEffect(() => {
        document.addEventListener('keydown', handleKeyPress);
        return () => {
            document.removeEventListener('keydown', handleKeyPress);
        };
    }, [handleKeyPress]);
};
