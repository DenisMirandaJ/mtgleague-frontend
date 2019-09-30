import React from 'react';
import { Table, Modal, ModalHeader, ModalBody, Button, Collapse } from 'reactstrap';
import { DeckList } from './decklist'
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
        this.tets = "hola"
    }

    componentDidMount() {
        this.getDataListsFromServer()
    }

    toggleProxyes() {
        this.setState(state => ({ collapse: !state.collapse }));
    }

    showDeckData(id) {
        console.log(id)
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

    render() {
        let list = this.state.data.map((item) => {
            return (
                <tr onClick={() => { this.toggleDeckView(item['id']) }}>
                    <th>{item['playername']}</th>
                    <th>{item['deckname']}</th>
                </tr>
            )
        }, this)

        console.log(this.state)
        return (
            <div>
                <Table hover striped>
                    <thead>
                        <tr>
                            <th>Player Name</th>
                            <th>Deck Name</th>
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

    getDataListsFromServer() {
        axios.get(
            'http://190.44.74.23:8001/players'
        ).then((res) => {
            this.setState({
                data: res['data']
            })
        })
    }
}