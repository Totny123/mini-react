import React from '../core/React.js';

const Counter = ({ num }) => {
  return <div>counter:{num}</div>;
};

const CounterWrapper = () => {
  return <Counter num={2} />;
};

const App = () => (
  <div id='app'>
    <div id='1'>
      hello
      <div id='2'>
        <div id='3'>
          <div id='4'>react</div>
        </div>
      </div>
    </div>
    <div id='5'>sibling</div>
    <CounterWrapper />
    <Counter num={33} />
  </div>
);

export default App;
