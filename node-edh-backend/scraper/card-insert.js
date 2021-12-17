exports.CardInsert =  class CardInsert{
	#artist = "";
	#colorIdentityString = "";
	#colorString = "";
	#cmc = "";
	#flavorText = "";
	#loyalty = "";
	#manaCostText = "";
	#multiverseId = "";
	#faceName = "";
	#name = "";
	#number = "";
	#uuid = "";
	#power = "";
	#rarity = "";
	#setCode = "";
	#subtypeString = "";
	#supertypeString = "";
	#textString = "";
	#toughness = "";
	#type = "";
	#typeString = "";
	#standardized_name = "";
	#layout = "";

	constructor(){}
	set artist(artist){
		if(typeof(artist) !== 'string'){
			return;
		}
		this.#artist = artist;
	}

	get artist(){
		return this.#artist;
	}

	set colorIdentityString(colorIdentityString){
		if(typeof(colorIdentityString) !== 'string'){
			return;
		}
		this.#colorIdentityString = colorIdentityString;
	}

	get colorIdentityString(){
		return this.#colorIdentityString;
	}

	set colorString(colorString){
		if(typeof(colorString) !== 'string'){
			return;
		}
		this.#colorString = colorString;
	}

	get colorString(){
		return this.#colorString;
	}

	set cmc(cmc){
		if(typeof(cmc) !== 'string'){
			return;
		}
		this.#cmc = cmc;
	}

	get cmc(){
		return this.#cmc;
	}

	set flavorText(flavorText){
		if(typeof(flavorText) !== 'string'){
			return;
		}
		this.#flavorText = flavorText;
	}

	get flavorText(){
		return this.#flavorText;
	}

	set loyalty(loyalty){
		if(typeof(loyalty) !== 'string'){
			return;
		}
		this.#loyalty = loyalty;
	}

	get loyalty(){
		return this.#loyalty;
	}

	set manaCostText(manaCostText){
		if(typeof(manaCostText) !== 'string'){
			return;
		}
		this.#manaCostText = manaCostText;
	}

	get manaCostText(){
		return this.#manaCostText;
	}

	set multiverseId(multiverseId){
		if(typeof(multiverseId) !== 'string'){
			return;
		}
		this.#multiverseId = multiverseId;
	}

	get multiverseId(){
		return this.#multiverseId;
	}

	set faceName(faceName){
		if(typeof(faceName) !== 'string'){
			return;
		}
		this.#faceName = faceName;
	}

	get faceName(){
		return this.#faceName;
	}

	set name(name){
		if(typeof(name) !== 'string'){
			return;
		}
		this.#name = name;
	}

	get name(){
		return this.#name;
	}

	set number(number){
		if(typeof(number) !== 'string'){
			return;
		}
		this.#number = number;
		this.#uuid = `${this.number}-${this.#setCode}`;
	}

	get number(){
		return this.#number;
	}

	get uuid(){
		return this.#uuid;
	}

	set power(power){
		if(typeof(power) !== 'string'){
			return;
		}
		this.#power = power;
	}

	get power(){
		return this.#power;
	}

	set rarity(rarity){
		if(typeof(rarity) !== 'string'){
			return;
		}
        if(rarity == 'Mythic Rare'){
			rarity = 'mythic';
		}
		this.#rarity = rarity;
	}

	get rarity(){
		return this.#rarity;
	}

	set setCode(setCode){
		if(typeof(setCode) !== 'string'){
			return;
		}
		this.#setCode = setCode;
		this.#uuid = `${this.number}-${this.#setCode}`;
	}

	get setCode(){
		return this.#setCode;
	}

	set subtypeString(subtypeString){
		if(typeof(subtypeString) !== 'string'){
			return;
		}
		this.#subtypeString = subtypeString;
	}

	get subtypeString(){
		return this.#subtypeString;
	}

	set supertypeString(supertypeString){
		if(typeof(supertypeString) !== 'string'){
			return;
		}
		this.#supertypeString = supertypeString;
	}

	get supertypeString(){
		return this.#supertypeString;
	}

	set textString(textString){
		if(typeof(textString) !== 'string'){
			return;
		}
		this.#textString = textString;
	}

	get textString(){
		return this.#textString;
	}

	set toughness(toughness){
		if(typeof(toughness) !== 'string'){
			return;
		}
		this.#toughness = toughness;
	}

	get toughness(){
		return this.#toughness;
	}

	set type(type){
		if(typeof(type) !== 'string'){
			return;
		}
		this.#type = type;
	}

	get type(){
		return this.#type;
	}

	set typeString(typeString){
		if(typeof(typeString) !== 'string'){
			return;
		}
		this.#typeString = typeString;
	}

	get typeString(){
		return this.#typeString;
	}

	set standardized_name(standardized_name){
		if(typeof(standardized_name) !== 'string'){
			return;
		}
		this.#standardized_name = standardized_name;
	}

	get standardized_name(){
		return this.#standardized_name;
	}

	set layout(layout){
		if(typeof(layout) !== 'string'){
			return;
		}
		this.#layout = layout;
	}

	get layout(){
		return this.#layout;
	}

	getQueryValues(){
		return [this.#artist,
			this.#colorIdentityString,
			this.#colorString,
			this.#cmc,
			this.#flavorText,
			this.#loyalty,
			this.#manaCostText,
			this.#multiverseId,
			this.#faceName,
			this.#name,
			this.#number,
			this.#uuid,
			this.#power,
			this.#rarity,
			this.#setCode,
			this.#subtypeString,
			this.#supertypeString,
			this.#textString,
			this.#toughness,
			this.#type,
			this.#typeString,
			this.#standardized_name,
			this.#layout];
	}
}