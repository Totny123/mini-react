import React from '../core/React.js';
import ReactDOM from '../core/ReactDOM.js';

const Bar = () => {
  console.log('Bar run');

  const [count, setCount] = ReactDOM.useState(1);
  const [count2, setCount2] = ReactDOM.useState(1);
  const handleClick = () => {
    setCount(count + 1);
  };

  const handleClick2 = () => {
    setCount2(count2 + 1);
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

  ReactDOM.useEffect(() => {
    console.log('new count2', count2);
    return () => {
      console.log('prev count2', count2);
    };
  }, [count2]);

  return (
    <div>
      <div>
        <div>{count}</div>
        <button onClick={handleClick}>update count1</button>
      </div>
      <div>
        <div>{count2}</div>
        <button onClick={handleClick2}>update count2</button>
      </div>
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
