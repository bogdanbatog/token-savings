import unittest


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
        ret = tb.withdraw("A1")
        self.assertEqual(ret, 100 * ETHER2WEI)

    def test_two_users(self):
        tb = TestKlass()
        tb.deposit("A2", ether=100)
        tb.deposit("B2", ether=100)
        ret_a = tb.withdraw("A2")
        ret_b = tb.withdraw("B2")
        self.assertEqual(ret_a + ret_b, (100 + 100) * ETHER2WEI)
        self.assertEqual(ret_a, 100 * PRINCIPAL_RATIO_PPT * ETHER2WEI / PPT)

    def test_two_diff_users(self):
        tb = TestKlass()
        tb.deposit("A3", ether=100)
        tb.deposit("B3", ether=100000)
        ret_a = tb.withdraw("A3")
        ret_b = tb.withdraw("B3")
        self.assertEqual(ret_a + ret_b, (100 + 100000) * ETHER2WEI)
        self.assertEqual(ret_a, 100 * PRINCIPAL_RATIO_PPT * ETHER2WEI / PPT)

    def test_two_users_magnitude(self):
        tb = TestKlass()
        tb.deposit("A4", wei=3 * PPT)
        tb.deposit("B4", ether=1000000)
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

        total_withdraw = 0
        for i in range(N):
            address = "X" + str(i)
            r = tb.withdraw(address)
            total_withdraw += r
        self.assertEqual(total_withdraw, N * S * ETHER2WEI)

    def test_sequence(self):
        self.test_five_users()
        self.test_thousand_users()
        self.test_three_users_magnitude()


if __name__ == '__main__':
    unittest.main()
