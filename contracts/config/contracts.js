module.exports = {
  // default applies to all environments
  default: {
    // order of connections the dapp should connect to
    dappConnection: [
      "$WEB3", // uses pre existing web3 object if available (e.g in Mist)
      "http://localhost:8546",
    ],

    // Automatically call `ethereum.enable` if true.
    // If false, the following code must run before sending any transaction: `await EmbarkJS.enableEthereum();`
    // Default value is true.
    // dappAutoEnable: true,

    gas: "auto",

    // Strategy for the deployment of the contracts:
    // - implicit will try to deploy all the contracts located inside the contracts directory
    //            or the directory configured for the location of the contracts. This is default one
    //            when not specified
    // - explicit will only attempt to deploy the contracts that are explicitly specified inside the
    //            contracts section.
    // strategy: 'implicit',
 
    // minimalContractSize, when set to true, tells Embark to generate contract files without the heavy bytecodes
    // Using filteredFields lets you customize which field you want to filter out of the contract file (requires minimalContractSize: true)
    // minimalContractSize: false,
    // filteredFields: [],

    deploy: {
      BidContract: {
        args: ["$TokenContract"],
      },
      TokenContract: {
        args: ["SampleNFT", "SNFT"],
      },
      ERC721: {
        args: ["SampleNFT", "SNFT"],
      },
      // SimpleStorage: {
      //   fromIndex: 0,
      //   args: [100]
      // }
    },
  },

  // default environment, merges with the settings in default
  // assumed to be the intended environment by `embark run`
  development: {
    dappConnection: [
      "http://localhost:8546",
      "$WEB3", // uses pre existing web3 object if available (e.g in Mist)
    ],
  },

  // merges with the settings in default
  // used with "embark run privatenet"
  matic: {
    deploy: {
      BidContract: {
        args: ["$TokenContract"],
        gas: "6000000",
        gasPrice: "250",
      },
      TokenContract: {
        args: ["SampleNFT MATIC", "SNFTM"],
        gas: "6000000",
        gasPrice: "250",
      },
      ERC721: {
        args: ["SampleNFT MATIC", "SNFTM"],
        gas: "6000000",
        gasPrice: "250",
      },
      // SimpleStorage: {
      //   fromIndex: 0,
      //   args: [100]
      // }
    },
  },

  // merges with the settings in default
  // used with "embark run testnet"
  testnet: {},

  // merges with the settings in default
  // used with "embark run livenet"
  livenet: {},

  // you can name an environment with specific settings and then specify with
  // "embark run custom_name" or "embark blockchain custom_name"
  // custom_name: {}
};
