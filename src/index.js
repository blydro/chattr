/* global document */
import React from 'react';
import ReactDOM from 'react-dom';

import App from './App';
// NO import registerServiceWorker from './registerServiceWorker';

import urlB64ToUint8Array from './helpers';

ReactDOM.render(<App debug={false}/>, document.getElementById('root'));
// NO registerServiceWorker();

// Service Worker Helper stuff
// From https://developers.google.com/web/fundamentals/codelabs/push-notifications/
const applicationServerPublicKey = 'BHvaHNKBtoPaL9TDXPoq_ajrtsD7mb_WS5waGFrar6J3_l7PyP6M99flKdtFSa0uhp6YvhUzHvaArvvtlTxk8wM';

let isSubscribed = false;
let swRegistration = null;

// Register service worker for push notifcations
// From https://developers.google.com/web/fundamentals/codelabs/push-notifications/
if ('serviceWorker' in navigator && 'PushManager' in window) {
	console.log('Service Worker and Push is supported');

	navigator.serviceWorker.register('sw.js')
	.then(swReg => {
		console.log('Service Worker is registered', swReg);

		swRegistration = swReg;
		subscribeUser();
	})
	.catch(error => {
		console.error('Service Worker Error', error);
	});
} else {
	console.warn('Push messaging is not supported');
}

function subscribeUser() {
	const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
	swRegistration.pushManager.subscribe({
		userVisibleOnly: true,
		applicationServerKey
	})
  .then(subscription => {
	console.log('User is subscribed.');

// Update subscrition on server

	console.log(JSON.stringify(subscription));
	isSubscribed = true;
})
  .catch(err => {
	console.log('Failed to subscribe the user: ', err);
});
}
