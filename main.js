import React from './core/React.js';
import ReactDOM from './core/ReactDOM.js';

const rootContainer = document.querySelector('#root');

const divEl = React.createElement('div', { id: 'app' }, 'hello', ' mini-react');

ReactDOM.createRoot(rootContainer).render(divEl);
