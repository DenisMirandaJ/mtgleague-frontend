import React from 'react';
import ReactDOM from 'react-dom';
import {Popover} from 'reactstrap'
import './mtg.css';

export function CardInfo(props) {
    let cardSymbols = getCardManaCost(props.cardInfo["mana_cost"])
    return (
        <tr>
            <th>{props.cardQuantity}</th>
            <th>{props.cardInfo["name"]}</th>
            <th>{cardSymbols}</th>
            <th>{props.cardInfo["prices"]["usd"]}</th>
        </tr>
    )
}


function getCardManaCost(manaCost) {
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