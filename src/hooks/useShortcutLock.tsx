import { createBasicGlobalHook } from '../generators/createBasicGlobalHook';

export const useShortcutLock = createBasicGlobalHook<boolean>(false);
