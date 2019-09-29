import React from 'react';
import { Button, Modal, ModalBody, ModalHeader } from 'reactstrap'
import {getCardPriceFromJSON} from './base/utils'
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
        let cardNotFound = false
        let cardName = ''
        let cardImagesURL = null
        let cardSymbols = null
        let cardLink = null
        if (this.props.cardInfo['card_faces'] != null) {
            cardImagesURL = <div>
                <img width="100%" alt="Not Found" src={this.props.cardInfo['card_faces'][0]['image_uris']["normal"]} />
                <img width="100%" alt="Not Found" src={this.props.cardInfo['card_faces'][1]['image_uris']["normal"]} />
            </div>
            cardSymbols = this.getCardManaCost(this.props.cardInfo['card_faces'][0]['mana_cost'])
            cardName = this.props.cardInfo['card_faces'][0]['name']
            cardLink = <Button color='link' onClick={this.toggle}>{cardName}</Button>
        } else if (this.props.cardInfo['image_uris'] != null) {
            cardImagesURL = <img width="100%" alt="Not Found" src={this.props.cardInfo['image_uris']["normal"]} />
            cardSymbols = this.getCardManaCost(this.props.cardInfo['mana_cost'])
            cardName = this.props.cardInfo["name"]
            cardLink = <Button color='link' onClick={this.toggle}>{cardName}</Button>
        } else {
            cardName = this.props.cardInfo["name"]
            cardImagesURL = <img width="100%" alt="Not Found" src='' />
            cardLink = cardName
            cardNotFound = true
        }

        if (cardNotFound) {
            return (
                <tr class='table-danger'>
                    <th>{this.props.cardQuantity}</th>
                    <th >{cardLink}</th>
                    <th>{cardSymbols}</th>
                    <th>{getCardPriceFromJSON(this.props.cardInfo)*this.props.cardQuantity} USD</th>
                    <Modal isOpen={this.state.modal} toggle={this.toggle} className={this.props.className}>
                        <ModalHeader toggle={this.toggle}></ModalHeader>
                        <ModalBody>
                            {cardImagesURL}
                        </ModalBody>
                    </Modal>
                </tr>
            )
        } else {
            return (
                <tr>
                    <th>{this.props.cardQuantity}</th>
                    <th >{cardLink}</th>
                    <th>{cardSymbols}</th>
                    <th>{(getCardPriceFromJSON(this.props.cardInfo)*this.props.cardQuantity).toFixed(2)} USD</th>
                    <Modal isOpen={this.state.modal} toggle={this.toggle} className={this.props.className}>
                        <ModalHeader toggle={this.toggle}></ModalHeader>
                        <ModalBody>
                            {cardImagesURL}
                        </ModalBody>
                    </Modal>
                </tr>
            )
        }
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


