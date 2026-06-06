import React from '../core/React.js';
import ReactDOM from '../core/ReactDOM.js';

const Bar = () => {
  console.log('Bar run');

  const [count, setCount] = ReactDOM.useState(1);
  const handleClick = () => {
    setCount(count + 1);
  };

  ReactDOM.useEffect(() => {
    console.log('init');
  }, []);

  ReactDOM.useEffect(() => {
    console.log('update', count);
  }, [count]);

  return (
    <div>
      <div>{count}</div>
      <button onClick={handleClick}>click</button>
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
