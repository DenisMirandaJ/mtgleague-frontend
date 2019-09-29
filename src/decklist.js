import React from 'react';
import { getCardNameFromJSON, getCardTypeFromJSON, getCardPriceFromJSON } from './base/utils'
import { Table, Container, Row, Col } from 'reactstrap'
import { CardInfo } from './CardInfo'
import './mtg.css';


export class DeckList extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        let cardsByType = this.filterCardsByType(this.props.mainDeck)

        let creatureCards = this.getCardInfoComponentObject(cardsByType['creatures'])
        let creatureCardsQuantity = cardsByType['creatures'].reduce((a, b) => +a + +b.quantity, 0)
        let creatures = [
            <tr key="1"><b>Creatures ({creatureCardsQuantity})</b></tr>,
            creatureCards
        ]

        let spellCards = this.getCardInfoComponentObject(cardsByType['spells'])
        let spellCardsQuantity = cardsByType['spells'].reduce((a, b) => +a + +b.quantity, 0)
        let spells = [
            <tr><b>Spells ({spellCardsQuantity})</b></tr>,
            spellCards
        ]
        let artifactCards = this.getCardInfoComponentObject(cardsByType['artifacts'])
        let artifactCardsQuantity = cardsByType['artifacts'].reduce((a, b) => +a + +b.quantity, 0)
        let artifacts = [
            <tr><b>Artifacts ({artifactCardsQuantity})</b></tr>,
            artifactCards
        ]
        let planeswalkerCards = this.getCardInfoComponentObject(cardsByType['planeswalkers'])
        let planeswalkerCardsQuantity = cardsByType['planeswalkers'].reduce((a, b) => +a + +b.quantity, 0)
        let planeswalkers = [
            <tr><b>Planewalkers ({planeswalkerCardsQuantity})</b></tr>,
            planeswalkerCards
        ]
        let enchantmentsCards = this.getCardInfoComponentObject(cardsByType['enchantments'])
        let enchantmentCardsQuantity = cardsByType['enchantments'].reduce((a, b) => +a + +b.quantity, 0)
        let enchantments = [
            <tr><b>Enchantments ({enchantmentCardsQuantity})</b></tr>,
            enchantmentsCards
        ]
        let landCards = this.getCardInfoComponentObject(cardsByType['lands'])
        let landCardsQuantity = cardsByType['lands'].reduce((a, b) => +a + +b.quantity, 0)
        let lands = [
            <tr><b>Lands ({landCardsQuantity})</b></tr>,
            landCards
        ]
        let otherCards = this.getCardInfoComponentObject(cardsByType['others'])
        let otherCardsQuantity = cardsByType['others'].reduce((a, b) => +a + +b.quantity, 0)
        let others = [
            <tr><b>Others ({otherCardsQuantity})</b></tr>,
            otherCards
        ]
        let sideDeckCards = this.getCardInfoComponentObject(this.props.sideDeck)
        let sideDeckCardsQuantity = this.props.sideDeck.reduce((a, b) => +a + +b.quantity, 0)
        let sideDeck = [
            <tr><b>Side Deck ({sideDeckCardsQuantity})</b></tr>,
            sideDeckCards
        ]
        let cards = [creatures, spells, artifacts, planeswalkers, enchantments, others, lands, sideDeck].filter((cardsList) => {
            return (cardsList[1].length != 0)
        })

        let totalPriceMainDeck = this.props.mainDeck.reduce((a, b) => +a + +getCardPriceFromJSON(b['cardJSON']) * b.quantity, 0)
        let totalPriceSideDeck = this.props.sideDeck.reduce((a, b) => +a + +getCardPriceFromJSON(b['cardJSON']) * b.quantity, 0)
        let totalDeckPrice = +(totalPriceMainDeck + totalPriceSideDeck).toFixed(2)
        // + operator for casting to Number
        let cardsInMainDeck = this.props.mainDeck.reduce((a, b) => +a + +b.quantity, 0)
        let cardsInSideDeck = this.props.sideDeck.reduce((a, b) => +a + +b.quantity, 0)
        return (
            <Container className='DeckList'>
                <Row>
                    <Col>
                        <p style={{ textAlign: 'right' }} className="text-info"><b>
                            <h2>{totalDeckPrice} USD</h2>
                        </b></p>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Table>
                            <tbody>
                                {cards}
                                <tr>
                                    <th></th>
                                    <th></th>
                                    <th></th>
                                    <th>{(cardsInMainDeck + cardsInSideDeck) + " cards total"}</th>
                                </tr>
                            </tbody>
                        </Table>
                    </Col>
                </Row>
            </Container>
        )
    }

    getCardInfoComponentObject(cardList) {
        let cards = cardList.map(
            (card) => {
                let cardName = getCardNameFromJSON(card['cardJSON'])
                let cardQuantity = card['quantity']
                return (
                    <CardInfo
                        key={cardName}
                        cardQuantity={cardQuantity}
                        cardInfo={card['cardJSON']}>
                    </CardInfo>
                )
            }
        )

        return cards
    }

    filterCardsByType(cards) {
        let creatures = cards.filter((card) => {
            return getCardTypeFromJSON(card['cardJSON']).match(/creature/i)
        })
        let spells = cards.filter(card => {
            let isInstant = getCardTypeFromJSON(card['cardJSON']).match(/instant/i)
            let isSorcery = getCardTypeFromJSON(card['cardJSON']).match(/sorcery/i)
            return (isInstant || isSorcery)
        })
        let artifacts = cards.filter(card => {
            let isArtifact = getCardTypeFromJSON(card['cardJSON']).match(/artifact/i)
            let isCreature = getCardTypeFromJSON(card['cardJSON']).match(/creature/i)
            return (isArtifact && !isCreature)
        })
        let planeswalkers = cards.filter(card => {
            let isPlaneswalker = getCardTypeFromJSON(card['cardJSON']).match(/planeswalker/i)
            let isCreature = getCardTypeFromJSON(card['cardJSON']).match(/creature/i)
            return (isPlaneswalker && !isCreature)
        })
        let lands = cards.filter(card => {
            let isLand = getCardTypeFromJSON(card['cardJSON']).match(/land/i)
            let isCreature = getCardTypeFromJSON(card['cardJSON']).match(/creature/i)
            return (isLand && !isCreature)
        })
        let enchantments = cards.filter(card => {
            let isEnchantment = getCardTypeFromJSON(card['cardJSON']).match(/enchantment/i)
            let isCreature = getCardTypeFromJSON(card['cardJSON']).match(/creature/i)
            return (isEnchantment && !isCreature)
        })

        //Cards not found on scryfall
        let others = cards.filter((card) => {
            return getCardTypeFromJSON(card['cardJSON']).match(/no_type/i)
        })

        return {
            'creatures': creatures,
            'spells': spells,
            'artifacts': artifacts,
            'planeswalkers': planeswalkers,
            'enchantments': enchantments,
            'others': others,
            'lands': lands
        }
    }
}
