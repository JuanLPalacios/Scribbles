export type CompressedOject = CompressedImage |
    CompressedJSON;

export type CompressedImage = {
    type: 'img';
    value: string;
};
export type CompressedJSON = {
    type: 'json';
    value: string;
};
