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

   it("multiple users", function() {
    var saveBling;
    var new_accounts = [];
    var NUM_USERS = 100;
    var totalAmount = new web3.BigNumber('0'); 

    return SaveBling.deployed().then(function(instance) {
      saveBling = instance;
      for (i = 0; i < NUM_USERS; i++) {
        new_accounts.push(web3.personal.newAccount('password'));
      }
      var promises = [];
      for (i = 0; i < NUM_USERS; i++) {
        var sourceAccount = accounts[i%5];
        promises.push(web3.eth.sendTransaction(
          {value: web3.toWei(1, "ether"), from: sourceAccount, to: new_accounts[i]}));
      }
      return Promise.all(promises);
    }).then(function(result) {
      var promises = [];
      for (i = 0; i < NUM_USERS; i++) {
        var depositAmount = web3.toWei(100+Math.floor(Math.random()*400), "gwei");
        web3.personal.unlockAccount(new_accounts[i], "password", 15000);
        promises.push(web3.eth.sendTransaction(
          {value: depositAmount, from: new_accounts[i], to: saveBling.address}));
        totalAmount = totalAmount.plus(depositAmount);
      }
      return Promise.all(promises);
    }).then(function(result) {
      var promises = [];
      for (i = 0; i < NUM_USERS; i++) {
        promises.push(saveBling.sendTransaction({value: web3.toWei(0, "ether"), from: new_accounts[i]}));
      }
      return Promise.all(promises);
    }).then(function(result) {
      var sum = new web3.BigNumber('0');
      for(i = 0; i < result.length; i++) {
        for(j = 0; j < result[i].logs.length; j++)
          if (result[i].logs[j].event == "WithdrawalMade") {
            sum = sum.plus(result[i].logs[j].args.value);
          }
      }
      assert.equal(sum.toNumber(), totalAmount.toNumber(), "Total withdrawn value should be equal to total deposited value.");
    })
   });


  it("test multiple deposits per address", function() {
    var saveBling;
    var acct_A = accounts[0];
    var acct_B = accounts[1];
    var acct_C = accounts[2];
    var acct_D = accounts[3];
    var ret_A;
    var ret_B;
    var ret_C;
    var ret_D;

    return SaveBling.deployed().then(function(instance) {
      saveBling = instance;
      return saveBling.sendTransaction({value: web3.toWei(40, "gwei"), from: acct_A});
    }).then(function(result) {
      return saveBling.sendTransaction({value: web3.toWei(40, "gwei"), from: acct_B});
    }).then(function(result) {
      return saveBling.sendTransaction({value: web3.toWei(800, "gwei"), from: acct_C});
    }).then(function(result) {
      return saveBling.sendTransaction({value: web3.toWei(0, "ether"), from: acct_C});
    }).then(function(result) {
      assert.equal(result.logs[0].event, 'WithdrawalMade');
      ret_C = result.logs[0].args.value;
      return saveBling.sendTransaction({value: web3.toWei(70, "gwei"), from: acct_B});
    }).then(function(result) {
      return saveBling.sendTransaction({value: web3.toWei(160, "gwei"), from: acct_D});
    }).then(function(result) {
      return saveBling.sendTransaction({value: web3.toWei(0, "ether"), from: acct_D});
    }).then(function(result) {
      assert.equal(result.logs[0].event, 'WithdrawalMade');
      ret_D = result.logs[0].args.value;
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

      assert.equal(
        ret_A.add(ret_B).add(ret_C).add(ret_D).toString(),
        web3.toWei(880 + 70 + 160, "gwei")
      );
      assert.equal(ret_B.toString(), web3.toWei(40 + 10 + 70 + 3 + 1, "gwei"));
    })
  });


});

