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
    var saveBling;
    var acct_A = accounts[0];
    var acct_B = accounts[1];
    var ret_A;
    var ret_B;

    return SaveBling.deployed().then(function(instance) {
      saveBling = instance;
      return saveBling.sendTransaction({value: web3.toWei(1, "ether"), from: acct_A});
    }).then(function(result) {
      return saveBling.sendTransaction({value: web3.toWei(1, "ether"), from: acct_B});
    }).then(function(result) {
      return saveBling.sendTransaction({value: web3.toWei(0, "ether"), from: acct_A});
    }).then(function(result) {
      assert.equal(
        result.logs[0].event, 'WithdrawalMade',
        "WithdrawalMade event did not fired"
      );
      ret_A = result.logs[0].args.value;
      return saveBling.sendTransaction({value: web3.toWei(0, "ether"), from: acct_B});
    }).then(function(result) {
      assert.equal(
        result.logs[0].event, 'WithdrawalMade',
        "WithdrawalMade event did not fired"
      );
      ret_B = result.logs[0].args.value;

      assert.equal(ret_A.add(ret_B).toString(), web3.toWei(2, "ether"));
      assert.equal(ret_B.toString(), web3.toWei(1.025, "ether"));
    })
  });


});

