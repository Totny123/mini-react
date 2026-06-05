import React from '../core/React.js';
import ReactDOM from '../core/ReactDOM.js';

let showFoo = false;
const App = () => {
  const foo = <span>foo</span>;
  const case1 = <div>A{showFoo && foo}B</div>;
  const case2 = <div>{showFoo && foo}B</div>;
  const case3 = <div>A{showFoo && foo}</div>;

  const handleClick = () => {
    showFoo = !showFoo;
    ReactDOM.update();
  };

  return (
    <div id='app'>
      {case1}
      {case2}
      {case3}
      <button onClick={handleClick}>toggle</button>
    </div>
  );
};

export default App;
