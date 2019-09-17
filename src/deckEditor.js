import React from 'react';
import { Button, Alert, Nav, NavItem, NavLink, TabContent, TabPane, Container, Row, Col, Label, Input } from 'reactstrap';
import { DeckList } from './decklist'
import { getCardNameFromJSON } from './base/utils'
import classnames from 'classnames';
import Fuse from 'fuse.js'
import axios from 'axios'
import './mtg.css'

export class DeckEditor extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            mainDeckCardList: [],
            sideDeckCardList: [],
            activeTab: 'maindeck',
            deckName: '',
            showAlert: false
        }

        this.mainDeckInput = React.createRef()
        this.sideDeckInput = React.createRef()
        this.deckName = React.createRef()
        this.selectedPlayer = React.createRef()
        this.showLoadingSpinner = false
    }

    toggleTab(tab) {
        if (this.state.activeTab !== tab) {
            this.setState({
                activeTab: tab
            });
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps === this.props) {
            return
        }
    }

    handleUpdateTextArea(event) {
        event.preventDefault()
        this.fetchDeckData()
        this.setState({
            deckName: this.deckName.current.value,
            showAlert: false
        })
    }

    render() {
        return (
            <Container inline-block>
                <br></br>
                <h1 style={{ "paddingBottom": "5px", paddingTop: "5x" }}>Deck Editor</h1>
                <Row style={{ "paddingBottom": "10px" }}>
                    <Col>
                        <Label>Deck Name*</Label>
                        <Input
                            type="textarea"
                            rows="1"
                            innerRef={this.deckName}
                            noresize='true'
                        />
                    </Col>
                    <Col>
                        <Label>Player*</Label>
                        <Input type="textarea" rows="1" innerRef={this.selectedPlayer} />
                    </Col>
                    <Col>
                        <Label>Archetype</Label>
                        <Input type='select'>
                            <option>Aggro</option>
                            <option>Control</option>
                            <option>Midrange</option>
                            <option>Tempo</option>
                            <option>Combo</option>
                            <option>Demases por definir...</option>
                        </Input>
                    </Col>
                </Row>
                <Nav tabs>
                    <NavItem size="lg">
                        <NavLink
                            size="lg"
                            className={classnames({ active: this.state.activeTab === 'maindeck' })}
                            onClick={() => { this.toggleTab('maindeck'); }}
                        >
                            Main Deck*
                        </NavLink>
                    </NavItem>
                    <NavItem>
                        <NavLink
                            size="lg"
                            className={classnames({ active: this.state.activeTab === 'sidedeck' })}
                            onClick={() => { this.toggleTab('sidedeck'); }}
                        >
                            Sideboard
                        </NavLink>
                    </NavItem>
                </Nav>
                <TabContent activeTab={this.state.activeTab}>
                    <TabPane tabId="maindeck">
                        <Input
                            type="textarea"
                            innerRef={this.mainDeckInput}
                            rows='17'
                            cols='10'
                            noresize='true'
                            placeholder={'4 shock\n3 x Dovin\'s Veto'}
                        />
                    </TabPane>
                    <TabPane tabId="sidedeck">
                        <Input
                            type="textarea"
                            innerRef={this.sideDeckInput}
                            rows='17'
                            cols='10'
                            noresize='true'
                            placeholder={'4 Lightning Bolt\n3 x Aether Vial'}
                        />
                    </TabPane>
                </TabContent>
                {this.state.showAlert &&
                    <Alert color="success">
                        Deck was saved on the database
                    </Alert>}
                <Button
                    type='submit'
                    color='primary'
                    size="lg"
                    onClick={this.handleUpdateTextArea.bind(this)}
                    block
                >
                    Preview
                            </Button>
                <Button
                    type='submit'
                    color='primary'
                    size="lg"
                    onClick={this.saveDeckData.bind(this)}
                    block
                >
                    Submit
                        </Button>
                <DeckList style={{ paddingTop: "10px" }} mainDeck={this.state.mainDeckCardList} sideDeck={this.state.sideDeckCardList} />
            </Container>
        );
    }

    fetchDeckData() {
        let mainDeckScryfallPostParameters = this.getScryfallPostParameters(this.mainDeckInput.current.value)
        let sideDeckScryfallPostParameters = this.getScryfallPostParameters(this.sideDeckInput.current.value)
        if (mainDeckScryfallPostParameters === null ||
            mainDeckScryfallPostParameters == [] ||
            mainDeckScryfallPostParameters.identifier == []) {
            return
        }
        if (sideDeckScryfallPostParameters === null ||
            sideDeckScryfallPostParameters == [] ||
            sideDeckScryfallPostParameters.identifier == []) {
            return
        }

        axios.post(
            'https://api.scryfall.com/cards/collection',
            mainDeckScryfallPostParameters
        ).then(res => {
            let result = res['data']['data'].concat(res['data']['not_found'])
            let cardNamesQuantityDic = this.getCardNamesQuantityDic(this.mainDeckInput.current.value)
            this.setState({
                mainDeckCardList: this.constructCardJSONQuantityObject(cardNamesQuantityDic, result)
            })
        })

        axios.post(
            'https://api.scryfall.com/cards/collection',
            sideDeckScryfallPostParameters
        ).then(res => {
            let result = res['data']['data'].concat(res['data']['not_found'])
            let cardNamesQuantityDic = this.getCardNamesQuantityDic(this.sideDeckInput.current.value)
            this.setState({
                sideDeckCardList: this.constructCardJSONQuantityObject(cardNamesQuantityDic, result)
            })
        })
    }

    constructCardJSONQuantityObject(fuzzyCardNamesQuantityDic, scryfallRequestResult) {
        return Object.keys(fuzzyCardNamesQuantityDic).map((fuzzyCardName) => {
            //fuzzy search
            let cardQuantity = fuzzyCardNamesQuantityDic[fuzzyCardName]
            var fuzzySearch = new Fuse(scryfallRequestResult, { keys: ['name'], id: 'name' })
            let realCardName = fuzzySearch.search(fuzzyCardName)[0]

            let _cardJSON = scryfallRequestResult.find((cardJSON) => {
                return realCardName.includes(getCardNameFromJSON(cardJSON))
            })
            return { cardJSON: _cardJSON, quantity: cardQuantity }
        })
    }

    getScryfallPostParameters(textAreaRef) {
        if (textAreaRef === '') {
            return {}
        }
        let cardNamesQuantityDic = this.getCardNamesQuantityDic(textAreaRef)
        let identifiers = Object.keys(cardNamesQuantityDic).map((cardName) => {
            return {
                "name": cardName,
            }
        })
        return { identifiers }
    }

    getCardNamesQuantityDic(textAreaRef) {
        if (textAreaRef === null || textAreaRef === '') {
            return {}
        }
        let quantity
        let cardName
        let _carNameDic = {}
        let lines = textAreaRef.split(/\r?\n/g)
        lines.forEach(line => {
            let matches = line.match(/([0-9]+)(\s+x\s+)?([a-zA-Z0-9\s.,'-]+)/)
            if (matches == null) {
                matches = line.match(/[a-zA-Z0-9\s.,'-]+/)
                if (matches == null || line.match(/[0-9]+/)) {
                    return
                }
                quantity = "1"
                cardName = matches[0]
                _carNameDic[cardName] = quantity
            } else {
                quantity = matches[1]
                cardName = matches[3].toLowerCase()
                _carNameDic[cardName] = quantity
            }
        });

        return _carNameDic
    }

    saveDeckData() {

        let mainDeck = this.mainDeckInput.current === null ? '' : this.mainDeckInput.current.value
        let sideDeck = this.sideDeckInput.current === null ? '' : this.sideDeckInput.current.value
        let deckName = this.deckName.current === null ? '' : this.deckName.current.value
        let selectedPlayer = this.selectedPlayer.current === null ? '' : this.selectedPlayer.current.value
        if (this.state.mainDeckCardList.length == 0 ||
            deckName == '' ||
            selectedPlayer == '') {
            alert("Please fill all required* fields")
            return
        }

        let postBody = {
            'deckName': deckName,
            'playerName': selectedPlayer,
            'elo': 1200,
            'maindeck': { 'data': this.state.mainDeckCardList },
            'sideboard': { 'data': this.state.sideDeckCardList }
        }

        this.setState({
            showAlert: false
        })
        axios.post(
            'http://190.44.74.23:3001/players',
            postBody
        ).then((res) => {
            console.log(res)
            this.setState({
                showAlert: true
            })
            setTimeout(() => { this.setState({ showAlert: false }) }, 10000)
        })
    }
} 