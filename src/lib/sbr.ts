import JSZip from 'jszip';
import { SerializedBrush } from './Serialization';

type SbrVersionInfo = {
    version:number
    subVersion:number
};

export const SBR = {
    async jsonObj(file: File) {
        return new JSZip()
            .loadAsync(file)
            .then((zip)=>
                zip.files['version.json'].async('string')
                    .then(JSON.parse)
                    .then((version:SbrVersionInfo)=>
                        zip.files['content.json'].async('string')
                            .then(JSON.parse)
                            .then(getUnzipData(version))
                    )
            );
    },

    binary(brushes: SerializedBrush[]) {
        const zip = new JSZip();
        const img = zip.folder('images');
        if(!img)throw new Error('JSZip folder could not be created');
        for (let i = 0; i < brushes.length; i++) {
            const brush:any = brushes[i];
            for (const key in brush) {
                if (Object.prototype.hasOwnProperty.call(brush, key)) {
                    brush[key] = zipDataV1(brush[key], { zip, img });
                }
            }
        }
        return zip.generateAsync({ type: 'blob' });
    }
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const canvas:HTMLCanvasElement = document.createElement('canvas');

function zipDataV1(value: any, context: { zip: JSZip; img: JSZip; }): any {
    throw new Error('Function not implemented.');
    canvas.width = 0;
}

function getUnzipData(version: SbrVersionInfo): ((value: any) => any) | null | undefined {
    throw new Error('Function not implemented.');
}

