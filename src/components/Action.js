import React from 'react';
import {FaMinus} from 'react-icons/all';
import classNames from 'classnames';

export default function Action({enabled, onClick, children}) {
    return (
        <>
            <span className={classNames('btn btn-outline-secondary', enabled ? 'text-white' : 'noselect')}
                  onClick={enabled && onClick}>
                {children}
            </span>
        </>
    );
}