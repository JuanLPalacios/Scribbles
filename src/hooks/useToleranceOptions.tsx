import { createStorageHook } from '../generators/createStorageHook';
import { ToleranceOptions } from '../contexts/MenuOptions';

export const useToleranceOptions = createStorageHook<ToleranceOptions>('tolerance', 'local', { tolerance: .3 });