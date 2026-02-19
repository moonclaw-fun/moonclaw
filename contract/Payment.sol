// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

contract Payment {
    // Event emitted when ETH is deposited
    event Deposit(address indexed sender, uint256 amount);

    // Event emitted when ETH is withdrawn
    event Withdraw(address indexed recipient, uint256 amount);

    /// @notice Deposit ETH into the contract
    receive() external payable {
        emit Deposit(msg.sender, msg.value);
    }

    /// @notice Deposit ETH into the contract (explicit function)
    function deposit() external payable {
        emit Deposit(msg.sender, msg.value);
    }

    /// @notice Withdraw a specified amount of ETH to msg.sender
    /// @param amount The amount of ETH to withdraw (must be <= contract balance)
    function withdraw(uint256 amount) external {
        require(
            amount <= address(this).balance,
            "Insufficient contract balance"
        );

        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");

        emit Withdraw(msg.sender, amount);
    }

    /// @notice Get the current balance of the contract
    /// @return The contract balance in wei
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
