var _id = 1

function hive_customJSON(params) {
	hive_keychain.requestCustomJson(
		params['username'],
		params['id'],
		params['auth'],
		params['json'],
		params['message'],
		function(response) {
			console.log('main js response - custom JSON')
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

async function heFind(contract, table, query, limit=1000, offset=0, all=[]) {
	let params = {
		'contract':contract, 
		'table':table,
		'query':query,
		'limit':limit,
		'offset':offset,
		'indexes':[]
	}
	result = await heRPC('contracts', 'find', params)
	newData = result['result']
	all = all.concat(newData)
	return (newData.length === limit) ? await heFind(contract, table, query, limit, offset+limit, all) : all
}

async function heBalance(account, symbol) {
	const query = {
		'account':account,
		'symbol':symbol
	}
	const params = {
		'contract':'tokens',
		'table':'balances',
		'query':query,
		'limit':1,
		'offset':0,
		'indexes':[]
	}
	result = await heRPC('contracts', 'find', params)
	if (result['result']) {return parseFloat(result['result'][0]['balance'])}
	return 0
}

function groupSales(cards) {
	const group = cards.reduce((h, obj) => Object.assign(h, { [obj.priceSymbol]:( h[obj.priceSymbol] || [] ).concat(obj.nftId.toString()) }), {})
	const size = 50
	let result = []
	for (const [symbol, arr] of Object.entries(group)) {
		for (let i = 0; i < arr.length; i += size) {
			result.push(arr.slice(i, i+size))
		}
	}
	return result
}

function groupBuys(cards, size=50) {
	const arr = cards.map(a => a.nftId.toString())
	let result = []
	for (let i = 0; i < arr.length; i += size) {
		result.push(arr.slice(i, i+size))
	}
	return result
}

function groupCards(cards, size=50) {
	const arr = cards.map(a => a._id.toString())
	let result = []
	for (let i = 0; i < arr.length; i += size) {
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

function getBuyOps(groups, account) {
	let ops = []
	let jj = []
	let len = 2
	for (let i = 0; i < groups.length; i++) {
		let j = {
			'contractName':'nftmarket',
			'contractAction':'buy',
			'contractPayload':{
				'symbol':'CITY',
				'nfts':groups[i],
				'marketAccount':'cityhelper'
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

function getChangeOps(groups, account, price) {
	let ops = []
	let jj = []
	let len = 2
	for (let i = 0; i < groups.length; i++) {
		let j = {
			'contractName':'nftmarket',
			'contractAction':'changePrice',
			'contractPayload': {
				'symbol':'CITY',
				'nfts':groups[i],
				'price':price
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

function getCancelOps(groups, account) {
	let ops = []
	let jj = []
	let len = 2
	for (let i = 0; i < groups.length; i++) {
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
	for (let i = 0; i < groups.length; i++) {
		let j = {
			'contractName': 'nftmarket',
			'contractAction': 'sell',
			'contractPayload': {
				'symbol':'CITY',
				'nfts':groups[i],
				'price':price,
				'priceSymbol':symbol,
				'fee':500
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
	for (let i = 0; i < groups.length; i++) {
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

function display(text) {
	let p = document.createElement('pre')
	p.style.wordWrap = 'break-word'
	p.style.whiteSpace = 'pre-wrap'
	p.innerHTML = text
	document.body.appendChild(p)
}

function displayOps(ops) {
	display(JSON.stringify(ops, null, '  ').replace(/\\/g, ''))
}

function buySortFunc(a, b) {
	const p1 = parseFloat(a['price'])
	const p2 = parseFloat(b['price'])
	if (p1 < p2) {return -1}
	if (p1 > p2) {return 1}
	if (a['nftId'] < a['nftId']) {return -1}
	if (a['nftId'] > a['nftId']) {return 1}
}

function filterBuys(cards, price, count, balance) {
	let result = []
	let total = 0
	for (const card of cards) {
		const p = parseFloat(card['price'])
		if (p <= price) {
			let temp = Math.round((total + p + Number.EPSILON) * 100000000) / 100000000
			if (temp <= balance) {
				result.push(card)
				total = temp
			} else {break}
		} else {break}
		if (result.length === count) {return [result, total]}
	}
	return [result, total]
}

async function buy(urlParams) {
	const account = urlParams.get('account')
	const card = urlParams.get('card')
	const symbol = urlParams.get('symbol')
	const price = parseFloat(urlParams.get('price'))
	const count = parseInt(urlParams.get('count'))
	const query = {'grouping.name':card, 'priceSymbol':symbol}
	let [balance, cards] = await Promise.all([
		heBalance(account, symbol),
		heFind('nftmarket', 'CITYsellBook', query)
	])
	cards.sort(buySortFunc)
	const [buys, total] = filterBuys(cards, price, count, balance)
	const groups = groupBuys(buys)
	const ops = getBuyOps(groups, account)
	display(`Buying ${buys.length} ${card} for ${total} ${symbol} total`)
	displayOps(ops)
	hive_broadcast(account, ops, 'Active')
}

async function change(urlParams) {
	const account = urlParams.get('account')
	const card = urlParams.get('card')
	const price = urlParams.get('price')
	const symbol = urlParams.get('symbol')
	const query = {'account':account, 'priceSymbol':symbol, 'grouping.name':card}
	let cards = await heFind('nftmarket', 'CITYsellBook', query)
	const groups = groupSales(cards)
	const ops = getChangeOps(groups, account, price)
	display(`Changing price of ${cards.length} ${card} to ${price} ${symbol}`)
	displayOps(ops)
	hive_broadcast(account, ops, 'Active')
}

async function cancel(urlParams) {
	const account = urlParams.get('account')
	const card = urlParams.get('card')
	if (card) {
		const query = {'account':account, 'grouping.name':card}
	} else {
		const query = {'account':account}
	}
	let cards = await heFind('nftmarket', 'CITYsellBook', query)
	const groups = groupSales(cards)
	const ops = getCancelOps(groups, account)
	display(`Cancelling ${cards.length} sales`)
	displayOps(ops)
	hive_broadcast(account, ops, 'Active')
}

async function sell(urlParams) {
	const account = urlParams.get('account')
	const card = urlParams.get('card')
	const count = parseInt(urlParams.get('count'))
	const price = urlParams.get('price')
	const symbol = urlParams.get('symbol')
	const query = {'account':account, 'properties.name':card}
	let result = await heFind('nft', 'CITYinstances', query)
	const cards = result.reverse().slice(0, count)
	const groups = groupCards(cards)
	const ops = getSellOps(groups, account, price, symbol)
	display(`Selling ${cards.length} ${card} for ${price} ${symbol} each`)
	displayOps(ops)
	hive_broadcast(account, ops, 'Active')
}

async function transfer(urlParams) {
	const sender = urlParams.get('sender')
	const receiver = urlParams.get('receiver')
	const count = parseInt(urlParams.get('count'))
	const card = urlParams.get('card')
	if (card) {
		query = {'account':sender, 'properties.name':card}
	} else {
		query = {'account':sender}
	}
	let result = await heFind('nft', 'CITYinstances', query)
	const cards = result.reverse().slice(0, count)
	const groups = groupCards(cards)
	const ops = getTransferOps(groups, sender, receiver)
	if (card) {
		display(`Sending ${cards.length} ${card} to ${receiver}`)
	} else {
		display(`Sending ${cards.length} cards to ${receiver}`)
	}
	displayOps(ops)
	hive_broadcast(sender, ops, 'Active')
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
	const urlParams = new URLSearchParams(window.location.search)
	const command = urlParams.get('command')
	if (command === 'transfer') {
		transfer(urlParams)
	} else if (command === 'sell') {
		sell(urlParams)
	} else if (command === 'change') {
		change(urlParams)
	} else if (command === 'cancel') {
		cancel(urlParams)
	} else if (command === 'buy') {
		buy(urlParams)
	} else if (command === 'vote') {
		vote(urlParams)
	}
}