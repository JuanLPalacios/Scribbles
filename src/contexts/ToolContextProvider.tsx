import { ReactNode, useMemo } from 'react';
import { BrushC } from '../brushes/BrushC';
import { useToolOptions } from '../hooks/useToolOptions';
import { useBrushesOptions } from '../hooks/useBrushesOptions';
import { useEditor } from '../hooks/useEditor';

export const ToolContextProvider = (props: { children: ReactNode; }) => {
    const [{ drawing }] = useEditor();
    const [{ selectedTool, tools }] = useToolOptions();
    const [{ brushesPacks, selectedBrush }] = useBrushesOptions();
    const { ToolC } = tools[selectedTool];
    const { brush } = useMemo(() => brushesPacks[selectedBrush], [brushesPacks, selectedBrush]);
    return drawing?
        <BrushC brush={brush.toObj() as any}>
            <ToolC>
                {props.children}
            </ToolC>
        </BrushC>
        :props.children;
};
