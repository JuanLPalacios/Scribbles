import React from 'react';
import Brush from '../abstracts/Brush';
import Tool from '../abstracts/Tool';
import '../css/Toolbar.css';

interface ToolbarProps {
  brush:Tool
}

function Toolbar(props:ToolbarProps) {
    return (
        <div className="Toolbar">
        </div>
    );
}

export default Toolbar;
