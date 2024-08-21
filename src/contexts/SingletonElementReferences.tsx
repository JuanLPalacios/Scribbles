import { createContext, ReactNode, useContext, useRef } from 'react';

export const SingletonElementReferencesContext = createContext<{fileInput:HTMLInputElement|null}>({
    fileInput: null
});

export const useSingletonElementReferences = ()=>useContext(SingletonElementReferencesContext);

export const SingletonElementReferencesContextProvider = ({ children }:{children:ReactNode})=>{
    const ref = useRef<HTMLInputElement>(null);
    return <SingletonElementReferencesContext.Provider value={{ fileInput: ref.current }}>
        {children}
        <div style={{ display: 'none' }}>
            <input type="file" ref={ref} />
        </div>
    </SingletonElementReferencesContext.Provider>;
};
