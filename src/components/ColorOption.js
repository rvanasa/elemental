import * as React from 'react';

export default function ColorOption({color, active, onSelect}) {

    let style = {
        width: 30,
        height: 30,
        background: color,
        transition: 'transform .1s ease-out',
        transform: active && 'scale(.5)',
    };

    return (
        <div className="d-inline-block clickable p-1" onClick={e => e.preventDefault() & onSelect(color)}>
            <div className="d-inline-block rounded-sm" style={style}/>
        </div>
    );
}