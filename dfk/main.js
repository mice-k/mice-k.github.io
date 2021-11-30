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
	  data: '0xa22cb4650000000000000000000000003a3a5872dbefaa47c5097c40e6349dc527294cc60000000000000000000000000000000000000000000000000000000000000001',
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
	  data: '0xa22cb4650000000000000000000000003a3a5872dbefaa47c5097c40e6349dc527294cc60000000000000000000000000000000000000000000000000000000000000000',
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