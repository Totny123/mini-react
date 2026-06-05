import React from '../core/React.js';
import ReactDOM from '../core/ReactDOM.js';

let showBar = true;
const App = () => {
  const handleClick = () => {
    showBar = !showBar;
    ReactDOM.update();
  };

  const bar = (
    <div>
      bar
      {/* 以下是多出来的节点 */}
      <div>bar title</div>
      <div>bar content</div>
      <div>bar footer</div>
    </div>
  );
  const foo = <div>foo</div>;

  return (
    <div id='app'>
      <div>{showBar ? bar : foo}</div>
      <button onClick={handleClick}>toggle</button>
    </div>
  );
};

export default App;
