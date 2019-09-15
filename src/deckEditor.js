import React from 'react';
import { Button, Spinner, Nav, NavItem, NavLink, TabContent, TabPane, Container, Label, Input } from 'reactstrap';
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
        }

        this.mainDeckInput = React.createRef()
        this.sideDeckInput = React.createRef()
        this.showLoadingSpinner = false
    }

    toggleTab(tab) {
        if (this.state.activeTab !== tab) {
            this.setState({
                activeTab: tab
            });
        }
    }

    handleUpdateTextArea(event) {
        event.preventDefault()
        this.fetchDeckData()
    }

    render() {
        return (
            <div>
                <Nav tabs>
                    <NavItem size="lg">
                        <NavLink
                            size="lg"
                            className={classnames({ active: this.state.activeTab === 'maindeck' })}
                            onClick={() => { this.toggleTab('maindeck'); }}
                        >
                            Main Deck
                        </NavLink>
                    </NavItem>
                    <NavItem>
                        <NavLink
                            size="lg"
                            className={classnames({ active: this.state.activeTab === 'sidedeck' })}
                            onClick={() => { this.toggleTab('sidedeck'); }}
                        >
                            Side Deck
                        </NavLink>
                    </NavItem>
                </Nav>
                <TabContent activeTab={this.state.activeTab}>
                    <TabPane tabId="maindeck">
                        <Container>
                            <Label for="deck-editor">Deck Editor</Label>
                            <Input
                                type="textarea"
                                innerRef={this.mainDeckInput}
                                rows='17'
                                cols='10'
                                noresize='true'
                            />
                            <Button
                                type='submit'
                                color='primary'
                                onClick={this.handleUpdateTextArea.bind(this)}
                                size="lg"
                                block
                            >
                                <Spinner size="lg" color="dark  " />{' '}
                                Submit
                            </Button>
                        </Container>
                    </TabPane>
                    <TabPane tabId="sidedeck">
                        <Container>
                            <Label for="deck-editor">Deck Editor</Label>
                            <Input
                                type="textarea"
                                innerRef={this.sideDeckInput}
                                rows='17'
                                cols='10'
                                noresize='true'
                            />
                            <Button
                                type='submit'
                                color='primary'
                                size="lg"
                                onClick={this.handleUpdateTextArea.bind(this)}
                                block
                            >
                                <Spinner size="sm" color="secondary" />
                                Submit
                            </Button>
                        </Container>
                    </TabPane>
                </TabContent>
                <DeckList mainDeck={this.state.mainDeckCardList} sideDeck={this.state.sideDeckCardList} />
            </div>
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
} 