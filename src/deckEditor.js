import React from 'react';
import ReactDOM from 'react-dom';
import { Button, Row, Spinner, Nav, NavItem, NavLink, TabContent, TabPane, Container, Form, FormGroup, Label, Input } from 'reactstrap';
import { DeckList } from './decklist'
import classnames from 'classnames';
import './mtg.css'

export class DeckEditor extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            mainDeckRawText: '',
            sideDeckRawText: '',
            mainDeckCardTextList: '',
            sideDeckCardTextList: '',
            activeTab: 'maindeck'
        }
    }

    toggleTab(tab) {
        if (this.state.activeTab !== tab) {
            this.setState({
                activeTab: tab
            });
        }
    }

    handleChangeMainDeckTextArea(event) {
        event.preventDefault()
        this.setState({
            mainDeckRawText: event.target.value
        })
    }

    handleChangeSideDeckTextArea(event) {
        event.preventDefault()
        this.setState({
            sideDeckRawText: event.target.value
        })
    }

    handleUpdateSideDeckTextArea(event) {
        event.preventDefault()
        this.setState({
            mainDeckCardTextList: this.state.mainDeckRawText
        })
    }


    handleUpdateMainDeckTextArea(event) {
        event.preventDefault()
        this.setState({
            mainDeckCardTextList: this.state.mainDeckRawText
        })
    }

    render() {
        return (
            <div>
                <Nav tabs>
                    <NavItem>
                        <NavLink
                            className={classnames({ active: this.state.activeTab === 'maindeck' })}
                            onClick={() => { this.toggleTab('maindeck'); }}
                        >
                            Main Deck
                        </NavLink>
                    </NavItem>
                    <NavItem>
                        <NavLink
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
                                value={this.state.mainDeckRawText}
                                onChange={this.handleChangeMainDeckTextArea.bind(this)}
                                rows='17'
                                cols='10'
                                noresize='true'
                            />
                            <Button
                                type='submit'
                                color='primary'
                                onClick={this.handleUpdateSideDeckTextArea.bind(this)}
                                size="lg"
                                block
                            >
                                <Spinner size="lg" color="dark  "/>{' '}
                                Submit
                            </Button>
                        </Container>
                    </TabPane>
                    <TabPane tabId="sidedeck">
                        <Container>
                            <Label for="deck-editor">Deck Editor</Label>
                            <Input
                                type="textarea"
                                value={this.state.sideDeckRawText}
                                onChange={this.handleChangeSideDeckTextArea.bind(this)}
                                rows='17'
                                cols='10'
                                noresize='true'
                            />
                            <Button
                                type='submit'
                                color='primary'
                                onClick={this.handleUpdateSideDeckTextArea.bind(this)}
                            >
                                <Spinner size="sm" color="secondary" />
                                Submit
                            </Button>
                        </Container>
                    </TabPane>
                </TabContent>
                <DeckList cardsTextData={this.state.mainDeckCardTextList} />
            </div>
        );
    }
} 