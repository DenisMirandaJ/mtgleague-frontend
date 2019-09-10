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
            cardDic: []
        }
    }

    componentDidMount() {
        this.fetchDeckData()
    }

    componentDidUpdate(prevProps) {
        if (this.props.cardsTextData !== prevProps.cardsTextData) {
            console.log("refecth")
            this.fetchDeckData()
        }
    }

    render() {
        let cardDic = this.getCardNamesQuantityDic()
        let cards = this.state.cardList.map(
            (cardJSON) => {
                let cardQuantity = this.getCardQuantity(cardJSON["name"])
                return (
                    <CardInfo
                        key={cardJSON['name']}
                        cardQuantity={cardQuantity}
                        cardInfo={cardJSON}>
                    </CardInfo>
                )
            }
        )

        let halfLength = Math.ceil(cards.length / 2);
        let leftTable = cards.slice(0, halfLength)
        let rightTable = cards.slice(halfLength)
        return (
            <Container>
                Deck
                <Row>
                    <Col>
                        <Table>
                            <tbody>
                                {leftTable}
                            </tbody>
                        </Table>
                    </Col>
                    <Col>
                        <Table>
                            <tbody>
                                {rightTable}
                            </tbody>
                        </Table>
                    </Col>
                </Row>
            </Container>
        )
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
        console.log(scryfallPostParameters)
        if (scryfallPostParameters == null || scryfallPostParameters == {}) {
            return
        }
        axios.post(
            'https://api.scryfall.com/cards/collection',
            scryfallPostParameters
        ).then(res => {
            let result = res['data']['data']
            console.log(res)
            this.setState({
                cardList: result
            })
        })
    }

    getScryfallPostParameters() {
        let cardNamesQuantityDic = this.getCardNamesQuantityDic()
        console.log(cardNamesQuantityDic)
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
