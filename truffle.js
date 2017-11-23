module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  networks: {
    develop: {
      host: "localhost",
      port: 8545,
      network_id: "*", // Match any network id

      // we want gasPrice set to 1 or 0
      // but a bug is currently making truffle to ignore this setting
      // see https://github.com/trufflesuite/truffle/issues/680
      // gasPrice: 22000000000
    }
  }
};
