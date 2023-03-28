const HDWalletProvider = require('@truffle/hdwallet-provider');
const Web3 = require('web3'); 
const { abi, evm } = require('./compile');

// Use my MetaMask's (test wallet) mnemonic phrase to configure the provider
provider = new HDWalletProvider(
    'pen fence reform amused clock divide van toy vocal ignore misery bullet',
    // API Key from https://www.infura.io/ to connect to an Infura node
    'https://goerli.infura.io/v3/f7b26f9b764e4aaab904d53ee2ba94b5'
);
 
const web3 = new Web3(provider);
 
const deploy = async () => {
  const accounts = await web3.eth.getAccounts();
 
  console.log('Attempting to deploy from account', accounts[0]);
 
  const lotteryContract = await new web3.eth.Contract(abi)
    .deploy({ data: evm.bytecode.object })
    .send({ gas: '1000000', from: accounts[0] });
  
  console.log(JSON.stringify(abi));
  console.log('Contract deployed to', lotteryContract.options.address);
  provider.engine.stop();
};
 
deploy();
