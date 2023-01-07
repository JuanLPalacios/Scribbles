import { EditorAction, EditorState } from '../contexts/EditorState';
import { StatePair } from './StatePair';

export type ToolEvent<O> = {
    editorContext:[EditorState, React.Dispatch<EditorAction>];
    menuContext:StatePair<O>;
}