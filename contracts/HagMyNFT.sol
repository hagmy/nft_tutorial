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
