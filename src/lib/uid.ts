let last = Date.now();

export const uid = ()=>{
    let id = Date.now();
    if(id<=last) id = last+1;
    last = id;
    return id;
};