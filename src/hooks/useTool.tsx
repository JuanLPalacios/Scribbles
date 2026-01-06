import { useContext } from 'react';
import { ToolContext } from '../contexts/ToolContext';
import { RecordableHOC } from '../hoc/Recordable';

export const useTool = RecordableHOC(()=>useContext(ToolContext));
