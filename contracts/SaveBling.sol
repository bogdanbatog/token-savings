pragma solidity ^0.4.11;


/// @title SaveBling - Savings account for Ether
/// @author Bogdan Batog (https://github.com/bogdanbatog)
/// @dev A 'Savings' account that holds Ethers. Deposits are received by
///  sending funds directly to the contract address. Withdraws are triggered
///  by sending 0 Ether from the same address that made the deposit.
contract SaveBling {

    uint256 constant PPB = 10**9;

    /// @notice Withdrawal fee, in parts per billion.
    uint256 constant FEE_RATIO_PPB = 25 * PPB / 1000;             // 2.5%

    /// @notice Amount deposited per address.
    mapping(address => uint256) principal;

    /// @notice Total deposited principals. In Gwei units.
    /// @dev The smallest unit eligible for reward is 1 Gwei. Thus, any reminder
    ///  from the deposited amount, smaller than 1 Gwei, will be ignored when
    ///  computing the reward.
    uint256 principal_total;

    /// @notice Total reward since the beginning of time, in wei per eligible
    ///  unit (1 Gwei).
    uint256 reward_ppb_total;

    /// @notice Reminder from the last fee redistribution.
    uint256 reward_remainder;

    /// @notice Stores the value of reward_ppb_total at deposit time.
    /// @dev Reward is computed at withdrawal time as a difference between current
    ///  total reward and total reward at deposit time, PER eligible unit, 1Gwei.
    mapping(address => uint256) reward_ppb_initial;

    event DepositMade(address _from, uint value);
    event WithdrawalMade(address _to, uint value);


    /// Initialize the contract.
    function SaveBling() public {
        principal_total = 0;
        reward_ppb_total = 0;
        reward_remainder = 0;
    }


    function computeCurrentReward(address _address) private constant returns (uint256) {
        var reward_ppb = reward_ppb_total - reward_ppb_initial[_address];
        return principal[_address] / PPB * reward_ppb;
    }


    /// @notice Deposit funds into contract.
    function deposit() private {
        if (msg.value < PPB)
            // Deposits smaller than 1 Gwei not accepted
            revert();

        var reward = computeCurrentReward(msg.sender);

        var old_principal = principal[msg.sender];
        var new_principal = old_principal + msg.value + reward;

        principal[msg.sender] = new_principal;

        principal_total += (new_principal / PPB - old_principal / PPB);

        // mark starting term in reward series
        reward_ppb_initial[msg.sender] = reward_ppb_total;

        DepositMade(msg.sender, msg.value);
    }


    /// @notice Returns the amount that would be sent by a real withdrawal.
    function simulateWithdrawal(address _address) public view returns (uint256) {
        var original_principal = principal[_address];
        var fee = original_principal / PPB * FEE_RATIO_PPB;  // all integer
        var reward = computeCurrentReward(_address);
        return original_principal - fee + reward;
    }


    /// @notice Withdraw funds associated with the sender address,
    ///  deducting fee and adding reward.
    function withdraw() private {
        if (principal[msg.sender] == 0)
            // nothing to withdraw
            revert();

        // init
        var original_principal = principal[msg.sender];
        var fee = original_principal / PPB * FEE_RATIO_PPB;  // all integer
        var reward = computeCurrentReward(msg.sender);

        // clear user account
        principal[msg.sender] = 0;
        reward_ppb_initial[msg.sender] = 0;
        principal_total -= original_principal / PPB;

        // update total reward and remainder
        if (principal_total > 0) {
            var amount = fee + reward_remainder;              // wei
            var ratio = amount / principal_total;             // 1/Gwei
            reward_ppb_total += ratio;
            reward_remainder = amount % principal_total;      // wei
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