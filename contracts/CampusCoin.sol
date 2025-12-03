// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract CampusCoin is ERC20, AccessControl {
    bytes32 public constant FACULTY_ROLE = keccak256("FACULTY_ROLE");

    // Event for the Public Ledger
    event RewardPaid(address indexed from, address indexed to, uint256 amount, string reason);

    constructor() ERC20("CampusCoin", "CAMP") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(FACULTY_ROLE, msg.sender);

        // 1. FUND THE ADMIN WITH 1 MILLION COINS INITIALLY
        // This ensures the Admin has money to give to students
        _mint(msg.sender, 1000000 * 10**decimals());
    }

    // 2. REWARD FUNCTION (MOVES MONEY, DOES NOT PRINT IT)
    function rewardStudent(address student, uint256 amount, string memory reason) external onlyRole(FACULTY_ROLE) {
        // Transfer from the Sender (Admin/Faculty) to the Student
        // This decreases Admin balance and increases Student balance
        _transfer(msg.sender, student, amount);
        
        // Log it for the Ledger
        emit RewardPaid(msg.sender, student, amount, reason);
    }
}