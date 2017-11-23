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

  it("test two users different amounts", function() {
    var saveBling;
    var acct_A = accounts[0];
    var acct_B = accounts[1];
    var ret_A;
    var ret_B;

    return SaveBling.deployed().then(function(instance) {
      saveBling = instance;
      return saveBling.sendTransaction({value: web3.toWei(1, "ether"), from: acct_A});
    }).then(function(result) {
      return saveBling.sendTransaction({value: web3.toWei(10, "ether"), from: acct_B});
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

      assert.equal(ret_A.add(ret_B).toString(), web3.toWei(11, "ether"));
      assert.equal(ret_A.toString(), web3.toWei(0.975, "ether"));
    })
  });

  it("test two users magnitude amounts", function() {
    var saveBling;
    var acct_A = accounts[0];
    var acct_B = accounts[1];
    var ret_A;
    var ret_B;

    return SaveBling.deployed().then(function(instance) {
      saveBling = instance;
      return saveBling.sendTransaction({value: web3.toWei(3, "gwei"), from: acct_A});
    }).then(function(result) {
      return saveBling.sendTransaction({value: web3.toWei(10, "ether"), from: acct_B});
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

      assert.equal(ret_A.add(ret_B).toString(), web3.toWei(10000000003, "gwei"));
      assert.equal(ret_A.toString(), web3.toWei(2.925, "gwei"));
    })
  });

  it("test three users magnitude amounts", function() {
    var saveBling;
    var acct_A = accounts[0];
    var acct_B = accounts[1];
    var acct_C = accounts[2];
    var ret_A;
    var ret_B;
    var ret_C;

    return SaveBling.deployed().then(function(instance) {
      saveBling = instance;
      return saveBling.sendTransaction({value: web3.toWei(3, "gwei"), from: acct_A});
    }).then(function(result) {
      return saveBling.sendTransaction({value: web3.toWei(10, "ether"), from: acct_B});
    }).then(function(result) {
      return saveBling.sendTransaction({value: web3.toWei(1, "ether"), from: acct_C});
    }).then(function(result) {
      return saveBling.sendTransaction({value: web3.toWei(0, "ether"), from: acct_B});
    }).then(function(result) {
      assert.equal(result.logs[0].event, 'WithdrawalMade');
      ret_B = result.logs[0].args.value;
    }).then(function(result) {
      return saveBling.sendTransaction({value: web3.toWei(0, "ether"), from: acct_C});
    }).then(function(result) {
      assert.equal(result.logs[0].event, 'WithdrawalMade');
      ret_C = result.logs[0].args.value;
      return saveBling.sendTransaction({value: web3.toWei(0, "ether"), from: acct_A});
    }).then(function(result) {
      assert.equal(result.logs[0].event, 'WithdrawalMade');
      ret_A = result.logs[0].args.value;

      assert.equal(ret_A.add(ret_B).add(ret_C).toString(), web3.toWei(11000000003, "gwei"));
      assert.equal(ret_B.toString(), web3.toWei(9.75, "ether"));
      assert.equal(ret_C.toString(), '1224999999000000000');
    })
  });

  it("test five users", function() {
    var saveBling;
    var acct_A = accounts[0];
    var acct_B = accounts[1];
    var acct_C = accounts[2];
    var acct_D = accounts[3];
    var acct_E = accounts[4];
    var ret_A;
    var ret_B;
    var ret_C;
    var ret_D;
    var ret_E;

    return SaveBling.deployed().then(function(instance) {
      saveBling = instance;
      return saveBling.sendTransaction({value: web3.toWei(70000, "gwei"), from: acct_A});
    }).then(function(result) {
      return saveBling.sendTransaction({value: web3.toWei(7000, "gwei"), from: acct_B});
    }).then(function(result) {
      return saveBling.sendTransaction({value: web3.toWei(700, "gwei"), from: acct_C});
    }).then(function(result) {
      return saveBling.sendTransaction({value: web3.toWei(70, "gwei"), from: acct_D});
    }).then(function(result) {
      return saveBling.sendTransaction({value: web3.toWei(7, "gwei"), from: acct_E});
    }).then(function(result) {
      return saveBling.sendTransaction({value: web3.toWei(0, "ether"), from: acct_A});
    }).then(function(result) {
      assert.equal(result.logs[0].event, 'WithdrawalMade');
      ret_A = result.logs[0].args.value;
    }).then(function(result) {
      return saveBling.sendTransaction({value: web3.toWei(0, "ether"), from: acct_B});
    }).then(function(result) {
      assert.equal(result.logs[0].event, 'WithdrawalMade');
      ret_B = result.logs[0].args.value;
    }).then(function(result) {
      return saveBling.sendTransaction({value: web3.toWei(0, "ether"), from: acct_C});
    }).then(function(result) {
      assert.equal(result.logs[0].event, 'WithdrawalMade');
      ret_C = result.logs[0].args.value;
    }).then(function(result) {
      return saveBling.sendTransaction({value: web3.toWei(0, "ether"), from: acct_D});
    }).then(function(result) {
      assert.equal(result.logs[0].event, 'WithdrawalMade');
      ret_D = result.logs[0].args.value;
    }).then(function(result) {
      return saveBling.sendTransaction({value: web3.toWei(0, "ether"), from: acct_E});
    }).then(function(result) {
      assert.equal(result.logs[0].event, 'WithdrawalMade');
      ret_E = result.logs[0].args.value;

      assert.equal(
        ret_A.add(ret_B).add(ret_C).add(ret_D).add(ret_E).toString(),
        web3.toWei(77777, "gwei")
      );
      assert.equal(ret_B.toString(), '8400157514000');
      assert.equal(ret_C.toString(), '997673410300');
    })
  });


});

