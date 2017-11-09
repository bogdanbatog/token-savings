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
        tb.deposit("A", ether=100)
        ret = tb.withdraw("A")
        self.assertEqual(ret, 100 * ETHER2WEI)

    def test_two_users(self):
        tb = TestKlass()
        tb.deposit("A", ether=100)
        tb.deposit("B", ether=100)
        ret_a = tb.withdraw("A")
        ret_b = tb.withdraw("B")
        self.assertEqual(ret_a + ret_b, (100 + 100) * ETHER2WEI)
        self.assertEqual(ret_a, 100 * PRINCIPAL_RATIO_PPT * ETHER2WEI / PPT)

    def test_two_diff_users(self):
        tb = TestKlass()
        tb.deposit("A", ether=100)
        tb.deposit("B", ether=100000)
        ret_a = tb.withdraw("A")
        ret_b = tb.withdraw("B")
        self.assertEqual(ret_a + ret_b, (100 + 100000) * ETHER2WEI)
        self.assertEqual(ret_a, 100 * PRINCIPAL_RATIO_PPT * ETHER2WEI / PPT)

    def test_two_users_magnitude(self):
        tb = TestKlass()
        tb.deposit("A", wei=3000)
        tb.deposit("B", ether=1000000)
        ret_b = tb.withdraw("B")
        ret_a = tb.withdraw("A")
        self.assertEqual(ret_b,
            1000000 * PRINCIPAL_RATIO_PPT * ETHER2WEI / PPT)
        self.assertEqual(ret_a + ret_b, 1000000 * ETHER2WEI + 3000)

    def test_three_users_magnitude(self):
        tb = TestKlass()
        tb.deposit("A", wei=3000)
        tb.deposit("B", ether=1000000)
        tb.deposit("C", ether=1)
        ret_b = tb.withdraw("B")
        ret_c = tb.withdraw("C")
        ret_a = tb.withdraw("A")
        self.assertEqual(ret_b,
            1000000 * PRINCIPAL_RATIO_PPT * ETHER2WEI / PPT)
        self.assertEqual(ret_c,
            1000000 * FEE_RATIO_PPT * ETHER2WEI / PPT +
            1 * PRINCIPAL_RATIO_PPT * ETHER2WEI / PPT
        )
        self.assertEqual(ret_a + ret_b + ret_c, 1000001 * ETHER2WEI + 3000)

    def test_three_users_magnitude_bis(self):
        tb = TestKlass()
        tb.deposit("A", wei=3000)
        tb.deposit("B", ether=1000000)
        tb.deposit("C", ether=40)
        ret_c = tb.withdraw("C")
        ret_b = tb.withdraw("B")
        ret_a = tb.withdraw("A")

        self.assertEqual(ret_a + ret_b + ret_c, 1000040 * ETHER2WEI + 3000)
        self.assertEqual(ret_c, 39 * ETHER2WEI)
        self.assertEqual(ret_b,
            1000000 * PRINCIPAL_RATIO_PPT * ETHER2WEI / PPT + 1 * ETHER2WEI)

    def test_five_users(self):
        tb = TestKlass()
        tb.deposit("A", ether=70000)
        tb.deposit("B", ether=7000)
        tb.deposit("C", ether=700)
        tb.deposit("D", ether=70)
        tb.deposit("E", ether=7)
        ret_a = tb.withdraw("A")
        ret_b = tb.withdraw("B")
        ret_c = tb.withdraw("C")
        ret_d = tb.withdraw("D")
        ret_e = tb.withdraw("E")

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
            user = "u" + str(i)
            tb.deposit(user, ether=S)

        total_withdraw = 0
        for i in range(N):
            user = "u" + str(i)
            r = tb.withdraw(user)
            total_withdraw += r
        self.assertEqual(total_withdraw, N * S * ETHER2WEI)


if __name__ == '__main__':
    unittest.main()
