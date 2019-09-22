import React from 'react';
import { Router, Route, Switch } from 'react-router-dom';

// common styling
import '../styles/main.scss';
import history from '../state/store/history';

import Home from './index';
import NotFound from './not-found';

const ReactApp = () => {
    return (
        <>
            <Router history={history}>
                <Switch>
                    <Route path="/" exact component={Home} />
                    <Route path="" component={NotFound} />
                </Switch>
            </Router>
        </>
    );
};

export default ReactApp;
