import { createContext, ReactNode, useState } from 'react';
import { uid } from '../lib/uid';
import { draw } from '../tools/Draw';
import { DrawC } from '../tools/DrawC';
import { erase } from '../tools/Erase';
import { EraseC } from '../tools/EraseC';
import { fill } from '../tools/Fill';
import { FillC } from '../tools/FillC';
import { transform } from '../tools/Transform';
import { TransformC } from '../tools/TransformC';
import { StatePair } from '../types/StatePair';
import { ToolOptions } from './MenuOptions';
import drawIcon from '../icons/brush-f-svgrepo-com.svg';
import eraseIcon from '../icons/erase-svgrepo-com.svg';
import fillIcon from '../icons/color-bucket-svgrepo-com.svg';
import transformIcon from '../icons/nametag-svgrepo-com.svg';

export const ToolOptionsContext = createContext<StatePair<ToolOptions>>([
    { tools: [], selectedTool: 0 },
    () => undefined
]
);

export const ToolOptionsContextProvider = (props: { children: ReactNode; }) => {
    const value = useState<ToolOptions>({
        tools: [
            { key: uid(), Tool: draw, ToolC: DrawC, name: 'draw', icon: drawIcon },
            { key: uid(), Tool: erase, ToolC: EraseC, name: 'erase', icon: eraseIcon },
            { key: uid(), Tool: fill, ToolC: FillC, name: 'fill', icon: fillIcon },
            { key: uid(), Tool: transform, ToolC: TransformC, name: 'transform', icon: transformIcon }
        ],
        selectedTool: 0
    });
    return <ToolOptionsContext.Provider value={value}>
        {props.children}
    </ToolOptionsContext.Provider>;
};
