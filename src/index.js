/* global document */
import React from 'react';
import ReactDOM from 'react-dom';

import App from './App';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<App debug/>, document.getElementById('root'));
registerServiceWorker();
