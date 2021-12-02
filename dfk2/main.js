function enable() {
	if (ethereum.selectedAddress) {
		document.getElementById('connect-button').disabled = true
		document.getElementById('disapprove-button').disabled = false
		document.getElementById('approve-button').disabled = false
		document.getElementById('address-label').innerHTML = ethereum.selectedAddress
	}
}

async function connect() {
	await ethereum.request({method: 'eth_requestAccounts'});
	enable()
}

async function approve() {
	const transactionParameters = {
	  gasPrice: '0x3b9aca00',
	  to: '0x5F753dcDf9b1AD9AabC1346614D1f4746fd6Ce5C',
	  from: ethereum.selectedAddress,
	  value: '0x0',
	  data: '0xa22cb465000000000000000000000000f81ddcbbc5b443b507c6acd07b0cd887b956ed5d0000000000000000000000000000000000000000000000000000000000000001',
	  chainId: '0x63564c40'
	}
	const txHash = await ethereum.request({
	  method: 'eth_sendTransaction',
	  params: [transactionParameters],
	})
	console.log(txHash)
}

async function disapprove() {
	const transactionParameters = {
	  gasPrice: '0x3b9aca00',
	  to: '0x5F753dcDf9b1AD9AabC1346614D1f4746fd6Ce5C',
	  from: ethereum.selectedAddress,
	  value: '0x0',
	  data: '0xa22cb465000000000000000000000000f81ddcbbc5b443b507c6acd07b0cd887b956ed5d0000000000000000000000000000000000000000000000000000000000000000',
	  chainId: '0x63564c40'
	}
	const txHash = await ethereum.request({
	  method: 'eth_sendTransaction',
	  params: [transactionParameters],
	})
	console.log(txHash)
}

window.addEventListener('load', function () {
	enable()
	document.getElementById('connect-button').onclick = connect
	document.getElementById('approve-button').onclick = approve
	document.getElementById('disapprove-button').onclick = disapprove
	console.log(ethereum.selectedAddress)
})