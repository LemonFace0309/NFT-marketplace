require('@nomiclabs/hardhat-waffle');
const fs = require('fs');

const MUMBAI_NETWORK = 'b194a40114154cccbe5c4ac6cff9d3fd';
const MAINNET_NETWORK = 'b194a40114154cccbe5c4ac6cff9d3fd';
const privateKey = fs.readFileSync('.secret').toString();

module.exports = {
  networks: {
    hardhat: {
      chainid: 1337,
    },
    mumbai: {
      url: `https://polygon-mumbai.infura.io/v3/${MUMBAI_NETWORK}`,
      accounts: [privateKey],
    },
    mainnet: {
      url: `https://polygon-mainnet.infura.io/v3/${MAINNET_NETWORK}`,
      accounts: [privateKey],
    },
  },
  solidity: '0.8.4',
};
