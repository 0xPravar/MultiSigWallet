// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.

const hre = require("hardhat");

async function main() {

    //by defult hardhat generates 10 wallets. Fetching 04 here
    const [owner1, owner2, owner3, recipient] = await hre.ethers.getSigners(); 
    const threshold = 2;

    const MultiSigWallet = await hre.ethers.getContractFactory("MultiSigWallet");
    const wallet = await MultiSigWallet.deploy([owner1.address, owner2.address, owner3.address], threshold);

    await wallet.deployed();

    await wallet.deposit({value: 10});
    
    const recipientBalance = await hre.ethers.provider.getBalance(recipient.address);
    console.log(recipientBalance);

   /*  console.log(
        `Wallet deployed to ${wallet.address}`
    ); */
    
    //testing getOwners function
    const owners = await wallet.getOwners();

    /* console.log(
        `Owner are ${owners}`
    ); */
    
    const testTransfer = await wallet.connect(owner2).createTransfer(1, recipient.address);
    await testTransfer.wait();

    const transfers = await wallet.getTransfers();

    // console.log(transfers);

    //connecting wallet to particular address. by default it calls first one
    const approver1 = await wallet.connect(owner1).approveTransfer(0);
    await approver1.wait(); //wait for transaction to get recorded on blockchain

    const approver2 = await wallet.connect(owner2).approveTransfer(0);
    await approver2.wait(); //wait for transaction to get recorded on blockchain

    const transfers1 = await wallet.getTransfers();
    //console.log(transfers1);

    const recipientBalance1 = await hre.ethers.provider.getBalance(recipient.address);

    console.log(recipientBalance1);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
