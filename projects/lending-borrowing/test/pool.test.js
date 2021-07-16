const { expect } = require("chai");
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");

const Pool = artifacts.require("Pool");
const Dai = artifacts.require("Dai");

contract("Pool", (accounts) => {
  let pool;
  let dai;
  before(async () => {
    dai = await Dai.new(10000);
    pool = await Pool.new(dai.address);
  });

  it("should be able to invest", async () => {
    await dai.approve(pool.address, 5000, { from: accounts[0] });
    await pool.addLiquidity(5000);
    const balance = await dai.balanceOf(pool.address);
    expect(balance.toNumber()).to.be.equal(5000);
  });

  it("should be able to borrow money", async () => {
    await pool.borrowLiquidity(4000, { from: accounts[1] });
    const poolBalance = await dai.balanceOf(pool.address);
    const account1Balance = await dai.balanceOf(accounts[1]);
    expect(poolBalance.toNumber()).to.be.equal(1000);
    expect(account1Balance.toNumber()).to.be.equal(4000);
  });

  it("should be able to payback loan", async () => {
    await dai.approve(pool.address, 4000, { from: accounts[1] });
    await pool.paybackLoan(4000, { from: accounts[1] });
    const poolBalance = await dai.balanceOf(pool.address);
    const account1Balance = await dai.balanceOf(accounts[1]);
    expect(poolBalance.toNumber()).to.be.equal(5000);
    expect(account1Balance.toNumber()).to.be.equal(0);
  });

  it("should be able to withdrawLiquidity", async () => {
    await pool.withdrawLiquidity(5000);
    const account0balance = await dai.balanceOf(accounts[0]);
    expect(account0balance.toNumber()).to.be.equal(10000);
  });
});
