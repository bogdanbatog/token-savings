pragma solidity ^0.4.0;


contract SaveBling {

    uint constant PPB = 10**9;
    uint constant FEE_RATIO_PPB = 25 * PPB / 1000;             // 2.5%
    uint constant PRINCIPAL_RATIO_PPB = PPB - FEE_RATIO_PPB;

    address chairperson;

    mapping(address => uint256) principal;
    uint256 principal_total;

    mapping(address => uint256) reward_ppb_initial;
    uint256 reward_ppb_total;
    uint256 reward_remainder;


    /// Initialize the contract.
    function SaveBling() public {
        chairperson = msg.sender;
        principal_total = 0;
        reward_ppb_total = 0;
        reward_remainder = 0;
    }


    /// Deposit funds into contract.
    function deposit() private returns (bool) {
        if (msg.value < PPB)
            // raise Exception("Deposits smaller than 1 Gwei not accepted")
            return false;

        if (principal[msg.sender] > 0)
            // raise Exception("Not Implemented: multiple deposits per address.")
            return false;

        // update user balance
        principal[msg.sender] = msg.value;
        reward_ppb_initial[msg.sender] = reward_ppb_total;

        // update total
        principal_total += msg.value / PPB * PPB;

        return true;
    }


    /// Withdraw funds associated with the sender address,
    /// deducting fee and including reward.
    function withdraw() private returns (uint) {
        if (principal[msg.sender] == 0)
            return 0;

        // init
        var original_principal = principal[msg.sender];
        var fee = original_principal / PPB * FEE_RATIO_PPB;  // all integer
        var reward_ppb = reward_ppb_total - reward_ppb_initial[msg.sender];
        var reward = original_principal / PPB * reward_ppb;

        // clear user account
        principal[msg.sender] = 0;
        reward_ppb_initial[msg.sender] = 0;
        principal_total -= original_principal / PPB * PPB;

        // update total reward and remainder
        if (principal_total > 0) {
            var amount = fee + reward_remainder;      // wei
            var base = principal_total / PPB;         // Gwei

            // Note: principal_total > 0 results there's at least one deposit
            // amount in the total; but any deposit >= PPB; hence base > 0
            // So the below division is safe.
            var ratio = amount / base;                // 1/Gwei
            reward_ppb_total += ratio;
            reward_remainder = amount % base;         // wei
        } else {
            assert(principal_total == 0);

            // special case for last withdrawal: no fee
            fee = 0;
            reward += reward_remainder;
            reward_remainder = 0;
        }

        var send_amount = original_principal - fee + reward;
        msg.sender.transfer(send_amount);
    }


    /// Dispatch to deposit or withdraw functions.
    function () public payable {
        if (msg.value > 0) {
            deposit();
        }
        if (msg.value == 0) {
            withdraw();
        }
    }
}