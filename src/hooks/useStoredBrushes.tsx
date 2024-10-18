//import round from '../brushes/stiff/round.json';
//import oldRound from '../brushes/stiff/oldRound.json';
//import diagonal from '../brushes/stiff/flat.json';
import { BRUSH_TYPE_LIST } from '../abstracts/BrushC';
import { createStorageHook } from '../generators/createStorageHook';
import { SerializedBrush } from '../lib/Serialization';

export const useStoredBrushes = createStorageHook<SerializedBrush[]>('brushes', 'local', [
    ...BRUSH_TYPE_LIST.map(x => x[1])
]
);

