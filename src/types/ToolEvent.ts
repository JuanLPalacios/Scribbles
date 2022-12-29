import { EditorAction, EditorState } from '../contexts/DrawingState';
import { StatePair } from './StatePair';

export type ToolEvent<O> = {
    editorContext:[EditorState, React.Dispatch<EditorAction>];
    menuContext:StatePair<O>;
}