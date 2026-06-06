import React from '../core/React.js';
import ReactDOM from '../core/ReactDOM.js';

const Bar = () => {
  console.log('Bar run');

  const [count, setCount] = ReactDOM.useState(1);
  const handleClick = () => {
    setCount(count + 1);
  };

  ReactDOM.useEffect(() => {
    console.log('Bar init');
    return () => {
      console.log('Bar unmount');
    };
  }, []);

  ReactDOM.useEffect(() => {
    console.log('new count', count);
    return () => {
      console.log('prev count', count);
    };
  }, [count]);

  return (
    <div>
      <div>{count}</div>
      <button onClick={handleClick}>click</button>
    </div>
  );
};

const App = () => {
  const [showBar, setShowBar] = ReactDOM.useState(true);

  return (
    <div id='app'>
      {showBar && <Bar />}
      <div>
        <button
          onClick={() => {
            setShowBar(!showBar);
          }}
        >
          showBar
        </button>
      </div>
    </div>
  );
};

export default App;
