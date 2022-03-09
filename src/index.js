require('dotenv').config()
const Web3 = require('web3')
const HDWalletProvider = require('@truffle/hdwallet-provider')
const autoTopUpABI = require('./abi/registry.json').abi
const accounts = require('./accounts.json')

const HTTP_RPC = process.env.HTTP_RPC
const PRIVATE_KEY = process.env.PRIVATE_KEY
const TOPUP_ADDRESS = process.env.TOPUP_ADDRESS

const provider = new HDWalletProvider(PRIVATE_KEY, HTTP_RPC)
const web3 = new Web3(provider)
const autoTopUp = new web3.eth.Contract(autoTopUpABI, TOPUP_ADDRESS)

const getUnderlyingTokenABI = [
	{
		inputs: [],
		outputs: [{ name: '', type: 'address' }],
		name: 'getUnderlyingToken',
		stateMutability: 'view',
		type: 'function'
	}
]

async function getUnderlyingToken(superTokenAddress) {
	const superTokenContract = new web3.eth.Contract(
		getUnderlyingTokenABI,
		superTokenAddress
	)
	return await superTokenContract.methods.getUnderlyingToken().call()
}

function getTopUpIndex(account, superToken, underlyingToken) {
	return web3.utils.sha3(
		web3.eth.abi.encodeParameters(
			['address', 'address', 'address'],
			[account, superToken, underlyingToken]
		)
	)
}

async function performTopUp(index) {
	return await autoTopUp.methods.performTopUp(index).send()
}

async function canTopUp(index) {
	return (await autoTopUp.methods.checkTopUp(index).call())[0]
}

async function topUp({ account, superToken }) {
	const underlyingToken = await getUnderlyingToken(superToken)
	const index = getTopUpIndex(account, superToken, underlyingToken)
	if (await canTopUp(index)) {
		performTopUp(index).on('receipt', console.log).on('error', console.error)
	} else {
		console.log(`Account ${account}: Skipping top up.`)
	}
}

// interface Account {
// 	account: string
// 	token: string
// }
// type Accounts = Array<Account>

async function main() {
	for (const account of accounts) {
		await topUp(account)
	}
}

main()
	.then(() => process.exit(0))
	.catch(console.error)
