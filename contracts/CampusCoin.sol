// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract CampusCoin is ERC20, AccessControl {
    // 1. Define a specific role for Faculty members
    bytes32 public constant FACULTY_ROLE = keccak256("FACULTY_ROLE");

    // 2. Define an event to record history on the blockchain
    // This allows us to see "Student X got 50 coins for Winning Hackathon" later
    event RewardDistributed(address indexed student, uint256 amount, string reason);

    constructor() ERC20("CampusCoin", "CAMP") {
        // Grant the deployer (You/Admin) the highest permissions
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        
        // Grant the deployer Faculty permissions too (for testing)
        _grantRole(FACULTY_ROLE, msg.sender);
    }

    // 3. The Function for Faculty to give rewards
    // 'reason' is where they type "1st Place in Sports"
    function rewardStudent(address student, uint256 amount, string memory reason) external onlyRole(FACULTY_ROLE) {
        _mint(student, amount);
        emit RewardDistributed(student, amount, reason);
    }

    // 4. Standard Mint function (Admin only) - fallback if needed
    function mint(address to, uint256 amount) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _mint(to, amount);
    }

    // 5. Burn function (Admin only) - to remove coins from circulation
    function burn(address from, uint256 amount) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _burn(from, amount);
    }
}