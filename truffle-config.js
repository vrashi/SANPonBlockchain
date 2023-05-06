const HDWalletProvider = require('@truffle/hdwallet-provider');
const mnemonic = "worth connect success champion goddess holiday blush zoo hand bag venture dilemma"
const infuraProjectId = "0719195320cd44b79bf855dfa316c214"
module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  networks: {
    goerli: {
      provider: () => new HDWalletProvider(mnemonic, `https://goerli.infura.io/v3/${infuraProjectId}`),
      network_id: 5,
      chain_id: 5,
      gas: 5500000,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true
    },
    sepolia: {
      provider: () => new HDWalletProvider(mnemonic, 'https://sepolia.infura.io/v3/0719195320cd44b79bf855dfa316c214'),
      network_id: '11155111',
      gas: 5500000
    },
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*",
      gas: 4600000
    }
  },
  compilers: {
    solc: {
      version: "0.8.17",    // Fetch exact version from solc-bin (default: truffle's version)
      // docker: true,        // Use "0.5.1" you've installed locally with docker (default: false)
      // settings: {          // See the solidity docs for advice about optimization and evmVersion
      //  optimizer: {
      //    enabled: false,
      //    runs: 200
      //  },
      //  evmVersion: "byzantium"
      // }
    }
  },
};
