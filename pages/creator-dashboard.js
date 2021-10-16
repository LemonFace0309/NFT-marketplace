/* eslint-disable @next/next/no-img-element */
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Web3Modal from 'web3modal';

import { nftAddress, nftMarketAddress } from '../config';
import NFT from '../artifacts/contracts/NFT.sol/NFT.json';
import Market from '../artifacts/contracts/NFTMarket.sol/NFTMarket.json';

const CreatorDashboard = () => {
  const [nfts, setNFTs] = useState([]);
  const [sold, setSold] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadNFTs = async () => {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    const marketContract = new ethers.Contract(nftMarketAddress, Market.abi, signer);
    const tokenContract = new ethers.Contract(nftAddress, NFT.abi, provider);
    const data = await marketContract.fetchItemsCreated();
    console.debug('data:', data);

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
          image: meta.data.image,
        };
        return newItem;
      })
    );
    setNFTs(items);

    const soldItems = items.filter((item) => item.sold);
    setSold(soldItems);
    setIsLoading(false);
  };

  useEffect(() => {
    loadNFTs();
  }, []);

  if (isLoading || !nfts.length) return <h1 className="px-20 py-10 text-3xl">You haven&#39;t created any NFTs</h1>;

  return (
    <div>
      <div className="p-4">
        <h2 className="text-2xl py-2">Items Created</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {nfts.map((nft) => (
            <div key={nft.tokenId} className="border shadow rounded-xl overflow-hidden">
              <img src={nft.image} alt="An NFT" className="rounded-t" />
              <div className="p-4 bg-black">
                <p className="text-2xl font-bold text-white">Price - {nft.price} Eth</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="px-4">
        {Boolean(sold.length) && (
          <div>
            <h2 className="text-2xl py-2">Items sold</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
              {sold.map((nft) => (
                <div key={nft.tokenId} className="border shadow rounded-t-xl overflow-hidden">
                  <img src={nft.image} className="rounded" alt="An NFT" />
                  <div className="p-4 bg-black">
                    <p className="text-2xl font-bold text-white">Price - {nft.price} Eth</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreatorDashboard;
