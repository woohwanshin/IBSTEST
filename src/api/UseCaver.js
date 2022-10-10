import axios from "axios";
import Caver from "caver-js";
// import CounterABI from '../abi/CounterABI.json';
import KIP17ABI from "../abi/IBSTESTABI.json";
import {
  ACCESS_KEY_ID,
  SECRET_ACCESS_KEY,
  COUNT_CONTRACT_ADDRESS,
  NFT_CONTRACT_ADDRESS,
  CHAIN_ID,
} from "../constants";
const option = {
  headers: [
    {
      name: "Authorization",
      value:
        "Basic " +
        Buffer.from(ACCESS_KEY_ID + ":" + SECRET_ACCESS_KEY).toString("base64"),
    },
    { name: "x-chain-id", value: CHAIN_ID },
  ],
};

const caver = new Caver(
  new Caver.providers.HttpProvider(
    "https://node-api.klaytnapi.com/v1/klaytn",
    option
  )
);
const NFTContract = new caver.contract(KIP17ABI, NFT_CONTRACT_ADDRESS);

export const getTotalSupply = async () => {
  const res = await NFTContract.methods.totalSupply().call();
  return res;
}

export const fetchAllTokenList = async (totalSupply) => {
  const result = [];
  for(let i = 0; i < totalSupply; i++) {
    const res = await NFTContract.methods.tokenURI(i+1).call();
    result.push(res);
  }
  console.log(result)
  const data = [];
  for(let i = 0; i < result.length; i++) {
    const res = await axios(`https://ipfs.io/ipfs/${result[i].substring(7)}`)
    data.push({ uri: `https://ipfs.io/ipfs/${res.data.image.substring(7)}`, id: `${res.data.name}`, tokenId: `${i+1}` });
    console.log(res.data.image);
  }
  
  console.log(data)
  return data;
}

export const burnToken = async (id) => {
  const res = await NFTContract.methods.burn(id).call();
  console.log(res);
}

export const fetchCardsOf = async (address) => {
  // Fetch Balance
  const balance = await NFTContract.methods.balanceOf(address).call();
  console.log(`[NFT Balance]${balance}`);
  // Fetch Token IDs
  const tokenIds = [];
  for (let i = 0; i < balance; i++) {
    const id = await NFTContract.methods.tokenOfOwnerByIndex(address, i).call();
    tokenIds.push(id);
  }
  // Fetch Token URIs
  const tokenUris = [];
  for (let i = 0; i < balance; i++) {
    const uri = await NFTContract.methods.tokenURI(tokenIds[i]).call();
    tokenUris.push(uri);
  }
  console.log(tokenUris);
  const nfts = [];
  for (let i = 0; i < tokenUris.length; i++) {
    const res = await axios(`https://ipfs.io/ipfs/${tokenUris[i].substring(7)}`);
    console.log(res);
    nfts.push({ uri: `https://ipfs.io/ipfs/${res.data.image.substring(7)}`, id: `${res.data.name}`, tokenId: `${tokenIds[i]}`});
  }
  console.log(nfts);
  return nfts;
};

export const getBalance = (address) => {
  return caver.rpc.klay.getBalance(address).then((response) => {
    const balance = caver.utils.convertFromPeb(
      caver.utils.hexToNumberString(response)
    );
    console.log(`BALANCE: ${balance}`);
    return balance;
  });
};

// const CountContract = new caver.contract(CounterABI, COUNT_CONTRACT_ADDRESS);

// export const readCount = async () => {
//   const _count = await CountContract.methods.count().call();
//   console.log(_count);
// }

// export const setCount = async (newCount) => {
//   // 사용할 account 설정
//   try {
//     const privatekey = '0x26c8485748a7f9e9ae637a5c014f9955c2be9aa24ca8f1674e7e98c7123c9a4d';
//     const deployer = caver.wallet.keyring.createFromPrivateKey(privatekey);
//     caver.wallet.add(deployer);
//     // 스마트 컨트랙트 실행 트랜젝션 날리기
//     // 결과 확인

//     const receipt = await CountContract.methods.setCount(newCount).send({
//       from: deployer.address, // address
//       gas: "0x4bfd200"//
//     })
//     console.log(receipt);
//   } catch(e) {
//     console.log(`[ERROR_SET_COUNT]${e}`);
//   }

// }
