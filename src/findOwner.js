const { ethers } = require("ethers");
const contract = require('../artifacts/contracts/HagMyNFT.sol/HagMyNFT.json');

const tokenId = process.argv[2];

const abi = contract.abi;
const contractAddress = "0x5fbdb2315678afecb367f032d93f642f64180aa3";
const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545/");


async function findOwner() {
  try {
    const hagMyNFT = new ethers.Contract(contractAddress, abi, provider);
    const owner = await hagMyNFT.findOwner(tokenId);
    console.log(`token id ${tokenId} is owned by ${owner}`);
  } catch (e) {
    console.error(e);
  }
}

findOwner()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
