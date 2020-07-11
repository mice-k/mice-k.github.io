var _id = 1
var _main, _alt

function calculate(_city) {
	city = JSON.parse(JSON.stringify(_city))
	city.sort((a, b) => parseInt(a._id) - parseInt(b._id))
	let population = 0
	let popularity = 0
	let income = 0
	let education = 0
	let creativity = 0
	let garbage = 0
	let social_aid = 0
	let training = 0
	let unique = new Set()
	let tech = new Set()
	for (const b of city) {
		if (b['properties']['type'] === 'tech') {
			tech[b['properties']['name']] = true
		}
	}
	for (let b of city) {
		p = b['properties']
		name = p['name']
		unique.add(name)
		if (p['population']) {population += p['population']}
		if (p['popularity']) {popularity += p['popularity']}
		if (! p['workers']) {
			if (p['education']) {education += parseInt(p['education'])}
			if (p['creativity']) {creativity += parseInt(p['creativity'])}
			if (p['income']) {income += p['income']}
		}
		if (name === 'Garbage Dump') {
			garbage += 30
			if ('Advanced Recycling' in tech) {
				p['income'] += 15
			}
		} else if (name === 'Social Aid Office') {
			social_aid += 100
		} else if (name === 'Homeless' || name === 'Immigrants') {
			training += 0.01
		} else if (name === 'Job Center') {
			training += 3
			// if (jobs_tax) {training += 3}
		} else if (name === 'Wind Turbine') {
			// if (eco_tax) {p['income'] += 1}
			if ('ECO Energy' in tech) {p['income'] += 2}
		} else if (name === 'Solar Plant') {
			// if (eco_tax) {p['income'] += 2}
			if ('ECO Energy' in tech) {p['income'] += 2}
			if ('Dyson Sphere' in tech) {p['income'] += 8}
		} else if (name === 'Farm' && 'GMO Farming' in tech) {
			p['income'] += 4
			popularity -= 3
		} else if (name === 'Nuclear Plant' && 'Cold Fusion' in tech) {
			popularity += 15
		} else if (name === 'Factory') {
			if ('Basic Automation' in tech) {p['income'] += 3}
			if ('Advanced Robotics' in tech) {p['workers'] = 2}
			if ('AI Technology' in tech) {p['workers'] = p['workers'] / 2}
		} else if (name === 'University' && 'Free Education' in tech) {
			p['education'] = 20
		}
	}
	training = Math.min(100, Math.round(training))
	if (unique.size > 25) {
		popularity += garbage + garbage
	}
	if (popularity > 0) {
		population += Math.round(population * (popularity**0.7) / 100)
	} else {
		training = 0
	}
	if ('Hospital' in unique) {
		population = Math.round(population * 1.01)
	}
	// TODO: check for maxed tech
	work = 0
	for (const b of city) {
		p = b['properties']
		if (p['workers']) {
			work += p['workers']
			if (work > population) {continue}
			if (p['income']) {income += p['income']}
			if (p['creativity']) {creativity += parseInt(p['creativity'])}
			if (p['education']) {education += parseInt(p['education'])}
		}
	}
	// if ('Law Firm' in unique) {
		// tax -= tax * 0.1
	// }
	unemployment = population - work
	social_support = 0
	if (unemployment > 0) {
		social_support = Math.round(Math.max(0, (unemployment * 0.2) - social_aid))
		income = income - social_support
	}
	
	// if (taxes[2] === 5):
		// education += Math.round(education / 10)
	// if (taxes[3] === 5):
		// creativity += Math.round(creativity / 10)
	if ('Free Internet Connection' in tech) {
		education += Math.round(education / 20)
	}
	if ('Open Source' in tech) {
		education += Math.round(education / 10)
	}
	if ('Art Gallery' in unique) {
		income += Math.round(creativity / 100)
	}
	if ('Mining Operation - BTC' in tech) {
		income += Math.round(income * 0.06)
	} else if ('Mining Operation - ETH' in tech) {
		income += Math.round(income * 0.04)
	} else if ('Mining Operation - HIVE' in tech) {
		income += Math.round(income * 0.02)
	}
	// income -= Math.round(income * tax / 100)
	return {
		'cards':_city,
		'population':population,
		'income':income,
		'popularity':popularity,
		'unique':unique,
		'unemployment':unemployment,
		'social_support':social_support,
		'education':education,
		'creativity':creativity,
		'training':training
	}
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
	result = response.json()
	return result
}

async function heFind(contract, table, query, limit=5000, offset=0, all=[]) {
	let jobs = []
	for (let i = 0; i < limit/1000; i++) {
		let params = {
			'contract':contract, 
			'table':table,
			'query':query,
			'limit':1000,
			'offset':offset + (i * 1000),
			'indexes':[]
		}
		jobs.push(params)
	}
	let promises = jobs.map((p) => heRPC('contracts', 'find', p))
	let results = await Promise.all(promises)
	let newData = []
	for (const result of results) {
		newData = newData.concat(await result['result'])
	}
	all = all.concat(newData)
	return (newData.length === limit) ? await heFind(contract, table, query, limit, offset+limit, all) : all
}

async function loadCity(name) {
	if (name) {
		query = {'account':name}
		cards = await heFind('nft', 'CITYinstances', query)
		return calculate(cards)
	}
}

function loadMain() {
	document.getElementById('main_load').innerHTML = 'Loading..'
	loadCity(document.getElementById('main').value).then(function(result) {
		_main = result
		document.getElementById('main_load').innerHTML = '&#10004'
	})
}

function loadAlt() {
	document.getElementById('alt_load').innerHTML = 'Loading..'
	loadCity(document.getElementById('alt').value).then(function(result) {
		_main = result
		document.getElementById('alt_load').innerHTML = '&#10004'
	})
}

function setup() {
	document.getElementById('main').addEventListener('keyup', function(e) {if (e.key === 'Enter') {loadMain()}})
	document.getElementById('alt').addEventListener('keyup', function(e) {if (e.key === 'Enter') {loadAlt()}})
}

window.addEventListener('load', function() {
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
	setup()
}