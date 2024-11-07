import { useColorPicker } from '../hooks/useColorPicker';
import { ColorPicker } from '../tools/ColorPicker';

export const PrioritizeColorPick = (WrappedComponent: React.ComponentType) => {
    const ProtectedView = (props: JSX.IntrinsicAttributes) => {
        const [{ active }] = useColorPicker();
        return active?
            <ColorPicker>
                <WrappedComponent {...props} />
            </ColorPicker>
            :<WrappedComponent {...props} />;
    };

    ProtectedView.displayName = `PrioritizeColorPick(${WrappedComponent.displayName || WrappedComponent.name})`;
    return ProtectedView;
};
