const { ethers } = require("ethers");
const contract = require('../artifacts/contracts/HagMyNFT.sol/HagMyNFT.json');

const owner = process.argv[2];

const abi = contract.abi;
const contractAddress = "0x5fbdb2315678afecb367f032d93f642f64180aa3";
const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545/");


async function findNFTsByOwner() {
  try {
    const hagMyNFT = new ethers.Contract(contractAddress, abi, provider);
    const [tokenIds, imageUrls] = await hagMyNFT.findNFTsByOwner(owner);
    for(let i = 0; i < tokenIds.length; i++) {
      console.log(`token id: ${tokenIds[i]}, imageUrl: ${imageUrls[i]}`);
    }
  } catch (e) {
    console.error(e);
  }
}

findNFTsByOwner()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
