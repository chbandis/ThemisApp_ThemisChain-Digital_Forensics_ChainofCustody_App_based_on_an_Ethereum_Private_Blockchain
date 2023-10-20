require("dotenv").config({path: "./.env"});
const HDWalletProvider = require('@truffle/hdwallet-provider');
const accountIndex = 0;

module.exports = {
  networks: {  
    dev: {   //Local Ganache Network
      host: "127.0.0.1",
      port: 8545,
      network_id: 1337 
    },
    ThemisChain: {   //ThemisChain Network - Node0 (using websocket instead of http)
      provider: function() {
        return new HDWalletProvider(process.env.MNEMONIC, "ws://18.232.0.78:8546", accountIndex);
      },
      network_id: 1997 
    },
    ganache: {   //Local Ganache Network (Through Metamask)
      provider: function() {
        return new HDWalletProvider(process.env.MNEMONIC, "http://127.0.0.1:8545", accountIndex);
      },
      network_id: 1337 
    }
  },
  compilers: {
    solc: {
    version: "0.8.19",
      settings: {
        optimizer: {
          runs: 200,
          enabled: true
        }
      }
    }
  }
};