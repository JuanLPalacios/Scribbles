import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { uid } from '../../lib/uid';

const id = '' + uid();

type MenuProps = {
    children?: React.ReactNode;
  };

export const LeftMenu = ({ children }:MenuProps) => {
    return <div id={id} className="side-menu LeftMenu" >
        {children}
    </div>;
};

export const LeftMenuPortal = ({ children }:{children?: React.ReactNode}) => {
    const [container, setContainer] = useState(() => document.getElementById(id));
    useEffect(() => {
        if(!container)setContainer(document.getElementById(id));
    }, [container]);
    return container && ReactDOM.createPortal(children, container);
};