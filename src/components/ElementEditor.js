import * as React from 'react';
import {useState} from 'react';
import Recipe from './Recipe';
import {Button, Form} from 'react-bootstrap';
import ColorOption from './ColorOption';
import {COLORS} from '../services/colors';
import {sentenceCase} from 'change-case';
import {cleanupElementName} from '../services/world';

export default function ElementEditor({element: template, onSubmit}) {

    let [name, setName] = useState(String((template.submitted && template.name) || ''));
    let [color, setColor] = useState(template.color);
    let [attempted, setAttempted] = useState(false);

    if(!color) {
        setColor(COLORS[Math.floor(Math.random() * COLORS.length)]);
        return;
    }

    // let world = useContext(WorldContext);

    let element = {
        ...template,
        name: cleanupElementName(name) || template.name || '',
        color,
    };

    let error = null;
    if(!element.name.trim()) {
        error = 'Please enter an element name.';
    }
    else if(element.name.length > 20) {
        error = 'Name must be 20 characters or less.';
    }

    function submit(e) {
        e.preventDefault();
        setAttempted(true);
        if(!error) {
            onSubmit && onSubmit(element);
        }
    }

    function cancel() {
        onSubmit && onSubmit();
    }

    return (
        <Form className="mt-3"
              onSubmit={submit}>
            <Button variant="primary" size="lg" className="w-100" onClick={cancel}>
                Cancel
            </Button>
            <div className="p-2 mb-2" style={{background: '#0005'}}>
                {element.recipe && (<Recipe recipe={element.recipe} child={element}/>)}
            </div>
            <Form.Group>
                <Form.Label className="h4">What should these create?</Form.Label>
                <Form.Control
                    size="lg"
                    type="text"
                    autoFocus
                    autoComplete="off"
                    placeholder={template.name}
                    value={name}
                    onKeyDown={e => e.which === 27 && cancel()}
                    onChange={e => setName(e.target.value)}
                />
            </Form.Group>
            <div>
                {COLORS.flatMap((c, i) => [
                    <ColorOption key={c} color={c} active={element.color === c} onSelect={() => setColor(c)}/>,
                    ((i + 1) % 10 === 0 && <br key={c + ':' + i}/>),
                ])}
            </div>

            {/*<Form.Group>*/}
            {/*    <Form.Label>Custom message (optional):</Form.Label>*/}
            {/*    <Form.Control type="area" autoComplete="off" placeholder="Type anything you want"/>*/}
            {/*</Form.Group>*/}
            {/*<Form.Group>*/}
            {/*    <Form.Check type="checkbox" label="Check me out"/>*/}
            {/*</Form.Group>*/}
            <hr className="my-2"/>
            <Button variant="primary" size="lg" type="submit" className="w-100 py-2">
                Submit
            </Button>
            {error && attempted && (
                <p className="h5 text-light mt-2">{error}</p>
            )}
        </Form>
    );
}