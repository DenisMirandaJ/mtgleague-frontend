import React from 'react';
import { Button, Collapse, Alert, Nav, NavItem, NavLink, TabContent, TabPane, FormFeedback, Row, Col, Label, Input } from 'reactstrap';
import { DeckList } from './decklist'
import { getCardNameFromJSON } from './base/utils'
import { API_URL } from './base/config'
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
            proxyDeckCardList: [],
            activeTab: 'maindeck',
            deckName: '',
            showAlert: false,
            collapse: false,
            showProxyErrorAlert: false,
            validate: {
                mainDeckField: true,
                deckNameField: true,
                playerNameField: true
            }
        }

        this.mainDeckInput = React.createRef()
        this.sideDeckInput = React.createRef()
        this.deckName = React.createRef()
        this.selectedPlayer = React.createRef()
        this.proxyes = React.createRef()

        this.showLoadingSpinner = false
    }

    toggleTab(tab) {
        if (this.state.activeTab !== tab) {
            this.setState({
                activeTab: tab
            });
        }
    }

    validatePlayerInput() {
        let isPlayerNameFieldValid = true
        if (
            this.selectedPlayer.current == null ||
            this.selectedPlayer.current.value == ''
        ) {
            isPlayerNameFieldValid = false
        }

        this.setState(prevState => {
            let validate = Object.assign({}, prevState.validate);
            validate.playerNameField = isPlayerNameFieldValid;
            return { validate };
        })

        return isPlayerNameFieldValid
    }

    validateDeckNameInput() {
        let isDeckNameFieldValid = true
        if (
            this.deckName.current == null ||
            this.deckName.current.value == ''
        ) {
            isDeckNameFieldValid = false
        }

        this.setState(prevState => {
            let validate = Object.assign({}, prevState.validate);
            validate.deckNameField = isDeckNameFieldValid;
            return { validate };
        })

        return isDeckNameFieldValid
    }

    validateMainDeckInput() {
        let isMainDeckFieldValid = true
        if (
            this.mainDeckInput.current == null ||
            this.mainDeckInput.current.value == ''
        ) {
            isMainDeckFieldValid = false
        }

        this.setState(prevState => {
            let validate = Object.assign({}, prevState.validate);
            validate.mainDeckField = isMainDeckFieldValid;
            return { validate };
        })

        return isMainDeckFieldValid
    }

    validate() {
        return (
            this.validateDeckNameInput() &&
            this.validatePlayerInput() &&
            this.validateMainDeckInput()
        )
    }


    toggleProxyes() {
        this.setState(state => ({ collapse: !state.collapse }));
    }

    handleSubmit(event) {
        this.validate()
        event.preventDefault()
        this.fetchDeckData()
        this.setState({
            deckName: this.deckName.current.value,
            showAlert: false
        })
    }

    fetchDeckData() {
        let mainDeckScryfallPostParameters = this.getScryfallPostParameters(this.mainDeckInput.current.value)
        let sideDeckScryfallPostParameters = this.getScryfallPostParameters(this.sideDeckInput.current.value)
        let proxyDeckScryfallPostParameters = this.getScryfallPostParameters(this.proxyes.current.value)

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

        if (!this.checkProxysValidity()) {
            this.setState({ showProxyErrorAlert: true })
            return
        } else {
            this.setState({ showProxyErrorAlert: false })
        }
        axios.post(
            'https://api.scryfall.com/cards/collection',
            proxyDeckScryfallPostParameters
        ).then(res => {
            let result = res['data']['data'].concat(res['data']['not_found'])
            let cardNamesQuantityDic = this.getCardNamesQuantityDic(this.proxyes.current.value)
            this.setState({
                proxyDeckCardList: this.constructCardJSONQuantityObject(cardNamesQuantityDic, result)
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
            let matches = line.match(/([0-9]+)(\s+x\s+)?([a-zA-Z0-9\s.,'-\/]+)/)
            if (matches == null) {
                matches = line.match(/[a-zA-Z0-9\s.,'\/-]+/)
                if (matches == null || line.match(/[0-9]+/)) {
                    return
                }
                quantity = "1"
                cardName = matches[0].toLowerCase()
                _carNameDic[cardName] = quantity
            } else {
                quantity = matches[1]
                cardName = matches[3].toLowerCase()
                _carNameDic[cardName] = quantity
            }
        });

        return _carNameDic
    }

    checkProxysValidity() {
        let mainDeck = this.getCardNamesQuantityDic(this.mainDeckInput.current.value)
        let sideboard = this.getCardNamesQuantityDic(this.sideDeckInput.current.value)
        let proxyCards = this.getCardNamesQuantityDic(this.proxyes.current.value)
        let aux = {}

        for (const cardItem in mainDeck) {
            let i = sideboard[cardItem]
            if (i == undefined) {
                aux[cardItem] = +mainDeck[cardItem]
                continue
            }
            aux[cardItem] = +mainDeck[cardItem] + +i
        }
        for (const cardItem in sideboard) {
            let i = mainDeck[cardItem]
            if (i == undefined) {
                aux[cardItem] = +sideboard[cardItem]
                continue
            }
            aux[cardItem] = +sideboard[cardItem] + +i
        }

        for (const proxyCard in proxyCards) {
            let cards = Object.keys(aux)
            if (!cards.includes(proxyCard)) {
                return false
            }
            if (aux[proxyCard] < proxyCards[proxyCard]) {
                return false
            }
        }

        return true

    }

    saveDeckData() {
        let isFormValid = this.validate()
        if (!isFormValid) {
            return
        }
        let deckName = this.deckName.current === null ? '' : this.deckName.current.value
        let selectedPlayer = this.selectedPlayer.current === null ? '' : this.selectedPlayer.current.value

        let postBody = {
            'playername': selectedPlayer,
            'deckname': deckName,
            'password': "pass",
            'maindeck': { 'data': this.state.mainDeckCardList },
            'sideboard': { 'data': this.state.sideDeckCardList },
            'proxyes': { 'data': this.state.proxyDeckCardList },
        }


        this.setState({
            showAlert: false
        })
        axios.post(
            process.env.REACT_APP_API_URL+'/players',
            postBody
        ).then((res) => {
            this.setState({
                showAlert: true
            })
            setTimeout(() => { this.setState({ showAlert: false }) }, 10000)
        })
    }

    render() {
        return (
            <div>
                <h1 style={{ paddingBottom: "10px", paddingTop: "2%" }}>Deck Editor</h1>
                <Row style={{ paddingBottom: "2%" }}>
                    <Col>
                        <Label>Deck Name*</Label>
                        <Input
                            type="textarea"
                            rows="1"
                            innerRef={this.deckName}
                            invalid={!this.state.validate.deckNameField}
                            onChange={this.validateDeckNameInput.bind(this)}
                        />
                        <FormFeedback invalid>
                            Required field
                        </FormFeedback>
                    </Col>
                    <Col>
                        <Label>Player*</Label>
                        <Input
                            type="textarea"
                            rows="1"
                            innerRef={this.selectedPlayer}
                            invalid={!this.state.validate.playerNameField}
                            onChange={this.validatePlayerInput.bind(this)} />
                        <FormFeedback invalid>
                            Required field
                        </FormFeedback>
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
                    <NavItem size="lg">
                        <NavLink
                            size="lg"
                            className={classnames({ active: this.state.activeTab === 'proxyes' })}
                            onClick={() => { this.toggleTab('proxyes'); }}
                        >
                            Proxys
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
                            invalid={!this.state.validate.mainDeckField}
                            onChange={this.validateMainDeckInput.bind(this)}
                        />
                        <FormFeedback invalid>
                            Required field
                        </FormFeedback>
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
                    <TabPane tabId="proxyes">
                        <Input
                            type="textarea"
                            innerRef={this.proxyes}
                            rows='17'
                            cols='10'
                            noresize='true'
                            placeholder={'Enter the proxy cards in your deck'}
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
                    onClick={this.handleSubmit.bind(this)}
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
                <DeckList style={{ paddingTop: "2%" }} mainDeck={this.state.mainDeckCardList} sideDeck={this.state.sideDeckCardList} />
                {
                    this.state.showProxyErrorAlert &&
                    <Alert color="warning">
                        Invalid proxy list
                    </Alert>
                }
                {
                    !this.state.showProxyErrorAlert &&
                    <div>
                        <Button color="link" onClick={this.toggleProxyes.bind(this)} style={{ marginBottom: '1rem' }}>Show Proxy Cards</Button>
                        <Collapse isOpen={this.state.collapse}>
                            <DeckList style={{ paddingTop: "2%" }} mainDeck={this.state.proxyDeckCardList} sideDeck={[]} />
                        </Collapse>
                    </div>
                }
            </div>
        );
    }

} 