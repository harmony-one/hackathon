pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Pool {

    IERC20 token;

    mapping(address => uint256) liquidity;
    mapping(address => uint256) borrower;
 
    constructor (IERC20 _token) {
        token = _token;
    }
    function addLiquidity(uint256 amount) public {
        // approval required
        token.transferFrom(msg.sender,address(this), amount);
        liquidity[msg.sender] += amount;
    }

    function borrowLiquidity(uint256 amount) public {
        require(amount <= token.balanceOf(address(this)), "insufficient funds");
        token.transfer(msg.sender,amount);
        borrower[msg.sender] += amount;
    } 

    function paybackLoan(uint256 amount) public {
        require(amount <= borrower[msg.sender], "payback money exceeds borrowed");
        token.transferFrom(msg.sender, address(this), amount);
    }

    function withdrawLiquidity(uint256 amount ) public {
        require(amount <= token.balanceOf(address(this)), "insufficient funds" );
        require(amount <= liquidity[msg.sender], "amount exceeds liquidity provided");
        token.transfer(msg.sender, amount);
    }
}