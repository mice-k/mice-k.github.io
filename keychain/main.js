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

function hive_customJSON(urlParams) {
	hive_keychain.requestCustomJson(
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

function hive_sendTokens(urlParams) {
	hive_keychain.requestSendToken(
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

function hive_transfer(urlParams) {
	hive_keychain.requestTransfer(
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
	if (window.hive_keychain || window.steem_keychain) {
		keychains_ready();
	} else {
		var keychain_check = setInterval(function(){
			if (window.hive_keychain || window.steem_keychain) {
				clearInterval(keychain_check);
				keychains_ready();
			}
		}, 250);
	}
});

function keychains_ready() {
	const urlParams = new URLSearchParams(window.location.search);
	const chain = urlParams.get('chain');
	if (chain === 'steem') {
		const type = urlParams.get('type');
		console.log(type);
		if (type === 'customJSON') {
			customJSON(urlParams);
		} else if (type === 'transfer') {
			transfer(urlParams);
		} else if (type === 'sendTokens') {
			sendTokens(urlParams);
		}
	} else if (chain === 'hive') {
		const type = urlParams.get('type');
		console.log(type);
		if (type === 'customJSON') {
			hive_customJSON(urlParams);
		} else if (type === 'transfer') {
			hive_transfer(urlParams);
		} else if (type === 'sendTokens') {
			hive_sendTokens(urlParams);
		}
	}
}