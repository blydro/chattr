/* global document */
import React from 'react';
import ReactDOM from 'react-dom';

import App from './App';
import registerServiceWorker, {showNotification} from './registerServiceWorker';

ReactDOM.render(<App debug={false} showNotification={showNotification}/>, document.getElementById('root'));
registerServiceWorker();
