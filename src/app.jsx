import React from '../core/React.js';
import ReactDOM from '../core/ReactDOM.js';

let showBar = false;
const App = () => {
  const handleClick = () => {
    showBar = !showBar;
    ReactDOM.update();
  };

  const Bar = () => <div>bar</div>;
  // type不一致
  const foo = <div>foo</div>;

  return (
    <div id='app'>
      <div>{showBar ? <Bar /> : foo}</div>
      <button onClick={handleClick}>toggle</button>
    </div>
  );
};

export default App;
