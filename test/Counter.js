const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('Counter', () => {
	let counter;
	beforeEach(async () => {
		const Counter = await ethers.getContractFactory('Counter');
		counter = await Counter.deploy(1, 'Dheeraj');
	});
	describe('Deployment', () => {
		it('sets init count', async () => {
			const count = await counter.count();
			expect(count).to.equal(1);
		});
		it('sets name', async () => {
			const name = await counter.name();
			expect(name).to.equal('Dheeraj');
		});
	});
	describe('Transactions', () => {
		it('Increments the counter', async () => {
			let transaction = await counter.increment();
			await transaction.wait();
			expect(await counter.count()).to.equal(2);
		});
		it('Decrements the counter', async () => {
			let transaction = await counter.decrement();
			await transaction.wait();
			expect(await counter.count()).to.equal(0);

			await expect(counter.decrement()).to.be.reverted;
		});
		it('Sets name', async () => {
			let transaction = await counter.setName('Bharat');
			await transaction.wait();
			expect(await counter.name()).to.equal('Bharat');
		});
		it('Reads the variables from getters', async () => {
			expect(await counter.getName()).to.equal('Dheeraj');
		});
	});
});
