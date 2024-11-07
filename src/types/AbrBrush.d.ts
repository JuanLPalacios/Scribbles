type AbrHeader = {
    version: number;
    subversion: number;
    count: number;
};
type AbrBrush = AbrSampledBrush | AbrComputedBrush;
type AbrSampledBrush = {
    brushType: 2;
    name: string;
    spacing: number;
    antiAliasing: boolean;
    md5Sum: ArrayBuffer;
    brushTipImage: HTMLCanvasElement;
    valid: boolean;
};
type AbrComputedBrush = {
    brushType: 1;
    name: string;
    spacing: number;
    diameter: number;
    roundness: number;
    angle: number;
    hardness: number;
};
