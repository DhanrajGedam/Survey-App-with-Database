import React from 'react';
import ReactDOM from 'react-dom';
import Survey from './Survey'; // Assuming Survey.js is in the same directory

const App = () => {
  return (
    <div>
      <Survey />
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root')); // Assuming you have a div with id 'root' in your HTML
export default Survey;
