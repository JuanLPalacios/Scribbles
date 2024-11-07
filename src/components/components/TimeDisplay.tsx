export function TimeDisplay({ value }:{value:number}){
    const [hourStr, minStr, secStr] = new Date(value).toISOString()
        .slice(11, 23)
        .split(':');
    const hour=parseInt(hourStr),
        min=parseInt(minStr),
        sec=parseFloat(secStr);
    return <>
        {(hour>0)&&`${hour} hour${(hour>1)?'s':''}`}
        {(min>0)&&`${min} min${(min>1)?'s':''}`}
        {(sec>0)&&`${sec} sec${(sec>1)?'s':''}`}
    </>;
}