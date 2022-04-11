const { ethers } = require("hardhat");

require("dotenv").config({path: ".env"});

async function main() {
    // URL from where we can get the metadata for Punks

    const metadataURL = "ipfs://Qmbygo38DWF1V8GttM1zy89KzyZTPU2FLUzQtiDvB7q6i5/";

    const punksContract = await ethers.getContractFactory("Punks");

    // *  Deploy
    const deployPunkContract = await punksContract.deploy(metadataURL);

    await deployPunkContract.deployed();

    // print contract address
    console.log("Punks contract address: ", deployPunkContract.address);

}

// !   Calling Main function

main()
  .then(() => process.exit(0))
  .catch((error) => {
      console.error(error);
      process.exit(1);
  });




  //   ^   Deployed Contract Address = 