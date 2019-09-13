import React from 'react';
import ReactDOM from 'react-dom';
import { Button, Modal, ModalBody, ModalHeader } from 'reactstrap'
import './mtg.css';

export class CardInfo extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            modal: false
        };

        this.toggle = this.toggleCardView.bind(this);
    }

    render() {
        let cardImagesURL = null
        let cardSymbols = null
        if (this.props.cardInfo['card_faces'] != null) {
            cardImagesURL = <div>
                <img width="100%" src={this.props.cardInfo['card_faces'][0]['image_uris']["normal"]} />
                <img width="100%" src={this.props.cardInfo['card_faces'][1]['image_uris']["normal"]} />
            </div>
            cardSymbols = this.getCardManaCost(this.props.cardInfo['card_faces'][0]['mana_cost'])
        } else {
            cardImagesURL = <img width="100%" src={this.props.cardInfo['image_uris']["normal"]} />
            cardSymbols = this.getCardManaCost(this.props.cardInfo['mana_cost'])
        }
        return (
            <tr>
                <th>{this.props.cardQuantity}</th>
                <th><Button color='link' onClick={this.toggle}>{this.props.cardInfo["name"]}</Button></th>
                <th>{cardSymbols}</th>
                <Modal isOpen={this.state.modal} toggle={this.toggle} className={this.props.className}>
                    <ModalHeader toggle={this.toggle}></ModalHeader>
                    <ModalBody>
                        {cardImagesURL}
                    </ModalBody>
                </Modal>
            </tr>
        )
    }


    toggleCardView() {
        this.setState(prevState => ({
            modal: !prevState.modal
        }));
    }

    getCardManaCost(manaCost) {
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
}


