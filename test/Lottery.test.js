const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());

const { abi, evm } = require('../compile');

let accounts;
let lotteryContract;

beforeEach(async () => {
    // Get a list of all accounts
    accounts = await web3.eth.getAccounts();

    // Use one of those accounts to deploy the contract
    lotteryContract = await new web3.eth.Contract(abi)
        .deploy({
            data: evm.bytecode.object
        })
        .send({ from: accounts[0], gas: '1000000' });
});

describe('Lottery Contract', () => {
    it('deploys a contract', () => {
        assert.ok(lotteryContract.options.address);
    });

    it('allows one player to enter', async () => {
        await lotteryContract.methods.newPlayer().send({
            from: accounts[0],
            value: web3.utils.toWei('0.02', 'ether')
        });

        const players = await lotteryContract.methods.getPlayers().call({
            from: accounts[0]
        });

        assert.equal(accounts[0], players[0]);
        assert.equal(1, players.length);
    });

    it('allows multiple players to enter', async () => {
        await lotteryContract.methods.newPlayer().send({
            from: accounts[0],
            value: web3.utils.toWei('0.02', 'ether')
        });
        await lotteryContract.methods.newPlayer().send({
            from: accounts[1],
            value: web3.utils.toWei('0.02', 'ether')
        });
        await lotteryContract.methods.newPlayer().send({
            from: accounts[2],
            value: web3.utils.toWei('0.02', 'ether')
        });

        const players = await lotteryContract.methods.getPlayers().call({
            from: accounts[0]
        });

        assert.equal(accounts[0], players[0]);
        assert.equal(accounts[1], players[1]);
        assert.equal(accounts[2], players[2]);
        assert.equal(3, players.length);
    });

    it('requires a minimun amount of ether to enter', async () => {
        try {
            await lotteryContract.methods.newPlayer().send({
                from: accounts[0],
                value: web3.utils.toWei('0.002', 'ether')
            });
            assert(false);
        } catch (err) {
            assert(err);
        }
    });

    it('only manager can call pickWinner', async () => {
        try {
            await lotteryContract.methods.pickWinner().send({
                from: accounts[1]
            });
            assert(false);
        } catch (err) {
            assert(err);
        }
    });

    it('sends money to the winner and resets the players array', async () => {
        await lotteryContract.methods.newPlayer().send({
            from: accounts[0],
            value: web3.utils.toWei('2', 'ether')
        });

        const initialBalance = await web3.eth.getBalance(accounts[0]);
        await await lotteryContract.methods.pickWinner().send({
            from: accounts[0]
        });
        const finalBalance = await web3.eth.getBalance(accounts[0]);
        const difference = finalBalance - initialBalance;
        const players = await lotteryContract.methods.getPlayers().call({
            from: accounts[0]
        });

        assert(difference > web3.utils.toWei('1.8', 'ether'));
        assert(!players.length);
    });
});