import { useState, useRef, useEffect } from 'react';
type DrawableProps = {
    canvas:HTMLCanvasElement|undefined
} & React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
export const Drawable = (props:DrawableProps) => {
    const { canvas } = props;
    const [rendered, setRendered] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    useEffect(()=>{
        if(!rendered && canvas && ref.current){
            ref.current?.appendChild(canvas);
            setRendered(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [canvas, ref.current, rendered]);
    return <div {...props} ref={ref} >
    </div>
    ;
};
