export interface DeckDetails{
    name:string;
    cards:Card[];
    sideboard:Card[];
}

export interface Card{
    name:string;
    count:number;
    multiverseId:number;
    id:number;
}