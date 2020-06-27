var _id = 1

function hive_broadcast(username, operations, key) {
	hive_keychain.requestBroadcast(
		username,
		operations,
		key,
		function(response) {
			console.log('main js response - broadcast');
			console.log(response);
		}
	);
}

async function heRPC(endpoint, method, params) {
	let url = `https://api.hive-engine.com/rpc/${endpoint}`;
	j = {'jsonrpc':'2.0', 'id':_id, 'method':method, 'params':params}
	_id += 1
	const response = await fetch(url, {
		method: 'POST',
		headers: {'Content-Type': 'application/json'},
		body: JSON.stringify(j)
	});
	return response.json();
}

function heFind(contract, table, query, limit=1000, offset=0) {
	let params = {
		'contract':contract, 
		'table':table,
		'query':query,
		'limit':limit,
		'offset':offset,
		'indexes':[]
	};
	return heRPC('contracts', 'find', params);
}

function groupCards(cards) {
	let group = cards.reduce((h, obj) => Object.assign(h, { [obj.priceSymbol]:( h[obj.priceSymbol] || [] ).concat(obj.nftId.toString()) }), {})
	const size = 50
	var result = [];
	for (const [symbol, arr] of Object.entries(group)) {
		for (var i = 0; i < arr.length; i += size) {
			result.push(arr.slice(i, i+size))
		}
	}
	return result
}

function makeEngineOp(jdata, account) {
	return {
		'id':'ssc-mainnet-hive',
		'json':JSON.stringify(jdata),
		'required_auths':[account],
		'required_posting_auths':[]
	}
}

function getCancelOps(groups, account) {
	let ops = [];
	let jj = [];
	let len = 2
	for (var i = 0; i < groups.length; i++) {
		let j = {
			'contractName': 'nftmarket',
			'contractAction': 'cancel',
			'contractPayload': {
				'symbol': 'CITY',
				'nfts': groups[i]
			}
		}
		let l = JSON.stringify(j).length + 1
		if (len + l < 8192) {
			jj.push(j)
			len += l
		} else {
			ops.push(['custom_json', makeEngineOp(jj, account)])
			len = 2 + l
			jj = [];
		}
	}
	if (jj.length > 0) {
		ops.push(['custom_json', makeEngineOp(jj, account)])
	}
	return ops
}

function cancel(urlParams) {
	let account = urlParams.get('account')
	query = {'account':account};
	let promise = heFind('nftmarket', 'CITYsellBook', query);
	promise.then(function(result) {
		let cards = result['result'];
		let groups = groupCards(cards);
		let ops = getCancelOps(groups, account)
		hive_broadcast(account, ops, 'Active')
	});
}

window.addEventListener('load', function () {
	if (window.hive_keychain) {
		keychains_ready();
	} else {
		var keychain_check = setInterval(function(){
			if (window.hive_keychain) {
				clearInterval(keychain_check);
				keychains_ready();
			}
		}, 250);
	}
});

function keychains_ready() {
	const urlParams = new URLSearchParams(window.location.search);
	const command = urlParams.get('command');
	if (command === 'transfer') {
		
	} else if (command === 'sell') {
		
	} else if (command === 'cancel') {
		cancel(urlParams);
	}
}