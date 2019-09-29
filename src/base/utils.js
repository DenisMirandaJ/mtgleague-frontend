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

