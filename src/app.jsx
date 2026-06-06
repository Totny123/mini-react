import React from '../core/React.js';
import ReactDOM from '../core/ReactDOM.js';

const BarCount = () => {
  console.log('BarCount run');

  const [count, setCount] = ReactDOM.useState(0);
  const [text, setText] = ReactDOM.useState('text');
  const handleClick = () => {
    setCount((c) => c + 1);
    setText((t) => t + 'text');
  };

  return (
    <div>
      <div>Bar</div>
      <div>{count}</div>
      <div>{text}</div>
      <button onClick={handleClick}>click</button>
    </div>
  );
};

const App = () => {
  return (
    <div id='app'>
      <BarCount />
    </div>
  );
};

export default App;
