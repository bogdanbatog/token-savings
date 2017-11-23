var BigNumber = require('bignumber.js');

// Specifically request an abstraction for SaveBling
var SaveBling = artifacts.require("SaveBling");
var gasPrice = 100;

contract('SaveBling', function(accounts) {

  it("test one user deposit and withdrawal", function() {
    var account_one = accounts[0];
    var initial_balance = web3.eth.getBalance(account_one);

    var saveBling;
    var gasUsed = new BigNumber(0);
  
    return SaveBling.deployed().then(function(instance) {
      saveBling = instance;
      return saveBling.send(web3.toWei(1, "ether"));
    }).then(function(result) {

      gasUsed = gasUsed.add(web3.toWei(result.receipt.gasUsed * gasPrice, 'Gwei'));
      var mid_balance = web3.eth.getBalance(account_one);
      assert.equal(
        mid_balance.toString(),
        initial_balance.minus(web3.toWei(1, 'ether')).minus(gasUsed).toString(),
        "mid balance != initial balance - 1 ether - gasUsed"
      );
      return saveBling.send(web3.toWei(0, "ether"));

    }).then(function(result) {

      gasUsed = gasUsed.add(web3.toWei(result.receipt.gasUsed * gasPrice, 'Gwei'));
      var final_balance = web3.eth.getBalance(account_one);
      assert.equal(
        final_balance.toString(), initial_balance.minus(gasUsed).toString(),
        "final balance != initial balance - gasUsed"
      );

    })
  });


});