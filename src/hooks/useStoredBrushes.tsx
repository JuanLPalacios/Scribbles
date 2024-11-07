//import round from '../brushes/stiff/round.json';
//import oldRound from '../brushes/stiff/oldRound.json';
//import diagonal from '../brushes/stiff/flat.json';
import default_brushes from '../brushes/default_brushes.json';
import { createStorageHook } from '../generators/createStorageHook';
import { SerializedBrush } from '../lib/Serialization';

export const useStoredBrushes = createStorageHook<SerializedBrush[]>('brushes', 'local', default_brushes as SerializedBrush[]);

