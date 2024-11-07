import { EditorState } from '../contexts/EditorContext';
import { StatePair } from './StatePair';

export type ToolEvent<O> = {
    editorContext:readonly [EditorState, { openFile(file: File): void; newFile({ name, width, height }: { name: string; width: number; height: number; }): void; }];
    menuContext:StatePair<O>;
}