import { useContext } from 'react';
import { ToolOptionsContext } from '../contexts/ToolOptionsContext';
import { RecordableHOC } from '../hoc/Recordable';

export const useToolOptions = RecordableHOC(() => useContext(ToolOptionsContext));
