import { useState, useEffect, CSSProperties } from 'react';
import ReactDOM from 'react-dom';
import { uid } from '../../lib/uid';

const id = '' + uid();

type MenuProps = {
    children?: React.ReactNode;
  };

const style:CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    position: 'absolute',
    height: 'calc(100% - 2 * var(--button-radius))',
    top: 'var(--button-radius)',
    left: 0,
    zIndex: 5
};

export const LeftMenu = ({ children }:MenuProps) => {
    return <div id={id} className="side-menu" style={style} >
        {children}
    </div>;
};

export const LeftMenuPortal = ({ children }:{children?: React.ReactNode}) => {
    const [container, setContainer] = useState(() => document.getElementById(id));
    useEffect(() => {
        container || setContainer(document.getElementById(id));
    }, [container]);
    return container && ReactDOM.createPortal(children, container);
};