// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;
contract Counter{
    uint public count;
    string public name;
    constructor(uint _count, string memory _name){
        count = _count;
        name = _name;
    }
    function increment() public returns(uint newCount){
        count++;
        return count;
    }
    function decrement() public returns(uint newCount){
        count--;
        return count;
    }
    function getCount() public view returns (uint _count){
        return count;
    }
    function getName() public view returns (string memory _name) {
        return name;
    }
    function setName(string memory _name) public {
        name = _name;
    }
}