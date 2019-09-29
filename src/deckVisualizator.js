import React from 'react';
import { Table } from 'reactstrap';
import axios from 'axios'
import './mtg.css'

export class DeckViewer extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            data: [],
            currentDeckId: null
        }

        this.showDeck = this.showDeckData()
    }

    componentDidMount() {
        this.getDataListsFromServer()
    }

    showDeckData(id) {
        this.setState({
            currentDeckId: id
        })
    }

    render() {
        console.log(this.state.data)
        let list = this.state.data.map((item) => {
            return (
                <tr onClick={this.showDeck(item['id'])}>
                    {item['id']}
                    {item['playername']}
                    {item['deckname']}
                </tr>
            )
        })
        return (
            <div>
                <Table>
                    <thead>
                        <tr>
                            <th>Id</th>
                            <th>Player Name</th>
                            <th>Deck Name</th>
                        </tr>
                    </thead>
                    <tbody>
                        {list}
                    </tbody>
                </Table>
            </div>
        )
    }

    getDataListsFromServer() {
        axios.get(
            'http://190.44.74.23:3001/players'
        ).then((res) => {
            console.log(res)
            this.setState({
                data: res['data']
            })
        })
    }
}