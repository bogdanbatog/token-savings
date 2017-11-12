'''
Fee Redistribution At Withdrawal

Deposit and withdraw into a common pool. Withdrawals are subject to a
constant percentage fee, no matter the duration of deposit. Fees are
redistributed proportionally to remaining deposits.

Looking at a sample withdrawal sequence, we can derive the final withdrawal
amount, after all prior fees were redistributed:

a) x1 => fee1 = 0.025*x1 is redistributed
    x2 += x2 * fee1 / (x2+x3+x4+x5)
    x3 += x3 * fee1 / (x2+x3+x4+x5)
    x4 += x4 * fee1 / (x2+x3+x4+x5)
    x5 += x5 * fee1 / (x2+x3+x4+x5)

b) x2 => fee2 = 0.025*x2 is redistributed
    x3 += x3 * fee2 / (x3+x4+x5)
    x4 += x4 * fee2 / (x3+x4+x5)
    x5 += x5 * fee2 / (x3+x4+x5)

c) x3 => fee3 = 0.025*x3 is redistributed
    x4 += x4 * fee3 / (x4+x5)
    x5 += x5 * fee3 / (x4+x5)

d) x4 => fee4 = 0.025*x4 is redistributed
    x5 += x5 * fee4 / (x5)

Final withdrawal amounts:

x5_f = x5 * [1 + fee1 / (x2+x3+x4+x5) + fee2 / (x3+x4+x5) + fee3 / (x4+x5) + fee4 / x5]
x4_f = x4 * [1 + fee1 / (x2+x3+x4+x5) + fee2 / (x3+x4+x5) + fee3 / (x4+x5)]
x3_f = x3 * [1 + fee1 / (x2+x3+x4+x5) + fee2 / (x3+x4+x5)]
x2_f = x2 * [1 + fee1 / (x2+x3+x4+x5)]
x1_f = x1 * [1 + 0]

We can easily do O(1) withdrawal and deposit operations by noting
that only order of withdrawal matters and that reward gained by any user
can be written as a series whose terms don't depend on the user amount.

x_n = x_n * [1 + SUM fee_percent for all past withdrawals]
x_n = x_n * [S_withdrawal - S_deposit]

Precision

We work with ppt/ppm integer math only. We only have one division
and we compute it on integers and keep track of remainder.

Choice of PPT/PPM/PPB

Larger PPT values cause smaller deposits to NOT receive reward. This means
we can not accept deposits smaller than PPT wei. ACTUALLY, should also
TRUNC deposits to be multiple of PPT (otherwise the math will broke when a lot
of sub PPT fractions accumulate in principal_total).

Smaller PPT values cause delaying of rewards because the distribution base
may be too large and reward per base rounds to zero.
'''

PPT = 10**9

FEE_RATIO_PPT = 25 * PPT / 1000  # 2.5%
PRINCIPAL_RATIO_PPT = (PPT - FEE_RATIO_PPT)

ETHER2WEI = 10**18


class FeeRedistributionAtWithdrawlConstantTime:

    def __init__(self):
        ''' fee will be extracted from principal, at withdrawl '''
        self.principal = {}
        self.principal_total = 0

        self.reward_ppt_initial = {}
        self.reward_ppt_total = 0
        self.reward_remainder = 0

    def deposit(self, address, ether=0, wei=0):
        amount = int(ether) * ETHER2WEI + int(wei)
        if amount <= 0:
            return None

        if amount < PPT:
            raise Exception(
                "Deposits smaller than {} wei not accepted".format(PPT))

        if address in self.principal:
            raise Exception("Not Implemented: multiple deposits per address.")

        # update user balance
        self.principal[address] = amount
        self.reward_ppt_initial[address] = self.reward_ppt_total

        # update total
        self.principal_total += amount / PPT * PPT

    def withdraw(self, address):
        if address not in self.principal:
            return None

        # init
        principal = self.principal[address]
        fee = principal / PPT * FEE_RATIO_PPT # all integer
        reward_ppt = self.reward_ppt_total - self.reward_ppt_initial[address]
        reward = principal / PPT * reward_ppt

        # clear user account
        self.principal.pop(address)
        self.reward_ppt_initial.pop(address)
        self.principal_total -= principal / PPT * PPT

        # update total reward and remainder
        if self.principal_total > 0:
            amount = fee + self.reward_remainder  # wei
            base = self.principal_total / PPT # T wei
            # Note: principal_total > 0 results there's at least one deposit
            # amount in the total; but any deposit >= PPT; hence base > 0
            # So the below division is safe.
            ratio = amount / base  # 1 / T
            self.reward_ppt_total += ratio
            self.reward_remainder = amount % base  # wei
        else:
            assert self.principal_total == 0

            # special case for last withdrawal: no fee
            fee = 0
            reward += self.reward_remainder
            self.reward_remainder = 0

        return principal - fee + reward
