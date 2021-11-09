/* eslint-disable @next/next/no-img-element */
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Web3Modal from 'web3modal';

import { nftAddress, nftMarketAddress } from '../config';
import NFT from '../artifacts/contracts/NFT.sol/NFT.json';
import Market from '../artifacts/contracts/NFTMarket.sol/NFTMarket.json';

const Home = () => {
  const [nfts, setNfts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadNFTs = async () => {
    const provider = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_PROVIDER);
    const tokenContract = new ethers.Contract(nftAddress, NFT.abi, provider);
    const marketContract = new ethers.Contract(nftMarketAddress, Market.abi, provider);
    try {
      const data = await marketContract.fetchMarketItems();

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
            name: meta.data.name,
            description: meta.data.description,
          };
          return newItem;
        })
      );
      setNfts(items);
    } catch (err) {
      console.debug('Error:', err);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadNFTs();
  }, []);

  const buyNFT = async (nft) => {
    const web3modal = new Web3Modal();
    const connection = await web3modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    const contract = new ethers.Contract(nftMarketAddress, Market.abi, signer);

    const price = ethers.utils.parseUnits(nft.price.toString(), 'ether');

    const transaction = await contract.createMarketSale(nftAddress, nft.tokenId, {
      value: price,
    });

    await transaction.wait();

    loadNFTs();
  };

  if (isLoading || !nfts.length) return <h1 className="px-20 py-10 text-3xl">No items in marketplace</h1>;

  return (
    <div className="flex justify-center">
      <div className="px-4" style={{ maxWidth: '1600px' }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {nfts.map((nft) => (
            <div key={nft.tokenId} className="norder shadow rounded-xl overflow-hidden flex flex-col">
              <img src={nft.image} alt={nft.description} />
              <div className="p4 flex-grow">
                <p className="text-2xl font-semibold" style={{ height: '64px' }}>
                  {nft.name}
                </p>
                <div className="overflow-hidden" style={{ height: '70px' }}>
                  <p className="text-gray-400">{nft.description}</p>
                </div>
                <div className="p-4 bg-black">
                  <p className="text-2xl mb-4 font-bold text-white">{nft.price} Matic</p>
                  <button
                    className="2-full bg-pink-500 text-white font-bold py-2 px-12 rounded"
                    onClick={() => buyNFT(nft)}>
                    Buy
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
