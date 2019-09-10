import React from 'react';
import ReactDOM from 'react-dom';
import { Form, FormGroup, Label, Input, Button, Container, Row, Col, ListGroup, ListGroupItem } from 'reactstrap';
import { DeckList } from './decklist'

export class DeckEditor extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            rawText: '',
            cardTextList: ''
        }
    }

    handleChange(event) {
        event.preventDefault()
        this.setState({
            rawText: event.target.value
        })
    }

    handleUpdatePreview(event) {
        event.preventDefault()
        this.setState({
            cardTextList: this.state.rawText
        })

    }

    render() {
        return (
            <Container>
                <Row>
                    <Col xs='2'>
                        <Form>
                            <FormGroup inline>
                                <Label for="deck-editor">Deck Editor</Label>
                                <Input
                                    type="textarea"
                                    value={this.state.rawText}
                                    onChange={this.handleChange.bind(this)}
                                    rows='17'
                                    cols='10'
                                    noresize='true'
                                />
                                <Button
                                    type='submit'
                                    color='primary'
                                    onClick={this.handleUpdatePreview.bind(this)}
                                >
                                    Submit
                        </Button>
                            </FormGroup>
                        </Form>
                    </Col>
                    <Col xs="auto">
                        <DeckList cardsTextData={this.state.cardTextList} />
                    </Col>
                </Row>
            </Container>
        );
    }
} 