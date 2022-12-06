import { useState, useRef, useEffect } from 'react';

export const Drawable = ({ canvas }:{canvas:HTMLCanvasElement|undefined}) => {
    const [rendered, setRendered] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    useEffect(()=>{
        if(!rendered && canvas && ref.current){
            ref.current?.appendChild(canvas);
            setRendered(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [canvas, ref.current, rendered]);
    return <div ref={ref} >
    </div>
    ;
};
