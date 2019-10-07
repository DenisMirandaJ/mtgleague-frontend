import React from 'react';

export var getCardNameFromJSON = (cardJSON) => {
    if (cardJSON['card_faces'] != null) {
        return cardJSON['card_faces'][0]['name']
    } else {
        return cardJSON['name']
    }
}

export var getCardTypeFromJSON = (cardJSON) => {
    if (cardJSON['card_faces'] != null) {
        return cardJSON['card_faces'][0]['type_line']
    } else if (cardJSON['type_line'] != null) {
        return cardJSON['type_line']
    }
    return 'no_type'
}

export var getCardPriceFromJSON = (cardJSON) => {
    if (cardJSON['prices'] == null) {
        return "0"
    } else {
        return cardJSON['prices']['usd']
    }
}

export var  getCardManaCostSymbols = (manaCost) => {
    if (manaCost == null) {
        return ''
    }
    let manaSymbolsText = manaCost.match(/\{([^}]+)\}/g)
    if (manaSymbolsText == null) {
        return ""
    }
    manaSymbolsText = manaSymbolsText.map((text) => {
        return text.replace('{', '').replace('}', '').replace('/', '')
    })

    let manaSymbols = manaSymbolsText.map((symbol, index) => {
        return (
            <abbr key={index} className={"card-symbol card-symbol-" + symbol}></abbr>
        )
    })

    return manaSymbols;
}

export var getColorsFromJSON = (cardJSON) => {
    let mana_cost = ''
    if (cardJSON['card_faces'] != null) {
        mana_cost = cardJSON['card_faces'][0]['mana_cost']
    } else if (cardJSON['mana_cost'] != null) {
        mana_cost = cardJSON['mana_cost']
    } else {
        mana_cost = ''
    }

    let colors = []
    //Check regular mana colors
    if (mana_cost.includes('{W}')) {
        colors.push('{W}')
    }
    if (mana_cost.includes('{U}')) {
        colors.push('{U}')
    }
    if (mana_cost.includes('{B}')) {
        colors.push('{B}')
    }
    if (mana_cost.includes('{R}')) {
        colors.push('{R}')
    }
    if (mana_cost.includes('{G}')) {
        colors.push('{G}')
    }
    return colors
}

