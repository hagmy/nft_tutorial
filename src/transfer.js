const { ethers } = require("ethers");
const contract = require('../artifacts/contracts/HagMyNFT.sol/HagMyNFT.json');

const from = process.argv[2];
const to = process.argv[3];
const tokenId = process.argv[4];

const abi = contract.abi;
const contractAddress = "0x5fbdb2315678afecb367f032d93f642f64180aa3";
const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545/");


async function transfer() {
  try {
    const signer = await provider.getSigner();
    const hagMyNFT = new ethers.Contract(contractAddress, abi, signer);
    await hagMyNFT.transfer(from, to, tokenId);
  } catch (e) {
    console.error(e);
  }
}

transfer()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
