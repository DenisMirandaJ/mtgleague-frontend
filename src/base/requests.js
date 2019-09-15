import { resolve, reject } from "q"
import axios from 'axios'
import Fuse from 'fuse.js'
import { getCardNameFromJSON } from './utils'

export var fetchDeckData = function (mainDeckInput, sideDeckInput) {
    var deck = []

    let mainDeckScryfallPostParameters = getScryfallPostParameters(mainDeckInput)
    let sideDeckScryfallPostParameters = getScryfallPostParameters(sideDeckInput)
    if (mainDeckScryfallPostParameters == null || mainDeckScryfallPostParameters == {}) {
        return
    }
    if (sideDeckScryfallPostParameters == null || sideDeckScryfallPostParameters == {}) {
        return
    }

    axios.post(
        'https://api.scryfall.com/cards/collection',
        mainDeckScryfallPostParameters
    ).then(res => {
        let result = res['data']['data'].concat(res['data']['not_found'])
        let cardNamesQuantityDic = getCardNamesQuantityDic(mainDeckInput)
        deck.push(constructCardJSONQuantityObject(cardNamesQuantityDic, result))
        return axios.post(
            'https://api.scryfall.com/cards/collection',
            sideDeckScryfallPostParameters)
    }).then(res => {
        let result = res['data']['data'].concat(res['data']['not_found'])
        let cardNamesQuantityDic = getCardNamesQuantityDic(sideDeckInput)
        deck.push(constructCardJSONQuantityObject(cardNamesQuantityDic, result))

        return new Promise((resolve, reject) => {
            if (deck.length != 0) {
                resolve(deck)
            } else {
                reject([])
            }
        })
    })
}

var constructCardJSONQuantityObject = (fuzzyCardNamesQuantityDic, scryfallRequestResult) => {
    return Object.keys(fuzzyCardNamesQuantityDic).map((fuzzyCardName) => {
        //fuzzy search
        let cardQuantity = fuzzyCardNamesQuantityDic[fuzzyCardName]
        var fuzzySearch = new Fuse(scryfallRequestResult, { keys: ['name'], id: "name" })
        let realCardName = fuzzySearch.search(fuzzyCardName)[0]
        let _cardJSON = scryfallRequestResult.find((i) => {
            return getCardNameFromJSON(i) == realCardName
        })

        return { cardJSON: _cardJSON, quantity: cardQuantity }
    })
}

var getScryfallPostParameters = (textAreaRef) => {
    let cardNamesQuantityDic = getCardNamesQuantityDic(textAreaRef)
    let identifiers = Object.keys(cardNamesQuantityDic).map((cardName) => {
        return {
            "name": cardName,
        }
    })
    return { identifiers }
}

var getCardNamesQuantityDic = (textAreaRef) => {
    if (textAreaRef == null || textAreaRef == '') {
        return {}
    }
    let _carNameDic = {}
    let lines = textAreaRef.split(/\r?\n/g)
    lines.forEach(line => {
        let matches = line.match(/([0-9]+) ([a-zA-Z0-9\s.,']+)/)
        if (matches == null) {
            return
        }
        let quantity = matches[1]
        let cardName = matches[2].toLowerCase()
        _carNameDic[cardName] = quantity
    });

    return _carNameDic
}