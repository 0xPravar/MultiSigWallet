// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract MultiSigWallet {
    address[] public owners;
    uint public threshold;

    struct Transfer {
        uint id;
        uint amount;
        address payable to;
        uint approvals;
        bool sent;
    }

    Transfer[] public transfers;

    mapping(address => mapping(uint => bool)) public approved;

    constructor(address[] memory _owners, uint _threshold) {
        owners = _owners;
        threshold = _threshold; 
    }

    modifier onlyOwners() {
        bool ownerCheck = false;
        for(uint i = 0; i < owners.length; i++) {
            if(msg.sender == owners[i]) {
                ownerCheck = true;
            }
        } 
        require(ownerCheck == true, "Not authorised");
        _;
    }
    
    function getOwners() external view returns(address[] memory) {
        return owners;
    }

    function createTransfer(uint _amount, address payable _to) external onlyOwners {
        transfers.push(Transfer(
            transfers.length,
            _amount,
            _to,
            0,
            false
        ));
    }

    function getTransfers() external view returns(Transfer[] memory) {
        return transfers;
    }

    function approveTransfer(uint id) external onlyOwners {
        require(transfers[id].sent == false, "Transfer is already executed");
        require(approved[msg.sender][id] == false, "Cannot approve Transfer again");

        approved[msg.sender][id] = true;
        transfers[id].approvals++;

        if(transfers[id].approvals >= threshold) {
            transfers[id].sent = true;
            address payable to = transfers[id].to;
            uint amount = transfers[id].amount;

            to.transfer(amount); // transfer funds
        }
    } 

    function deposit() external payable {}
}