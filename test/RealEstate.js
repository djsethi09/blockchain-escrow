const { expect } = require('chai');
const { ethers } = require('hardhat');
const tokens = (n) => {
	return ethers.parseUnits(n.toString(), 'ether');
};
const ether = tokens;
describe('RealEstate', () => {
	let realEstate, escrow;
	let deployer, seller, inspector, lender;
	let nftID = 1;
	let purchasePrice = ether(100);
	let escrowAmount = ether(20);
	beforeEach(async () => {
		//setup accounts

		accounts = await ethers.getSigners();
		deployer = accounts[0];
		seller = deployer;
		buyer = accounts[1];
		inspector = accounts[2];
		lender = accounts[3];

		//Load contracts
		const RealEstate = await ethers.getContractFactory('RealEstate');
		const Escrow = await ethers.getContractFactory('Escrow');

		//Deploy contracts
		realEstate = await RealEstate.deploy();
		escrow = await Escrow.deploy(
			await realEstate.getAddress(),
			nftID,
			purchasePrice,
			escrowAmount,
			await seller.getAddress(),
			await buyer.getAddress(),
			await inspector.getAddress(),
			await lender.getAddress()
		);
		//seller approves NFT
		transaction = await realEstate
			.connect(seller)
			.approve(await escrow.getAddress(), nftID);
		await transaction.wait();
	});
	describe('Deployment', async () => {
		it('sends an NFT to the seller / deployer', async () => {
			expect(await realEstate.ownerOf(nftID)).to.equal(seller.address);
		});
	});
	describe('Selling real estate', async () => {
		let balance, transaction;
		it('executes a successful transaction', async () => {
			expect(await realEstate.ownerOf(nftID)).to.equal(
				await seller.getAddress()
			);
			//balance before earnest deposit
			balance = await escrow.getBalance();

			console.log('Escrow balance before:', balance);
			//buyer deposits earnest
			transaction = await escrow
				.connect(buyer) //try seller
				.depositEarnest({ value: ether(20) });
			await transaction.wait();
			//check escrow balance
			balance = await escrow.getBalance();
			console.log('escrow balance: ', ether(balance));
			//expect(balance).to.equal(escrowAmount);
			transaction = await escrow
				.connect(inspector) //try other - buyer
				.updateInspectionStatus(true); //try true
			await transaction.wait();
			console.log('Inspector updates status');

			//approvals
			transaction = await escrow.connect(buyer).approveSale();
			await transaction.wait();
			console.log('Buyer approves sale');
			transaction = await escrow.connect(seller).approveSale();
			await transaction.wait();
			console.log('Seller approves sale');

			//Lender funds sale
			transaction = await lender.sendTransaction({
				to: await escrow.getAddress(),
				value: ether(80),
			});
			transaction = await escrow.connect(lender).approveSale();
			await transaction.wait();
			console.log('Lender approves sale');
			//expect seller to receive funds
			balance = await ethers.provider.getBalance(await seller.getAddress());
			console.log('seller balance before sale: ', ethers.formatEther(balance));
			//finalize sale
			transaction = await escrow.connect(buyer).finalizeSale();
			await transaction.wait();

			//expect buyer to be NFT owner after sale
			expect(await realEstate.ownerOf(nftID)).to.equal(
				await buyer.getAddress()
			);

			//expect seller to receive funds
			balance = await ethers.provider.getBalance(await seller.getAddress());
			console.log('seller balance: ', ethers.formatEther(balance));
			expect(balance).to.be.above(ether(10099));
		});
	});
});
