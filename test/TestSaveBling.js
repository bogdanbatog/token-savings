// var BigNumber = require('bignumber.js');

// Specifically request an abstraction for SaveBling
var SaveBling = artifacts.require("SaveBling");

contract('SaveBling', function(accounts) {

  it("test one user deposit and withdrawal", function() {
    var account_one = accounts[0];
    var initial_balance = web3.eth.getBalance(account_one);

    console.log(initial_balance.toString());
    var sb;
    var gasUsed = 0;
  
    return SaveBling.deployed().then(function(instance) {
      sb = instance;
      return sb.send(web3.toWei(0, "ether"));
    }).then(function(result) {

      console.log(result);
      gasUsed = web3.toWei(result.receipt.gasUsed, 'Gwei');
      console.log(gasUsed);

      var mid_balance = web3.eth.getBalance(account_one);
      console.log(initial_balance.minus(gasUsed).minus(mid_balance).toString());
      assert.equal(
        mid_balance.toString(),
        initial_balance.minus(web3.toWei(1, 'ether')).minus(gasUsed).toString(),
        "mid balance != initial balance - 1 ether - gasUsed"
      );
      return sb.send(web3.toWei(0, "ether"));

    }).then(function(result) {

      gasUsed = gasUsed.plus(web3.toWei(result.receipt.gasUsed, 'Gwei'));
      console.log(gasUsed);

      var final_balance = web3.eth.getBalance(account_one);
      assert.equal(
        final_balance, initial_balance - gasUsed,
        "final balance != initial balance - gasUsed"
      );

    })
  });


});