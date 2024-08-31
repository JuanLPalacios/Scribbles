
export type SerializedOject =
| SerializedImage
| SerializedJSON;

export type SerializedImage = {
    type: 'img';
    value: string;
};
export type SerializedJSON = {
    type: 'json';
    value: string;
};
