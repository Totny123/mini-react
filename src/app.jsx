import React from '../core/React.js';
import ReactDOM from '../core/ReactDOM.js';

let barCount = 0;
let fooCount = 0;
let appCount = 0;

const BarCount = () => {
  console.log('BarCount Run');
  const update = ReactDOM.update();
  const handleClick = () => {
    barCount += 1;
    update();
  };

  return (
    <div>
      <div>Bar</div>
      <div>{barCount}</div>
      <button onClick={handleClick}>+1</button>
    </div>
  );
};

const FooCount = () => {
  console.log('FooCount Run');
  const update = ReactDOM.update();
  const handleClick = () => {
    fooCount += 1;
    update();
  };

  return (
    <div>
      <div>Foo</div>
      <div>{fooCount}</div>
      <button onClick={handleClick}>+1</button>
    </div>
  );
};

const App = () => {
  console.log('App Run');
  const update = ReactDOM.update();
  const handleClick = () => {
    appCount += 1;
    update();
  };

  return (
    <div id='app'>
      <div>
        <div>App</div>
        <div>{appCount}</div>
        <button onClick={handleClick}>+1</button>
      </div>
      <hr />
      <BarCount />
      <hr />
      <FooCount />
    </div>
  );
};

export default App;
