import Brush from '../abstracts/Brush';
import SolidBrush, { SerializedSolidBrush } from '../brushes/Solid';
import TextureBrush, { SerializedTextureBrush } from '../brushes/TextureBrush';
import { BrushList } from './BrushList';
/*
type Hash<T> = {[key: string]: T};
type extractGeneric<Type> = Type extends Hash<infer X> ? X : never

type AbrBrush = extractGeneric<(typeof abrBrushes)['map']>;
*/
export type SerializedBrush = SerializedSolidBrush | SerializedTextureBrush;
export const abrToScribblesSerializable = (abrBrush: AbrBrush): SerializedBrush => {
    const { brushType } = abrBrush;
    switch (brushType) {
    case 1:
        return abrComputedBrushToSolid(abrBrush);
    case 2:
        return abrSampledBrushToTextured(abrBrush);
    default:
        return new SolidBrush().toObj();
    }
};
function abrComputedBrushToSolid({ angle, diameter, hardness, name, roundness, spacing }: AbrComputedBrush): SerializedSolidBrush {
    return { scribbleBrushType: BrushList.Solid, angle, diameter, hardness, name, roundness, spacing };
}

function abrSampledBrushToTextured({ antiAliasing, brushTipImage, name, spacing, valid }: AbrSampledBrush): SerializedTextureBrush {
    const ctx = brushTipImage.getContext('2d');
    if(!ctx)throw new Error('can\'t create image context');
    const imageData = ctx.getImageData(0, 0, brushTipImage.width, brushTipImage.height);
    for (let i = 0; i < (imageData.data.length||0); i+=4) {
        imageData.data[i+3] = 255 - imageData.data[i];
        imageData.data[i] = 0;
        imageData.data[i+1] = 0;
        imageData.data[i+2] = 0;
    }
    ctx.putImageData(imageData, 0, 0);
    const dataUrl = brushTipImage.toDataURL();
    return { scribbleBrushType: BrushList.Texture, antiAliasing, brushTipImage: dataUrl, name, spacing };
}

export const brushFormObj = (brushObj:SerializedBrush): Brush => {
    const { scribbleBrushType } = brushObj;
    switch (scribbleBrushType) {
    case BrushList.Solid:
        return SolidBrush.formObj(brushObj);
    case BrushList.Texture:
        return TextureBrush.formObj(brushObj);
    default:
        return new SolidBrush();
    }
};
