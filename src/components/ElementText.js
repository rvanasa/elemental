import React from 'react';

export default function ElementText({children}) {

    return (
        <span className="text-secondary noselect" style={{fontSize: 40}}>
            {children}
        </span>
    );
};
