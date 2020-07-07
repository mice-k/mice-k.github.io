var _id = 1

function hive_customJSON(params) {
	hive_keychain.requestCustomJson(
		params['username'],
		params['id'],
		params['auth'],
		params['json'],
		params['message'],
		function(response) {
			console.log('main js response - custom JSON');
			console.log(response)
		}
	)
}

function hive_broadcast(username, operations, key) {
	hive_keychain.requestBroadcast(
		username,
		operations,
		key,
		function(response) {
			console.log('main js response - broadcast')
			console.log(response)
		}
	)
}

async function heRPC(endpoint, method, params) {
	let url = `https://api.hive-engine.com/rpc/${endpoint}`
	j = {'jsonrpc':'2.0', 'id':_id, 'method':method, 'params':params}
	_id += 1
	const response = await fetch(url, {
		method: 'POST',
		headers: {'Content-Type': 'application/json'},
		body: JSON.stringify(j)
	})
	return response.json()
}

function heFind(contract, table, query, limit=1000, offset=0) {
	let params = {
		'contract':contract, 
		'table':table,
		'query':query,
		'limit':limit,
		'offset':offset,
		'indexes':[]
	}
	return heRPC('contracts', 'find', params)
}

function groupSales(cards) {
	const group = cards.reduce((h, obj) => Object.assign(h, { [obj.priceSymbol]:( h[obj.priceSymbol] || [] ).concat(obj.nftId.toString()) }), {})
	const size = 50
	let result = []
	for (const [symbol, arr] of Object.entries(group)) {
		for (var i = 0; i < arr.length; i += size) {
			result.push(arr.slice(i, i+size))
		}
	}
	return result
}

function groupCards(cards, size=50) {
	const arr = cards.map(a => a._id.toString())
	let result = []
	for (var i = 0; i < arr.length; i += size) {
		result.push(arr.slice(i, i+size))
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
	let ops = []
	let jj = []
	let len = 2
	for (var i = 0; i < groups.length; i++) {
		let j = {
			'contractName':'nftmarket',
			'contractAction':'cancel',
			'contractPayload': {
				'symbol':'CITY',
				'nfts':groups[i]
			}
		}
		let l = JSON.stringify(j).length + 1
		if (len + l < 8192) {
			jj.push(j)
			len += l
		} else {
			ops.push(['custom_json', makeEngineOp(jj, account)])
			if (ops.length > 4) {
				return ops
			}
			len = 2 + l
			jj = []
		}
	}
	if ((jj.length > 0) & (ops.length < 5)) {
		ops.push(['custom_json', makeEngineOp(jj, account)])
	}
	return ops
}

function getSellOps(groups, account, price, symbol) {
	let ops = []
	let jj = []
	let len = 2
	for (var i = 0; i < groups.length; i++) {
		let j = {
			'contractName': 'nftmarket',
			'contractAction': 'sell',
			'contractPayload': {
				'symbol':'CITY',
				'nfts':groups[i],
				'price':price,
				'priceSymbol':symbol,
				'fee':250
			}
		}
		let l = JSON.stringify(j).length + 1
		if (len + l < 8192) {
			jj.push(j)
			len += l
		} else {
			ops.push(['custom_json', makeEngineOp(jj, account)])
			if (ops.length > 4) {
				return ops
			}
			len = 2 + l
			jj = []
		}
	}
	if ((jj.length > 0) & (ops.length < 5)) {
		ops.push(['custom_json', makeEngineOp(jj, account)])
	}
	return ops
}

function getTransferOps(groups, sender, receiver) {
	let ops = []
	let jj = []
	let len = 2
	for (var i = 0; i < groups.length; i++) {
		let j = {
			'contractName': 'nft',
			'contractAction': 'transfer',
			'contractPayload': {
				'to':receiver,
				'nfts':[{'symbol':'CITY','ids':groups[i]}]
			}
		}
		let l = JSON.stringify(j).length + 1
		if (len + l < 8192) {
			jj.push(j)
			len += l
		} else {
			ops.push(['custom_json', makeEngineOp(jj, sender)])
			if (ops.length > 4) {
				return ops
			}
			len = 2 + l
			jj = []
		}
	}
	if ((jj.length > 0) & (ops.length < 5)) {
		ops.push(['custom_json', makeEngineOp(jj, sender)])
	}
	return ops
}

function displayOps(ops) {
	let p = document.createElement('pre')
	p.style.wordWrap = 'break-word'
	p.style.whiteSpace = 'pre-wrap'
	p.innerHTML = JSON.stringify(ops, null, '  ').replace(/\\/g, '')
	document.body.appendChild(p)
}

function cancel(urlParams) {
	const account = urlParams.get('account')
	const card = urlParams.get('card')
	if (card) {
		query = {'account':account, 'grouping.name':card}
	} else {
		query = {'account':account}
	}
	const promise = heFind('nftmarket', 'CITYsellBook', query)
	promise.then(function(result) {
		const cards = result['result']
		const groups = groupSales(cards)
		const ops = getCancelOps(groups, account)
		displayOps(ops)
		hive_broadcast(account, ops, 'Active')
	})
}

function sell(urlParams) {
	const account = urlParams.get('account')
	const card = urlParams.get('card')
	const count = parseInt(urlParams.get('count'))
	const price = urlParams.get('price')
	const symbol = urlParams.get('symbol')
	query = {'account':account, 'properties.name':card}
	const promise = heFind('nft', 'CITYinstances', query)
	promise.then(function(result) {
		const cards = result['result'].reverse().slice(0, count)
		const groups = groupCards(cards)
		const ops = getSellOps(groups, account, price, symbol)
		displayOps(ops)
		hive_broadcast(account, ops, 'Active')
	})
}

function transfer(urlParams) {
	const sender = urlParams.get('sender')
	const receiver = urlParams.get('receiver')
	const count = parseInt(urlParams.get('count'))
	const card = urlParams.get('card')
	if (card) {
		query = {'account':sender, 'properties.name':card}
	} else {
		query = {'account':sender}
	}
	const promise = heFind('nft', 'CITYinstances', query)
	promise.then(function(result) {
		const cards = result['result'].reverse().slice(0, count)
		const groups = groupCards(cards)
		const ops = getTransferOps(groups, sender, receiver)
		displayOps(ops)
		hive_broadcast(sender, ops, 'Active')
	})
}

function vote(urlParams) {
	const params = {
		'username':urlParams.get('account'),
		'id':'dcity',
		'auth':'active',
		'json':JSON.stringify({'action':'gov_vote','data':'cityhelper'}),
		'message':'Vote for CityHelper :)'
	}
	hive_customJSON(params)
}

window.addEventListener('load', function () {
	if (window.hive_keychain) {
		keychains_ready()
	} else {
		var keychain_check = setInterval(function(){
			if (window.hive_keychain) {
				clearInterval(keychain_check)
				keychains_ready()
			}
		}, 250)
	}
})

function keychains_ready() {
	const urlParams = new URLSearchParams(window.location.search);
	const command = urlParams.get('command');
	if (command === 'transfer') {
		transfer(urlParams)
	} else if (command === 'sell') {
		sell(urlParams)
	} else if (command === 'cancel') {
		cancel(urlParams)
	} else if (command === 'vote') {
		vote(urlParams)
	}
}