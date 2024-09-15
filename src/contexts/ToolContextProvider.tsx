import { ReactNode, useMemo } from 'react';
import { BrushC } from '../brushes/BrushC';
import { useMenu } from '../hooks/useMenu';

export const ToolContextProvider = (props: { children: ReactNode; }) => {
    const menuContext = useMenu();
    const [options2] = menuContext;
    const { brushesPacks, selectedBrush } = options2;
    const { tools, selectedTool } = options2;
    const { ToolC } = tools[selectedTool];
    console.log('ToolContextProvider=>'+ToolC.name);
    const { brush } = useMemo(() => brushesPacks[selectedBrush], [brushesPacks, selectedBrush]);
    //<ToolC>
    //</ToolC>
    return <BrushC brush={brush.toObj() as any}>
        {props.children}
    </BrushC>;
};
