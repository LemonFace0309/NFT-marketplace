require('@nomiclabs/hardhat-waffle');

module.exports = {
  networks: {
    hardhat: {
      chainid: 1337,
    },
    mumbai: {
      url: `https://polygon-mumbai.infura.io/v3/${process.env.MUMBAI_NETWORK}`,
      accounts: [process.env.PRIVATE_KEY],
    },
    mainnet: {
      url: `https://polygon-mainnet.infura.io/v3/${process.env.MAINNET_NETWORK}`,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
  solidity: '0.8.4',
};
