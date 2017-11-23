var BigNumber = require('bignumber.js');

// Specifically request an abstraction for SaveBling
var SaveBling = artifacts.require("SaveBling");
var gasPrice = 100;


contract('SaveBling', function(accounts) {

  it("test one user deposit and withdrawal", function() {
    var account_one = accounts[0];
    var saveBling;

    return SaveBling.deployed().then(function(instance) {
      saveBling = instance;
      return saveBling.send(web3.toWei(1, "ether"));
    }).then(function(result) {
      assert.equal(
        result.logs[0].event, 'DepositMade',
        "DepositMade event did not fired"
      );
      assert.equal(
        result.logs[0].args.value.toString(),
        web3.toWei(1, 'ether').toString(),
        "deposit amount != 1 ether"
      );
      return saveBling.send(web3.toWei(0, "ether"));
    }).then(function(result) {
      assert.equal(
        result.logs[0].event, 'WithdrawalMade',
        "WithdrawalMade event did not fired"
      );
      assert.equal(
        result.logs[0].args.value.toString(),
        web3.toWei(1, 'ether').toString(),
        "withdrawal amount != 1 ether"
      );
    })
  });


  it("test two users", function() {
    var acct_A = accounts[0];
    var acct_B = accounts[1];
    var initial_balance_A = web3.eth.getBalance(acct_A);
    var initial_balance_B = web3.eth.getBalance(acct_B);
    var gasUsed_A = new BigNumber(0);
    var gasUsed_B = new BigNumber(0);

    var saveBling;

    return SaveBling.deployed().then(function(instance) {
      saveBling = instance;
      return saveBling.sendTransaction({value: web3.toWei(1, "ether"), from: acct_A});
    }).then(function(result) {
      gasUsed_A = gasUsed_A.add(web3.toWei(result.receipt.gasUsed * gasPrice, 'Gwei'));

      return saveBling.sendTransaction({value: web3.toWei(1, "ether"), from: acct_B});
    }).then(function(result) {
      gasUsed_B = gasUsed_B.add(web3.toWei(result.receipt.gasUsed * gasPrice, 'Gwei'));

      var mid_balance_A = web3.eth.getBalance(acct_A);
      var mid_balance_B = web3.eth.getBalance(acct_B);

      return saveBling.sendTransaction({value: web3.toWei(0, "ether"), from: acct_A});
    }).then(function(result) {
      gasUsed_A = gasUsed_A.add(web3.toWei(result.receipt.gasUsed * gasPrice, 'Gwei'));

      return saveBling.sendTransaction({value: web3.toWei(0, "ether"), from: acct_B});
    }).then(function(result) {
      gasUsed_B = gasUsed_B.add(web3.toWei(result.receipt.gasUsed * gasPrice, 'Gwei'));

      var final_balance_A = web3.eth.getBalance(acct_A);
      var final_balance_B = web3.eth.getBalance(acct_B);

      assert.equal(
        initial_balance_A.add(initial_balance_B).toString(),
        final_balance_A.add(final_balance_B).add(gasUsed_A).add(gasUsed_B).toString(),
        "final balance != initial balance - gasUsed"
      );

      assert.equal(
        final_balance_B.minus(initial_balance_B).add(gasUsed_B).toString(),
        web3.toWei(0.025, "ether"),
        "final balance != initial balance - gasUsed"
      );

    })
  });


});

