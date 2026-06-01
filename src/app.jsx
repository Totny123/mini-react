import React from '../core/React.js';

const App = (
  <div id='app'>
    <div>hello</div>
    <div>mini-react</div>!
  </div>
);

const TheCompiledApp =
  /* @__PURE__ */
  React.createElement(
    'div',
    {
      id: 'app',
    } /* @__PURE__ */,
    React.createElement('div', null, 'hello') /* @__PURE__ */,
    React.createElement('div', null, 'mini-react'),
    '!',
  );

export default App;
