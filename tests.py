import unittest
import random


from fee_redistribution import (
    PPT,
    FEE_RATIO_PPT, PRINCIPAL_RATIO_PPT,
    ETHER2WEI,
    FeeRedistributionAtWithdrawlConstantTime as TestKlass
)


class TestFeeRedistribution(unittest.TestCase):

    def test_one_user(self):
        tb = TestKlass()
        tb.deposit("A1", ether=100)
        tb.increment_current_block()
        ret = tb.withdraw("A1")
        self.assertEqual(ret, 100 * ETHER2WEI)

    def test_one_user_same_block(self):
        tb = TestKlass()
        tb.deposit("A1", ether=100)
        ret = tb.withdraw("A1")
        self.assertIsNone(ret)

    def test_two_users(self):
        tb = TestKlass()
        tb.deposit("A2", ether=100)
        tb.deposit("B2", ether=100)
        tb.increment_current_block()
        ret_a = tb.withdraw("A2")
        ret_b = tb.withdraw("B2")
        self.assertEqual(ret_a + ret_b, (100 + 100) * ETHER2WEI)
        self.assertEqual(ret_a, 100 * PRINCIPAL_RATIO_PPT * ETHER2WEI / PPT)

    def test_two_diff_users(self):
        tb = TestKlass()
        tb.deposit("A3", ether=100)
        tb.deposit("B3", ether=100000)
        tb.increment_current_block()
        ret_a = tb.withdraw("A3")
        ret_b = tb.withdraw("B3")
        self.assertEqual(ret_a + ret_b, (100 + 100000) * ETHER2WEI)
        self.assertEqual(ret_a, 100 * PRINCIPAL_RATIO_PPT * ETHER2WEI / PPT)

    def test_two_users_magnitude(self):
        tb = TestKlass()
        tb.deposit("A4", wei=3 * PPT)
        tb.deposit("B4", ether=1000000)
        tb.increment_current_block()
        ret_b = tb.withdraw("B4")
        ret_a = tb.withdraw("A4")
        self.assertEqual(ret_b,
            1000000 * PRINCIPAL_RATIO_PPT * ETHER2WEI / PPT)
        self.assertEqual(ret_a + ret_b, 1000000 * ETHER2WEI + 3 * PPT)

    def test_three_users_magnitude(self):
        tb = TestKlass()
        tb.deposit("A5", wei=3 * PPT)
        tb.deposit("B5", ether=1000000)
        tb.deposit("C5", ether=1)
        tb.increment_current_block()
        ret_b = tb.withdraw("B5")
        ret_c = tb.withdraw("C5")
        ret_a = tb.withdraw("A5")

        self.assertEqual(ret_b,
            1000000 * PRINCIPAL_RATIO_PPT * ETHER2WEI / PPT)

        fee_b = 1000000 * FEE_RATIO_PPT * ETHER2WEI / PPT
        self.assertEqual(ret_c,
            (fee_b) / (1 * ETHER2WEI / PPT + 3) * 1 * ETHER2WEI / PPT +
            1 * PRINCIPAL_RATIO_PPT * ETHER2WEI / PPT
        )
        self.assertEqual(ret_a + ret_b + ret_c, 1000001 * ETHER2WEI + 3 * PPT)

    def test_three_users_magnitude_bis(self):
        tb = TestKlass()
        tb.deposit("A6", wei=3 * PPT)
        tb.deposit("B6", ether=1000000)
        tb.deposit("C6", ether=40)
        tb.increment_current_block()
        ret_c = tb.withdraw("C6")
        ret_b = tb.withdraw("B6")
        ret_a = tb.withdraw("A6")

        self.assertEqual(ret_a + ret_b + ret_c, 1000040 * ETHER2WEI + 3 * PPT)
        self.assertEqual(ret_c, 39 * ETHER2WEI)
        fee_c = 1 * ETHER2WEI

        self.assertEqual(ret_b,
            (fee_c) / (1000000 * ETHER2WEI / PPT + 3) * 1000000 * ETHER2WEI / PPT +
            1000000 * PRINCIPAL_RATIO_PPT * ETHER2WEI / PPT
        )

    def test_five_users(self):
        tb = TestKlass()
        tb.deposit("A7", ether=70000)
        tb.deposit("B7", ether=7000)
        tb.deposit("C7", ether=700)
        tb.deposit("D7", ether=70)
        tb.deposit("E7", ether=7)
        tb.increment_current_block()
        ret_a = tb.withdraw("A7")
        ret_b = tb.withdraw("B7")
        ret_c = tb.withdraw("C7")
        ret_d = tb.withdraw("D7")
        ret_e = tb.withdraw("E7")

        self.assertEqual(
            ret_a + ret_b + ret_c + ret_d + ret_e,
            77777 * ETHER2WEI
        )
        self.assertEqual(ret_a, 70000 * PRINCIPAL_RATIO_PPT * ETHER2WEI / PPT)
        self.assertEqual(ret_b, 8400157514000000000000L)
        self.assertEqual(ret_c, 997673410300000000000L)
        # approximations for ret_b and ret_c
        # self.assertEqual(ret_b,
        #   7000 * PRINCIPAL_RATIO_PPT * ETHER2WEI / PPT +
        #   70000 * FEE_RATIO_PPT * ETHER2WEI / PPT * 7000 / 7777
        # )
        # self.assertEqual(ret_c,
        #   700 * PRINCIPAL_RATIO_PPT * ETHER2WEI / PPT +
        #   7000 * FEE_RATIO_PPT * ETHER2WEI / PPT * 700 / 777 +
        #   70000 * FEE_RATIO_PPT * ETHER2WEI / PPT * 700 / 7777
        # )

    def test_thousand_users(self):
        tb = TestKlass()
        N = 10000
        S = 7
        for i in range(N):
            address = "X" + str(i)
            tb.deposit(address, ether=S)

        tb.increment_current_block()

        total_withdraw = 0
        for i in range(N):
            address = "X" + str(i)
            r = tb.withdraw(address)
            total_withdraw += r
        self.assertEqual(total_withdraw, N * S * ETHER2WEI)


    def test_random(self):
        tb = TestKlass()
        N = 10000
        total_deposit = 0
        for i in range(N):
            address = "X" + str(i)
            amount_eth = random.randint(1, 100000)
            amount_wei = random.randint(1, ETHER2WEI - 1)

            total_deposit += amount_eth * ETHER2WEI + amount_wei
            tb.deposit(address, ether=amount_eth, wei=amount_wei)

        tb.increment_current_block()

        total_withdraw = 0
        for i in range(N):
            address = "X" + str(i)
            r = tb.withdraw(address)
            total_withdraw += r

        self.assertEqual(total_withdraw, total_deposit)

    def test_random_reward(self):
        tb = TestKlass()
        N = 1000
        tb.deposit("alpha", ether=100)
        alpha_reward = 0

        total_deposit = 0
        total_withdrawal =0
        for i in range(N):
            address = "X" + str(i)
            amount_eth = random.randint(0, 10**6)
            amount_wei = random.randint(1, ETHER2WEI - 1)
            amount = (amount_eth * ETHER2WEI + amount_wei)
            tb.deposit(address, ether=amount_eth, wei=amount_wei)
            tb.increment_current_block()
            r = tb.withdraw(address)
            total_deposit += amount
            total_withdrawal += r

            alpha_reward +=  amount / PPT * FEE_RATIO_PPT

        r = tb.withdraw("alpha")

        self.assertEqual(r, 100 * ETHER2WEI + alpha_reward)
        self.assertEqual(total_deposit - total_withdrawal, alpha_reward)

    def test_sequence(self):
        self.test_five_users()
        self.test_thousand_users()
        self.test_three_users_magnitude()

    def test_multiple_deposits_per_address(self):
        tb = TestKlass()
        tb.deposit("A", ether=40)
        tb.deposit("B", ether=40)

        tb.deposit("C", ether=800)
        ret_c = tb.withdraw("C")  # both A and B get 10 reward

        tb.deposit("B", ether=70)  # B now has a principal of 40+10+70
                                   # while A's principal is still 40
                                   # and A's reward is 10

        tb.deposit("D", ether=160)
        ret_d = tb.withdraw("D")  # A gets 1 and B gets 3 reward

        ret_a = tb.withdraw("A")  # B gets 1 reward
        ret_b = tb.withdraw("B")

        self.assertEqual(
            ret_a + ret_b + ret_c + ret_d, (880 + 70 + 160) * ETHER2WEI
        )
        self.assertEqual(ret_b, (40 + 10 + 70 + 3 + 1) * ETHER2WEI)


if __name__ == '__main__':
    unittest.main()
