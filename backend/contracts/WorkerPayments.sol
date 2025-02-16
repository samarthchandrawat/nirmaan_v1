// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract WorkerPayments {
    // Struct to store worker payment details
    struct Payment {
        uint256 amount;
        address employer;
        uint256 timestamp;
    }

    // Struct to store assignment details
    struct Assignment {
        address contractor;
        uint256 payment;
        uint256 expirationDate;
        string status; // "unpaid", "paid", "dispute"
    }

    // Mapping to store payments for each worker
    mapping(address => Payment[]) public workerPayments;

    // Mapping to store assignments for each worker
    mapping(address => Assignment[]) public workerAssignments;

    // Event for payment made
    event PaymentMade(address indexed worker, address indexed employer, uint256 amount, uint256 timestamp);

    // Event for assignment creation
    event WorkAssigned(address indexed worker, address indexed contractor, uint256 payment, uint256 expirationDate, string status);

    // Event for dispute raised
    event DisputeRaised(address indexed worker, uint256 assignmentId);

    // Event for payment released
    event PaymentReleased(address indexed worker, uint256 assignmentId, uint256 amount, uint256 timestamp);

    // Function for contractors to assign work to a worker
    function assignWork(
        address worker,
        uint256 workDays,    // Changed from 'days' to 'workDays'
        uint256 payment
    ) external {
        require(payment > 0, "Payment must be greater than 0");

        // Calculate expiration date
        uint256 expirationDate = block.timestamp + (workDays * 1 days); // Use workDays instead of days

        // Create a new assignment
        Assignment memory newAssignment = Assignment({
            contractor: msg.sender,
            payment: payment,
            expirationDate: expirationDate,
            status: "unpaid"
        });

        // Save the assignment for the worker
        workerAssignments[worker].push(newAssignment);

        emit WorkAssigned(worker, msg.sender, payment, expirationDate, "unpaid");
    }

    // Function to view assignments for a worker
    function getWorkerAssignments(address worker) external view returns (
        uint256[] memory payments,
        address[] memory contractors,
        uint256[] memory expirationDates,
        string[] memory statuses
    ) {
        uint256 length = workerAssignments[worker].length;
        payments = new uint256[](length);
        contractors = new address[](length);
        expirationDates = new uint256[](length);
        statuses = new string[](length);

        for (uint256 i = 0; i < length; i++) {
            Assignment storage assignment = workerAssignments[worker][i];
            payments[i] = assignment.payment;
            contractors[i] = assignment.contractor;
            expirationDates[i] = assignment.expirationDate;
            statuses[i] = assignment.status;
        }
    }

    // Function for the contractor to release payment to the worker
    function releasePayment(address worker, uint256 assignmentId) external payable {
        Assignment storage assignment = workerAssignments[worker][assignmentId];

        // Ensure the contractor is the one releasing payment
        require(msg.sender == assignment.contractor, "Only the contractor can release payment");
        require(keccak256(abi.encodePacked(assignment.status)) == keccak256(abi.encodePacked("unpaid")), "Payment already released or disputed");
        require(msg.value == assignment.payment, "Payment amount does not match the assignment payment");

        // Record the payment for the worker
        workerPayments[worker].push(Payment({
            amount: msg.value,
            employer: msg.sender,
            timestamp: block.timestamp
        }));

        // Update the assignment status to "paid"
        assignment.status = "paid";

        emit PaymentReleased(worker, assignmentId, msg.value, block.timestamp);
        emit PaymentMade(worker, msg.sender, msg.value, block.timestamp);
    }

    // Function to raise a dispute
    function raiseDispute(address worker, uint256 assignmentId) external {
        Assignment storage assignment = workerAssignments[worker][assignmentId];

        // Ensure the contractor or worker can raise dispute
        require(msg.sender == assignment.contractor || msg.sender == worker, "Only contractor or worker can raise dispute");

        // If the assignment has expired, mark it as "dispute"
        if (block.timestamp >= assignment.expirationDate) {
            assignment.status = "dispute";
        }

        emit DisputeRaised(worker, assignmentId);
    }

    // ✅ Get Worker Payments
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
