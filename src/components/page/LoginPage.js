import * as React from 'react';
import {FaGoogle} from 'react-icons/all';

export default function LoginPage() {

    return (
        <div>
            <div className="btn btn-outline-red btn-lg">
                <FaGoogle/>
                Sign in with Google
            </div>
            <div className="btn btn-outline-red btn-lg">
                Join as guest
            </div>
        </div>
    );
}