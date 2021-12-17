const fs = require('fs')

const className = "CardInsert";
const fileName = "card-insert.js";
const properties = [
    'artist',
    'colorIdentityString',
    'colorString',
    'cmc',
    'flavorText',
    'loyalty',
    'manaCostText',
    'multiverseId',
    'faceName',
    'name',
    'number',
    'uuid',
    'power',
    'rarity',
    'setCode',
    'subtypeString',
    'supertypeString',
    'textString',
    'toughness',
    'type',
    'typeString',
    'standardized_name',
'layout'];
let content = "";
content += `exports.${className} =  class ${className}{\n`;
properties.forEach((_) => {
    content += `\t#${_} = "";\n`;
})

properties.forEach((_) => {
    content += `\n\tset ${_}(${_}){\n\t\tif(typeof(${_}) !== 'string'){\n\t\t\treturn;\n\t\t}\n\t\tthis.#${_} = ${_};\n\t}\n\n\tget ${_}(){\n\t\treturn this.#${_};\n\t}\n`
})
content += "}";
try {
  fs.writeFileSync(`./${fileName}`, content)
  //file written successfully
} catch (err) {
  console.error(err)
}