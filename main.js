function customJSON(urlParams) {
	steem_keychain.requestCustomJson(
		urlParams.get('username'),
		urlParams.get('id'),
		urlParams.get('auth'),
		urlParams.get('json'),
		urlParams.get('message'),
		function(response) {
			console.log('main js response - custom JSON');
			console.log(response);
		}
	);
};

function sendTokens(urlParams) {
	steem_keychain.requestSendToken(
		urlParams.get('username'),
		urlParams.get('sendTo'),
		urlParams.get('amount'),
		urlParams.get('memo'),
		urlParams.get('symbol'),
		function(response) {
			console.log("main js response - tokens");
			console.log(response);
		}
	);
};

function transfer(urlParams) {
	steem_keychain.requestTransfer(
		urlParams.get('username'),
		urlParams.get('sendTo'),
		urlParams.get('amount'),
		urlParams.get('memo'),
		urlParams.get('symbol'),
		function(response) {
			console.log("main js response - transfer");
			console.log(response);
		},
		!(urlParams.get('enforce') === 'false')
	);
};

window.addEventListener('load', function () {
	const urlParams = new URLSearchParams(window.location.search);
	const type = urlParams.get('type');
	console.log(type);
	if (type === 'customJSON') {
		customJSON(urlParams);
	} else if (type === 'transfer') {
		transfer(urlParams);
	} else if (type === 'sendTokens') {
		sendTokens(urlParams);
	};
});