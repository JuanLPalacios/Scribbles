import { createContext, ReactNode, RefObject, useRef } from 'react';

export const SingletonElementReferencesContext = createContext<{fileInput:RefObject<HTMLInputElement>}>({
    fileInput: { current: null }
});

export const SingletonElementReferencesContextProvider = ({ children }:{children:ReactNode})=>{
    const ref = useRef<HTMLInputElement>(null);
    return <SingletonElementReferencesContext.Provider value={{ fileInput: ref }}>
        {children}
        <div style={{ display: 'none' }}>
            <input type="file" ref={ref} />
        </div>
    </SingletonElementReferencesContext.Provider>;
};
