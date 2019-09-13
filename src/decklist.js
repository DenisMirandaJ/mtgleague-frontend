import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios'
import { Table, Container, Row, Col } from 'reactstrap'
import { CardInfo } from './CardInfo'
import './mtg.css';


export class DeckList extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            cardList: [],
        }
    }

    componentDidMount() {
        this.fetchDeckData()
    }

    componentDidUpdate(prevProps) {
        if (this.props.cardsTextData !== prevProps.cardsTextData) {
            this.setState({
                cardList: []
            })
            this.fetchDeckData()
        }
    }

    render() {
        let cardsByType = this.filterCardsByType(this.state.cardList)
        let creatures = [<b key='1'>Creatures</b>, this.getCardInfoComponentObject(cardsByType['creatures'])]
        let spells = [<b>Spells</b>, this.getCardInfoComponentObject(cardsByType['spells'])]
        let artifacts = [<b>Artifacts</b>, this.getCardInfoComponentObject(cardsByType['artifacts'])]
        let planeswalkers = [<b>Planewalkers</b>, this.getCardInfoComponentObject(cardsByType['planeswalkers'])]
        let lands = [<b>Lands</b>, this.getCardInfoComponentObject(cardsByType['lands'])]
        let cards = [creatures, spells, artifacts, planeswalkers, lands].filter((cardsList) => {
            return (cardsList[1].length != 0)
        })
        return (
            <Container className='DeckList'>
                Deck
                <Row>
                    <Col>
                        <Table>
                            <tbody>
                                {cards}
                            </tbody>
                        </Table>
                    </Col>
                </Row>
            </Container>
        )
    }

    getCardInfoComponentObject(cardList) {
        let cards = cardList.map(
            (cardJSON) => {
                let cardName = ""
                let cardQuantity
                if (cardJSON["card_faces"] != null) {
                    console.log("two faces")
                    cardQuantity = this.getCardQuantity(cardJSON['card_faces'][0]['name'])
                } else {
                    console.log("one face")
                    cardQuantity = this.getCardQuantity(cardJSON["name"])
                    cardName = cardJSON["name"]
                }
                return (
                    <CardInfo
                        key={cardName}
                        cardQuantity={cardQuantity}
                        cardInfo={cardJSON}>
                    </CardInfo>
                )
            }
        )

        return cards
    }

    getCardQuantity(cardNameFromAPI) {
        let cardDic = this.getCardNamesQuantityDic()
        let card = Object.keys(cardDic).filter((cardName) => {
            let cardNameFromUser = cardName.toLowerCase().replace(/\s/g, '')
            cardNameFromAPI = cardNameFromAPI.toLowerCase().replace(/\s/g, '')
            return (cardNameFromUser === cardNameFromAPI)
        })[0]

        return cardDic[card]
    }

    fetchDeckData() {
        let scryfallPostParameters = this.getScryfallPostParameters()
        if (scryfallPostParameters == null || scryfallPostParameters == {}) {
            return
        }
        axios.post(
            'https://api.scryfall.com/cards/collection',
            scryfallPostParameters
        ).then(res => {
            let result = res['data']['data']
            console.log(result)
            this.setState({
                cardList: result
            })
        })
    }

    filterCardsByType(cardsJSON) {
        let creatures = cardsJSON.filter((card) => {
            return card['type_line'].match(/creature/i)
        })
        let spells = cardsJSON.filter(card => {
            let isInstant = card['type_line'].match(/instant/i)
            let isSorcery = card['type_line'].match(/sorcery/i)
            return (isInstant || isSorcery)
        })
        let artifacts = cardsJSON.filter(card => {
            let isArtifact = card['type_line'].match(/artifact/i)
            let isCreature = card['type_line'].match(/creature/i)
            return (isArtifact && !isCreature)
        })
        let planeswalkers = cardsJSON.filter(card => {
            let isPlaneswalker = card['type_line'].match(/planeswalker/i)
            let isCreature = card['type_line'].match(/creature/i)
            return (isPlaneswalker && !isCreature)
        })
        let lands = cardsJSON.filter(card => {
            let isLand = card['type_line'].match(/land/i)
            let isCreature = card['type_line'].match(/creature/i)
            return (isLand && !isCreature)
        })

        return {
            'creatures': creatures,
            'spells': spells,
            'artifacts': artifacts,
            'planeswalkers': planeswalkers,
            'lands': lands
        }
    }

    getScryfallPostParameters() {
        let cardNamesQuantityDic = this.getCardNamesQuantityDic()
        let identifiers = Object.keys(cardNamesQuantityDic).map((cardName) => {
            return {
                "name": cardName,
            }
        })
        return { identifiers }
    }

    getCardNamesQuantityDic() {
        if (this.props.cardsTextData == null || this.props.cardsTextData == '') {
            return {}
        }
        let _carNameDic = {}
        let lines = this.props.cardsTextData.split(/\r?\n/g)
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

}
