// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract CampusCoin is ERC20, AccessControl {
    bytes32 public constant REWARD_MANAGER = keccak256("REWARD_MANAGER");

    constructor() ERC20("CampusCoin", "CAMP") {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(REWARD_MANAGER, msg.sender);
    }

    function mint(address to, uint256 amount) external onlyRole(REWARD_MANAGER) {
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) external onlyRole(REWARD_MANAGER) {
        _burn(from, amount);
    }
}
