var web3js
var interval
var timer
var showTimer = true
var myTokens
var priceInterval

const node = 'https://bsc-dataseed.binance.org/'
const lpTokenAbiUrl = 'https://raw.githubusercontent.com/pancakeswap/pancake-frontend/develop/src/config/abi/lpToken.json'
var lpTokenAbi

const tokens = {
	'BNB': {
		'pair':'BUSD',
		'lpAddress':'0x1B96B92314C44b159149f7E0303511fB2Fc4774f',
		'mult':1
	},
	'CUB': {
		'pair':'BUSD',
		'lpAddress':'0x0EF564D4F8D6C0ffE13348A32e21EFd55e508e84',
		'mult':1
	},
	'EPS': {
		'pair':'BNB',
		'lpAddress':'0xf9045866e7b372DeF1EFf3712CE55FAc1A98dAF0',
		'mult':1
	},
	'DEC': {
		'pair':'BUSD',
		'lpAddress':'0x4c79edAb89848f34084283bb1FE8Eac2DcA649c3',
		'mult':10**-12
	},
	'bLEO': {
		'pair':'BNB',
		'lpAddress':'0x243E060DEcA0499fCaE6ABe548C0115faaBa0ed4',
		'mult':10**-15
	},
	'EGG': {
		'pair':'BUSD',
		'lpAddress':'0x19e7cbECDD23A16DfA5573dF54d98F7CaAE03019',
		'mult':-1
	},
	'CAKE': {
		'pair':'BUSD',
		'lpAddress':'0x0Ed8E0A2D99643e1e65CCA22Ed4424090B8B7458',
		'mult':1
	},
	'VAI': {
		'pair':'BUSD',
		'lpAddress':'0xfF17ff314925Dff772b71AbdFF2782bC913B3575',
		'mult':1
	},
	'DOT': {
		'pair':'BNB',
		'lpAddress':'0xbCD62661A6b1DEd703585d3aF7d7649Ef4dcDB5c',
		'mult':1
	},
	'ADA': {
		'pair':'BNB',
		'lpAddress':'0xBA51D1AB95756ca4eaB8737eCD450cd8F05384cF',
		'mult':1
	},
	'BUNNY': {
		'pair':'BNB',
		'lpAddress':'0x7Bb89460599Dbf32ee3Aa50798BBcEae2A5F7f6a',
		'mult':-1
	},
	'LINK': {
		'pair':'BNB',
		'lpAddress':'0xaeBE45E3a03B734c68e5557AE04BFC76917B4686',
		'mult':-1
	},
	'UNI': {
		'pair':'BNB',
		'lpAddress':'0x4269e7F43A63CEA1aD7707Be565a94a9189967E9',
		'mult':-1
	},
	'ALICE': {
		'pair':'BNB',
		'lpAddress':'0xe022baa3E5E87658f789c9132B10d7425Fd3a389',
		'mult':10**-12
	}
}

async function loadAbi(url) {
	const response = await fetch(url)
	return response.json()
}

function msToTime(t) {
	let ms = t % 1000;
	t = (t - ms) / 1000;
	let s = t % 60;
	t = (t - s) / 60;
	let m = t % 60;
	// let h = (t - m) / 60;
	return `0${m}`.slice(-2) + ':' + `0${s}`.slice(-2)// + ':' + `00${ms}`.slice(-3)
}

function timerFunc() {
	if (showTimer) {
		let dif = timer - Date.now()
		if (dif < 0) return
		document.getElementById('timer').innerHTML = msToTime(dif)
	}
}

function clickTimer() {
	const input = document.getElementById('timer-input')
	const value = parseInt(input.value)
	if (value) {
		interval = value
		clearInterval(priceInterval)
		priceTask()
		priceInterval = setInterval(priceTask, interval*1000)
		localStorage.setItem('interval', interval)
		input.value = ''
	} else {
		showTimer = !showTimer
		if (showTimer) timerFunc()
		else document.getElementById('timer').innerHTML = 'Timer'
	}
}

