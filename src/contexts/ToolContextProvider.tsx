import { ReactNode, useMemo } from 'react';
import { Brush } from '../abstracts/Brush';
import { useToolOptions } from '../hooks/useToolOptions';
import { useBrushesOptions } from '../hooks/useBrushesOptions';
import { useEditor } from '../hooks/useEditor';

export const ToolContextProvider = (props: { children: ReactNode; }) => {
    const [{ drawing }] = useEditor();
    const [{ selectedTool, tools }] = useToolOptions();
    const [{ brushesPacks, selectedBrush }] = useBrushesOptions();
    const { Tool } = tools[selectedTool];
    const { brush } = useMemo(() => brushesPacks[selectedBrush], [brushesPacks, selectedBrush]);
    return drawing?
        <Brush brush={brush}>
            <Tool>
                {props.children}
            </Tool>
        </Brush>
        :props.children;
};
