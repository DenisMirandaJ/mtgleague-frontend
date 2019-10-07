import React from 'react';
import { Table, Modal, ModalHeader, ModalBody, Button, Collapse } from 'reactstrap';
import { DeckList } from './decklist'
import { getColorsFromJSON, getCardManaCostSymbols} from './base/utils'
import axios from 'axios'
import './mtg.css'

export class DeckViewer extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            data: [],
            currentDeckId: null,
            currentMainDeck: null,
            currentSideDeck: null,
            currentProxyDeck: null,
            currentDeckName: '',
            showModal: false
        }

        this.toggleDeckView = this.showDeckData
    }

    componentDidMount(prevProps, prevState, snapshot) {
        this.getDataListsFromServer()
    }


    componentDidUpdate(prevProps, prevState) {
        if (this.state.data === prevState.data) {
            this.getDataListsFromServer()
        }
    }

    toggleProxyes() {
        this.setState(state => ({ collapse: !state.collapse }));
    }

    getColorIdentity(mainDeck) {
        let colorIdentity = []
        mainDeck.forEach(cardJSON => {
            colorIdentity = colorIdentity.concat(getColorsFromJSON(cardJSON['cardJSON']))
        });

        function onlyUnique(value, index, self) {
            return self.indexOf(value) === index;
        }
        let colors = colorIdentity.filter(onlyUnique)
        return colors.join('')
    }

    showDeckData(id) {
        let currentEntry = this.state.data.find((element) => {
            return element.id == id
        })

        if (currentEntry == undefined) {
            this.setState({
                showModal: !this.state.showModal
            })
            return
        }
        this.setState({
            currentDeckId: id,
            currentMainDeck: currentEntry['maindeck']['data'],
            currentSideDeck: currentEntry['sideboard']['data'],
            currentProxyDeck: currentEntry['proxyes']['data'],
            currentDeckName: currentEntry['deckname'],
            showModal: !this.state.showModal
        })
    }

    getDataListsFromServer() {
        axios.get(
            process.env.REACT_APP_API_URL + '/players'
        ).then((res) => {
            this.setState({
                data: res['data']
            })
        })
    }

    render() {
        let list = this.state.data.map((item) => {
            return (
                <tr onClick={() => { this.toggleDeckView(item['id']) }}>
                    <th>{item['playername']}</th>
                    <th>{item['deckname']}</th>
                    <th>{
                        getCardManaCostSymbols(this.getColorIdentity(item['maindeck']['data']))
                        }
                    </th>
                </tr>
            )
        }, this)

        return (
            <div>
                <Table hover striped>
                    <thead>
                        <tr>
                            <th>Player Name</th>
                            <th>Deck Name</th>
                            <th>Color Identity</th>
                        </tr>
                    </thead>
                    <tbody>
                        {list}
                    </tbody>
                </Table>
                <Modal isOpen={this.state.showModal} toggle={this.showDeckData.bind(this)} className={this.props.className}>
                    <ModalHeader toggle={this.showDeckData.bind(this)}>
                        <h2>{this.state.currentDeckName}</h2>
                    </ModalHeader>
                    <ModalBody>
                        <DeckList
                            style={{ paddingTop: "2%" }}
                            mainDeck={this.state.currentMainDeck}
                            sideDeck={this.state.currentSideDeck}
                        />
                        <Button
                            color="link"
                            onClick={this.toggleProxyes.bind(this)}
                            style={{ marginBottom: '1rem' }}
                        >
                            Show Proxy Cards
                        </Button>
                        <Collapse isOpen={this.state.collapse}>
                            <label>Proxyes</label>
                            <DeckList style={{ paddingTop: "2%" }} mainDeck={this.state.currentProxyDeck} sideDeck={[]} />
                        </Collapse>
                        <Button
                            color="secondary"
                            onClick={this.showDeckData.bind(this)}
                            block
                        >
                            Close
                        </Button>
                    </ModalBody>
                </Modal>
            </div>
        )
    }

}