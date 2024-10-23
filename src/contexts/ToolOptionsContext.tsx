import { createContext, ReactNode, useState } from 'react';
import { uid } from '../lib/uid';
import { Draw } from '../tools/Draw';
import { Erase } from '../tools/Erase';
import { Fill } from '../tools/Fill';
import { Transform } from '../tools/Transform';
import { StatePair } from '../types/StatePair';
import { ToolOptions } from './MenuOptions';
import drawIcon from '../icons/brush-f-svgrepo-com.svg';
import eraseIcon from '../icons/erase-svgrepo-com.svg';
import fillIcon from '../icons/color-bucket-svgrepo-com.svg';
import transformIcon from '../icons/nametag-svgrepo-com.svg';
import smearIcon from '../icons/smear.svg';
import { Smear } from '../tools/Smear';

export const ToolOptionsContext = createContext<StatePair<ToolOptions>>([
    { tools: [], selectedTool: 0 },
    () => undefined
]
);

export const ToolOptionsContextProvider = (props: { children: ReactNode; }) => {
    const value = useState<ToolOptions>({
        tools: [
            { key: uid(), Tool: Draw, name: 'draw', icon: drawIcon },
            { key: uid(), Tool: Erase, name: 'erase', icon: eraseIcon },
            { key: uid(), Tool: Fill, name: 'fill', icon: fillIcon },
            { key: uid(), Tool: Smear, name: 'smear', icon: smearIcon },
            { key: uid(), Tool: Transform, name: 'transform', icon: transformIcon }
        ],
        selectedTool: 0
    });
    return <ToolOptionsContext.Provider value={value}>
        {props.children}
    </ToolOptionsContext.Provider>;
};
