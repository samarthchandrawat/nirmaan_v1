// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract WorkerPayments {
    struct Payment {
        uint256 amount;
        address employer;
        uint256 timestamp;
    }

    mapping(address => Payment[]) public workerPayments;

    event PaymentMade(address indexed worker, address indexed employer, uint256 amount, uint256 timestamp);

    function payWorker(address worker) external payable {
        require(msg.value > 0, "Payment must be greater than 0");

        Payment memory newPayment = Payment({
            amount: msg.value,
            employer: msg.sender,
            timestamp: block.timestamp
        });

        workerPayments[worker].push(newPayment);

        emit PaymentMade(worker, msg.sender, msg.value, block.timestamp);
    }

    // ✅ FIX: Return separate arrays instead of struct[]
    function getWorkerPayments(address worker) external view returns (
        uint256[] memory amounts,
        address[] memory employers,
        uint256[] memory timestamps
    ) {
        uint256 length = workerPayments[worker].length;
        amounts = new uint256[](length);
        employers = new address[](length);
        timestamps = new uint256[](length);

        for (uint256 i = 0; i < length; i++) {
            Payment storage payment = workerPayments[worker][i];
            amounts[i] = payment.amount;
            employers[i] = payment.employer;
            timestamps[i] = payment.timestamp;
        }
    }
}
