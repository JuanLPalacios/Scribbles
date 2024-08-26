import JSZip from 'jszip';
import { SerializedBrush } from './Serialization';

type SbrVersionInfo = {
    version:number
    subVersion:number
};

const CANVAS:HTMLCanvasElement = document.createElement('canvas');
const CTX = CANVAS.getContext('2d');

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
        const dir = zip.folder('images');
        if((!dir))throw new Error('JSZip folder could not be created');
        const context = { zip, types: { img: { dir, count: 0 } } };
        for (let i = 0; i < brushes.length; i++) {
            const brush:any = brushes[i];
            for (const key in brush) {
                if (Object.prototype.hasOwnProperty.call(brush, key)) {
                    brush[key] = zipDataV1(brush[key], context);
                }
            }
        }
        return zip.generateAsync({ type: 'blob' });
    }
};

function zipDataV1(value: any, context: { zip: JSZip; types:{img: {dir:JSZip; count:number }}}): any {
    return new Promise<any>((resolve, reject) => {
        if(!isDataUrl(value))return resolve(value);
        const extension = getExtension(value);
        const fileNumber = context.types.img.count++;
        const filename = `${fileNumber}.${extension}`;
        if(!CTX) return;
        const img = new Image;
        img.onload = async ()=>{
            CANVAS.width = 0; //forces the canvas to clear
            CANVAS.width = img.width;
            CANVAS.height = img.height;
            CTX.globalCompositeOperation = 'source-over';
            CTX.drawImage(img, 0, 0);
            context.types.img.dir.file(filename, await new Promise<Blob>(res => CANVAS.toBlob(t=>{ if(t)res(t); })));
            resolve({ type: 'img', value: `data:img/${filename}` });
        };
        img.onerror = reject;
        img.src = value;
    });
}

function getUnzipData(version: SbrVersionInfo): ((value: any) => any) | null | undefined {
    throw new Error('Function not implemented.');
}

function getExtension(value:string):string {
    throw new Error('Function not implemented.');
}

function isDataUrl(value:string):boolean {
    throw new Error('Function not implemented.');
}

