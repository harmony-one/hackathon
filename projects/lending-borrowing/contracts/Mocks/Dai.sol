pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Dai is ERC20 {
    constructor(uint256 amount) public ERC20("DAI", "DAI") {
        _mint(msg.sender, amount);
    }

    function mint(uint256 amount) public {
        _mint(msg.sender, amount);
    }
}
