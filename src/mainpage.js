import React from 'react';
import { Nav, NavItem, NavLink, TabContent, TabPane, Container } from 'reactstrap';
import { DeckEditor } from './deckEditor'
import { DeckViewer } from './deckVisualizator'
import classnames from 'classnames';
import './mtg.css'

export class MainPage extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            activeTab: 'deckVisualizator'
        }
    }

    toggleTab(tab) {
        if (this.state.activeTab !== tab) {
            this.setState({
                activeTab: tab
            });
        }
    }

    render() {
        return (
            <Container>
                <Nav tabs>
                    <NavItem size="lg">
                        <NavLink
                            size="lg"
                            className={classnames({ active: this.state.activeTab === 'deckEditor' })}
                            onClick={() => { this.toggleTab('deckEditor'); }}
                        >
                            Deck Editor
                        </NavLink>
                    </NavItem>
                    <NavItem size="lg">
                        <NavLink
                            size="lg"
                            className={classnames({ active: this.state.activeTab === 'deckVisualizator' })}
                            onClick={() => { this.toggleTab('deckVisualizator'); }}
                        >
                            Decks Viewer
                        </NavLink>
                    </NavItem>
                </Nav>
                <TabContent activeTab={this.state.activeTab}>
                    <TabPane tabId="deckVisualizator">
                        <DeckViewer style={{ paddingTop: "5%" }}/>
                    </TabPane>
                    <TabPane tabId="deckEditor">
                        <DeckEditor />
                    </TabPane>
                </TabContent>
            </Container>
        )
    }
}

