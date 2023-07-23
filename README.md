## 初期設定
node v12以上で動くはず！
```bash
npm init --yes
npm install --save-dev hardhat
npm install @openzeppelin/contracts web3 ethers
npx hardhat
# What do you want to do? · Create a JavaScript project
# Do you want to install this sample project's dependencies with npm (@nomicfoundation/hardhat-toolbox)? y
npx hardhat test
# 全てpassingすればokay!
```

## コントラクトの作成
`contracts/Lock.sol`を好きなファイル名に変更して、以下のように書き換える

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract HagMyNFT is ERC721Enumerable, Ownable {
  event Minted(address indexed owner, uint256 indexed tokenId, string imageUrl);

  struct TokenMetadata {
    string imageUrl;
  }

  mapping(uint256 => TokenMetadata) private _tokenMetadata;

  constructor(string memory name, string memory symbol) ERC721(name, symbol) {}

  // mint NFT with image url
  function mint(string memory imageUrl) external {
    uint256 tokenId = totalSupply() + 1;
    address owner = msg.sender;
    _mint(owner, tokenId);
    _setTokenMetadata(tokenId, imageUrl);

    emit Minted(owner, tokenId, imageUrl);
  }

  function _setTokenMetadata(uint256 tokenId, string memory imageUrl) internal {
    _tokenMetadata[tokenId] = TokenMetadata({ imageUrl: imageUrl });
  }

  // get token image url from token id
  function getTokenImageUrl(uint256 tokenId) public view returns (string memory) {
    return _tokenMetadata[tokenId].imageUrl;
  }

  // transfer token from token's owner node to another node
  function transfer(address from, address to, uint256 tokenId) public {
    require(ownerOf(tokenId) == from, "You are not this NFT owner");
    safeTransferFrom(from, to, tokenId);
  }

  // find NFT information by owner address
  function findNFTsByOwner(address owner) external view returns(uint256[] memory, string[] memory) {
    uint256 balance = balanceOf(owner);
    uint256[] memory tokenIds = new uint256[](balance);
    string[] memory imageUrls = new string[](balance);

    for (uint256 i = 0; i < balance; i++) {
      uint256 tokenId = tokenOfOwnerByIndex(owner, i);
      tokenIds[i] = tokenId;
      imageUrls[i] = _tokenMetadata[tokenId].imageUrl;
    }

    return (tokenIds, imageUrls);
  }

  // find token's owner from token id
  function findOwner(uint256 tokenId) public view returns (address) {
    return ownerOf(tokenId);
  }
}

```

`hardhat.config.js`に記載されているsolidityのバージョンとコントラクトのsolidityのバージョンが一致するか確認

```javascript
require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.9",
};

```

作成したコントラクトをhardhat上にコンパイル

```bash
npx hardhat compile
# file successfullydが出力されたら良し！
```

## deploy scriptの作成
deploy scriptによってhardhat上にコントラクトをデプロイさせる！

```javascript
// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying contracts with the accounts: ${deployer.address}\n`);

  const HagMyNFT = await ethers.getContractFactory("HagMyNFT");
  const hagMyNFT = await HagMyNFT.deploy("HagMyNFT", "HMNFT");

  const contractAddress = await hagMyNFT.getAddress();
  console.log(`contract address: ${contractAddress}\n`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

```

以下コマンドでnodeを作成してdeployする

```bash
npx hardhat node # nodeの作成
```

別ターミナルを開いて以下を実行してdeploy
```bash
npx hardhat run scripts/deploy.js --network localhost
```

## 各コントラクトの機能を実行するスクリプトの作成

これから作成するファイルは以下コマンドで実行する
```bash
node [script-name] some arguments...
```

### mint.js

```javascript
const { ethers } = require("ethers");
const contract = require('../artifacts/contracts/HagMyNFT.sol/HagMyNFT.json');

const imageUrl = process.argv[2];

const abi = contract.abi;
const contractAddress = "0x5fbdb2315678afecb367f032d93f642f64180aa3";
const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545/");


async function mint() {
  try {
    const signer = await provider.getSigner();
    const hagMyNFT = new ethers.Contract(contractAddress, abi, signer);
    await hagMyNFT.mint(imageUrl);
  } catch (e) {
    console.error(e);
  }
}

mint()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });

```

### transfer.js

```javascript
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

```

### findOwner.js

```javascript
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

```

### findNFTsByOwner.js

```javascript
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

```

### getTokenImageUrl.js

```javascript
const { ethers } = require("ethers");
const contract = require('../artifacts/contracts/HagMyNFT.sol/HagMyNFT.json');

const tokenId = process.argv[2];

const abi = contract.abi;
const contractAddress = "0x5fbdb2315678afecb367f032d93f642f64180aa3";
const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545/");


async function getTokenImageUrl() {
  try {
    const hagMyNFT = new ethers.Contract(contractAddress, abi, provider);
    const imageUrl = await hagMyNFT.getTokenImageUrl(tokenId);
    console.log(`token id ${tokenId} has ${imageUrl}`);
  } catch (e) {
    console.error(e);
  }
}

getTokenImageUrl()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });

```
