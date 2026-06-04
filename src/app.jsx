import React from '../core/React.js';
import ReactDOM from '../core/ReactDOM.js';

let count = 1;

// App是函数组件，updateFunctionComponent会重新执行拿到新的VDOM
const App = () => {
  const handleClick = () => {
    console.log('click');
    count = Math.random();
    ReactDOM.update();
  };

  return (
    <div id='app'>
      <div>{count}</div>
      <button onClick={handleClick}>this is a button</button>
    </div>
  );
};

export default App;
