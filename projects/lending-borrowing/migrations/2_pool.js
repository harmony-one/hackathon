const Migrations = artifacts.require("Pool");

let tokenAddress = "0x0000000000000000000000000000000000000000"; // token address of an erc20

module.exports = function (deployer) {
  deployer.deploy(Migrations, tokenAddress);
};
