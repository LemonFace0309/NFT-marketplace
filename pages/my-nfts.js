/* eslint-disable @next/next/no-img-element */
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Web3Modal from 'web3modal';

import { nftAddress, nftMarketAddress } from '../config';
import NFT from '../artifacts/contracts/NFT.sol/NFT.json';
import Market from '../artifacts/contracts/NFTMarket.sol/NFTMarket.json';

const MyNFTs = () => {
  const [nfts, setNFTs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadNFTs = async () => {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    const marketContract = new ethers.Contract(nftMarketAddress, Market.abi, signer);
    const tokenContract = new ethers.Contract(nftAddress, NFT.abi, provider);
    const data = await marketContract.fetchMyNFTs();
    console.debug(3);

    const items = await Promise.all(
      data.map(async (item) => {
        const tokenUri = await tokenContract.tokenURI(item.tokenId);
        const meta = await axios.get(tokenUri);
        const price = ethers.utils.formatUnits(item.price.toString(), 'ether');
        const newItem = {
          price,
          tokenId: item.tokenId.toNumber(),
          seller: item.seller,
          owner: item.owner,
          image: meta.data.iamge,
        };
        return newItem;
      })
    );
    setNFTs(items);
    setIsLoading(false);
  };

  useEffect(() => {
    loadNFTs();
  }, []);

  if (isLoading || !nfts.length) return <h1 className="px-20 py-10 text-3xl">You don&#39;t own any NFTs</h1>;

  return (
    <div className="flex justify-center">
      <div className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {nfts.map((nft) => (
            <div key={nft.tokenId} className="border shadow rounded-xl overflow-hidden">
              <img src={nft.image} alt="An NFT" className="rounded" />
              <div className="p-4 bg-black">
                <p className="text-2xl font-bold text-white">Price - {nft.price} Matic</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyNFTs;
