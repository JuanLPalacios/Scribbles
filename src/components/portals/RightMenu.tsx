import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { uid } from '../../lib/uid';

const id = '' + uid();

type MenuProps = {
    children?: React.ReactNode;
  };

export const RightMenu = ({ children }:MenuProps) => {
    return <div id={id} className="side-menu RightMenu" >
        {children}
    </div>;
};

export const RightMenuPortal = ({ children }:{children?: React.ReactNode}) => {
    const [container, setContainer] = useState(() => document.getElementById(id));
    useEffect(() => {
        if(!container)setContainer(document.getElementById(id));
    }, [container]);
    return container && ReactDOM.createPortal(children, container);
};