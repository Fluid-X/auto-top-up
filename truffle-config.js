module.exports = {
	networks: {
		ganache: {
			host: '127.0.0.1',
			network_id: '*',
			port: 8545
		}
	},
	mocha: {
		timeout: 100000
	}
	// Configure your compilers
	// compilers: {
	// 	solc: {
	// 		version: "^0.8.0"
	// 	}
	// }
}
