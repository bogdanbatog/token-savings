pragma solidity ^0.4.0;


contract SaveBling {

    uint256 constant PPB = 10**9;
    uint256 constant FEE_RATIO_PPB = 25 * PPB / 1000;             // 2.5%
    uint256 constant PRINCIPAL_RATIO_PPB = PPB - FEE_RATIO_PPB;

    address chairperson;

    mapping(address => uint256) principal;
    uint256 principal_total;

    mapping(address => uint256) reward_ppb_initial;
    uint256 reward_ppb_total;
    uint256 reward_remainder;

    event DepositMade(address _from, uint value);
    event WithdrawalMade(address _to, uint value);

    /// Initialize the contract.
    function SaveBling() public {
        chairperson = msg.sender;
        principal_total = 0;
        reward_ppb_total = 0;
        reward_remainder = 0;
    }


    function computeCurrentReward() private constant returns (uint256) {
        var reward_ppb = reward_ppb_total - reward_ppb_initial[msg.sender];
        return principal[msg.sender] / PPB * reward_ppb;
    }


    /// Deposit funds into contract.
    function deposit() private {
        if (msg.value < PPB)
            // Deposits smaller than 1 Gwei not accepted
            revert();

        var reward = computeCurrentReward();

        var old_principal = principal[msg.sender];
        var new_principal = old_principal + msg.value + reward;

        principal[msg.sender] = new_principal;

        principal_total += (
            new_principal / PPB * PPB -
            old_principal / PPB * PPB
        );

        // mark starting term in reward series
        reward_ppb_initial[msg.sender] = reward_ppb_total;

        DepositMade(msg.sender, msg.value);
    }


    /// Withdraw funds associated with the sender address,
    /// deducting fee and adding reward.
    function withdraw() private {
        if (principal[msg.sender] == 0)
            // nothing to withdraw
            return;

        // init
        var original_principal = principal[msg.sender];
        var fee = original_principal / PPB * FEE_RATIO_PPB;  // all integer
        var reward = computeCurrentReward();

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

        WithdrawalMade(msg.sender, send_amount);
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