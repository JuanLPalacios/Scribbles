import { useEditor } from '../hooks/useEditor';

export const DrawingRequired = (WrappedComponent: React.ComponentType) => {
    const ProtectedView = (props: JSX.IntrinsicAttributes) => {
        const [{ drawing }] = useEditor();
        if (!drawing) {
            // user is not authenticated
            return <></>;
        }
        return <WrappedComponent {...props} />;
    };

    ProtectedView.displayName = `DrawingRequired(${WrappedComponent.displayName || WrappedComponent.name})`;
    return ProtectedView;
};
