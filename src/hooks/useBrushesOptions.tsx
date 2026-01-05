import { useContext } from 'react';
import { BrushesOptionsContext } from '../contexts/BrushesOptionsContext';
import { RecordableHOC } from '../hoc/Recordable';

export const useBrushesOptions = RecordableHOC(() => useContext(BrushesOptionsContext));
