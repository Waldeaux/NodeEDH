export interface CardDetails{
    name:string;
    total:number;
    locations:Location[];
    unused:number;
}

interface Location{
    location:string;
    count:number;
}
