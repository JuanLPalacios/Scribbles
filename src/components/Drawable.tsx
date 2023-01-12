import { useRef, useEffect } from 'react';
type DrawableProps = {
    canvas:HTMLCanvasElement|undefined
} & React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
export const Canvas = (props:DrawableProps) => {
    const { canvas } = props;
    const ref = useRef<HTMLDivElement>(null);
    useEffect(()=>{
        if(canvas && ref.current){
            ref.current.appendChild(canvas);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [canvas, ref.current]);
    return <div {...props} ref={ref} >
    </div>
    ;
};
