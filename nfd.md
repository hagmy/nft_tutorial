# 実装から読み解くNFT

## NFTの規格
NFTで使用される規格としてERC721とERC1155が存在する。
(ERC: Ethereum Request for Comment)

## ERC721
大体のNFTの実装はopenzeppelinが提供するライブラリを継承しているらしい。

492行で記述されているERC721の[ソースコード](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC721/ERC721.sol)は至ってシンプル！

6個の変数と幾つかの関数

### 変数
1. `string private _name;`
    - トークンの名前
    - ex. haga
2. `string private _symbol;`
    - トークンのシンボル (単位)
    - ex. hg
3. `mapping(uint256 => address) private _owners;`
    - solidityの`mapping`はハッシュみたいなもの
    - uint256型であるトークンIDをキーとしてaddress型の所有者のアドレスをリターン
    - ex. ID=1111のトークンをアドレス=0x2222の人が持っていた場合
      - _owners[1111] == 0x2222
4. `mapping(address => uint256) private _balances;`
    - トークンの所有数
    - 所有者のアドレスをキーとして所有数をリターン
    - balance: 残高
5. `mapping(uint256 => address) private _tokenApprovals;`
    - トークンIDをキーとしてアドレスをリターン
    - アドレスはトークンのgiverだったりtakerだったりする
6. `mapping(address => mapping(address => bool)) private _operatorApprovals;`


### 関数

トークン発行
```solidity
function _mint(address to, uint256 tokenId) internal virtual {
    if (to == address(0)) { // 変数toが空の場合は無効処理
        revert ERC721InvalidReceiver(address(0));
    }
    if (_exists(tokenId)) { // tokenIdが既に存在していた場合は無効処理
        revert ERC721InvalidSender(address(0));
    }

    // トークン交換前のバリデーションで主に使用される
    _beforeTokenTransfer(address(0), to, tokenId, 1);

    // Check that tokenId was not minted by `_beforeTokenTransfer` hook
    if (_exists(tokenId)) {
        revert ERC721InvalidSender(address(0));
    }

    // uncheckedはアンダーフロー・オーバーフローの対応をする
    unchecked {
        // Will not overflow unless all 2**256 token ids are minted to the same owner.
        // Given that tokens are minted one by one, it is impossible in practice that
        // this ever happens. Might change if we allow batch minting.
        // The ERC fails to describe this case.
        _balances[to] += 1;
    }

    // トークンの所有者を送信者に変更する
    _owners[tokenId] = to;

    // emitによりTransfer event完了時にフロントエンドに通知する
    // solidityにおいてEventとはスマートコントラクトが発火することで呼び出される信号を指す
    emit Transfer(address(0), to, tokenId);

    _afterTokenTransfer(address(0), to, tokenId, 1);
}
```

NFT交換
```solidity
function _transfer(address from, address to, uint256 tokenId) internal virtual {
  // ownerOf関数はtokenIdを引数にしてそのtokenId所有者のアドレスをリターンする
  address owner = ownerOf(tokenId);
  if (owner != from) {
      revert ERC721IncorrectOwner(from, tokenId, owner);
  }
  if (to == address(0)) {
      revert ERC721InvalidReceiver(address(0));
  }

  _beforeTokenTransfer(from, to, tokenId, 1);

  // Check that tokenId was not transferred by `_beforeTokenTransfer` hook
  owner = ownerOf(tokenId);
  if (owner != from) {
      revert ERC721IncorrectOwner(from, tokenId, owner);
  }

  // tokenIdがキーの要素を消去
  delete _tokenApprovals[tokenId];

  // Decrease balance with checked arithmetic, because an `ownerOf` override may
  // invalidate the assumption that `_balances[from] >= 1`.
  _balances[from] -= 1;

  unchecked {
      // `_balances[to]` could overflow in the conditions described in `_mint`. That would require
      // all 2**256 token ids to be minted, which in practice is impossible.
      _balances[to] += 1;
  }

  // tokenIdの所有者を送信者に更新
  _owners[tokenId] = to;

  emit Transfer(from, to, tokenId);

  _afterTokenTransfer(from, to, tokenId, 1);
}
```

以上のように、NFTはトークンIdをユーザのアドレスに紐付け、tokenIdの所有者を複数人持つことのできない規格によって、非代替性を担保している。

ここだけ、見ればNFTが証明しているのはユーザがトークンIdを所有していることだけである。

つまり、画像でもその画像のURLをユーザが所有していることを証明してはいない。
