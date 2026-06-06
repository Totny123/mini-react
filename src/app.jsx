import React from '../core/React.js';
import ReactDOM from '../core/ReactDOM.js';

const Bar = () => {
  console.log('Bar run');

  const [text, setText] = ReactDOM.useState('bar');
  const handleClick = () => {
    setText('bar');
  };

  const handleRerunClick = () => {
    setText('123');
    setText('bar');
  };

  return (
    <div>
      <div>{text}</div>
      <button onClick={handleClick}>click</button>
      <button onClick={handleRerunClick}>rerun</button>
    </div>
  );
};

const App = () => {
  return (
    <div id='app'>
      <Bar />
    </div>
  );
};

export default App;
