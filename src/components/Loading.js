import * as React from 'react';

export default function Loading({message}) {

    return (
        <div>
            <h4 className="text-muted text-center pt-5">{message || 'Loading...'}</h4>
        </div>
    );
}