async function priceTask() {
	timer = Date.now() + interval*1000
	if (!myTokens) {
		document.title = 'Token Watcher'
		return
	}
	let calls = []
	let bnb = false
	for (const token of myTokens) {
		if (!bnb && tokens[token]['pair'] == 'BNB') bnb = true
		calls.push(tokens[token]['contract'].methods.getReserves().call())
	}
	if (bnb) calls.push(tokens['BNB']['contract'].methods.getReserves().call())
	const reserves = await Promise.all(calls)
	let bnbPrice
	if (bnb) {
		const r = reserves.pop()
		bnbPrice = parseInt(r['1']) / parseInt(r['0'])
	}
	let ss = []
	for (let i = 0; i < myTokens.length; i++) {
		let token = myTokens[i]
		let p
		const m = tokens[token]['mult']
		if (m == -1) {
			p = -m * parseInt(reserves[i]['0']) / parseInt(reserves[i]['1'])
		} else {
			p = m * parseInt(reserves[i]['1']) / parseInt(reserves[i]['0'])
		}
		if (tokens[token]['pair'] == 'BNB') {p *= bnbPrice}
		let prec
		if (p >= 1000) {prec = 0}
		else if (p >= 100) {prec = 1}
		else if (p >= 10) {prec = 2}
		else {prec = 3}
		const s = `${token}` + `\$${p.toFixed(prec)}`.padStart(12-token.length, '\u00A0')
		document.getElementById(`${token}-box`).innerHTML = s
		ss.push(`${token} \$${p.toFixed(prec)}`)
	}
	document.title = ss.join(' ')
}

function addTokenOption(token) {
	const option = document.createElement('option')
	option.setAttribute('id', `${token}-option`)
	option.value = token
	document.getElementById('tokenlist').appendChild(option)
}

function createTokenBox(token) {
	const d = document.createElement('div')
	d.setAttribute('class', 'tokenbox')
	d.setAttribute('id', `${token}-box`)
	d.addEventListener('contextmenu', tokenRClick)
	d.addEventListener('click', tokenClick)
	document.body.appendChild(d)
}

function addToken() {
	const input = document.getElementById('token-input')
	const token = input.value
	input.value = ''
	if (token in tokens) {
		myTokens.push(token)
		localStorage.setItem('myTokens', JSON.stringify(myTokens))
		document.getElementById(`${token}-option`).remove()
		if (!('contract' in tokens[token])) {
			tokens[token]['contract'] = new web3js.eth.Contract(lpTokenAbi, tokens[token]['lpAddress'])
		}
		createTokenBox(token)
		clearInterval(priceInterval)
		priceTask()
		priceInterval = setInterval(priceTask, interval*1000)
	}
}

function tokenClick() {
	let token = this.id.slice(0, this.id.length - 4)
	let index = myTokens.indexOf(token)
	if (index == 0) return
	let temp = myTokens[index]
	myTokens[index] = myTokens[index-1]
	myTokens[index-1] = temp
	localStorage.setItem('myTokens', JSON.stringify(myTokens))
	document.body.insertBefore(this, this.previousSibling)
}

function tokenRClick(event) {
	event.preventDefault()
	const token = this.id.slice(0, this.id.length - 4)
	const index = myTokens.indexOf(token)
	myTokens.splice(index, 1)
	localStorage.setItem('myTokens', JSON.stringify(myTokens))
	document.getElementById(`${token}-box`).remove()
	addTokenOption(token)
	return false
}

async function setup() {
	interval = parseInt(localStorage.getItem('interval') || '30')
	myTokens = JSON.parse(localStorage.getItem('myTokens') || '[]')
	for (const token of Object.keys(tokens)) {
		if (myTokens && myTokens.includes(token)) continue
		addTokenOption(token)
	}
	web3js = new Web3(new Web3.providers.HttpProvider(node))
	lpTokenAbi = await loadAbi(lpTokenAbiUrl)
	for (const token of myTokens) {
		createTokenBox(token)
		tokens[token]['contract'] = new web3js.eth.Contract(lpTokenAbi, tokens[token]['lpAddress'])
	}
	tokens['BNB']['contract'] = new web3js.eth.Contract(lpTokenAbi, tokens['BNB']['lpAddress'])
	document.getElementById('add-button').addEventListener('click', addToken)
	document.getElementById('timer').addEventListener('click', clickTimer)
	await priceTask()
	priceInterval = setInterval(priceTask, interval*1000)
	setInterval(timerFunc, 250)
}

window.addEventListener('load', setup)