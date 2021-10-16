/* eslint-disable @next/next/no-img-element */
import { useState } from 'react';
import { ethers } from 'ethers';
import { create } from 'ipfs-http-client';
import { useRouter } from 'next/router';
import Web3Modal from 'web3modal';

import { nftAddress, nftMarketAddress } from '../config';
import NFT from '../artifacts/contracts/NFT.sol/NFT.json';
import Market from '../artifacts/contracts/NFTMarket.sol/NFTMarket.json';

const client = create('https://ipfs.infura.io:5001/api/v0');

const CreateNFT = () => {
  const [fileUrl, setFileUrl] = useState(null);
  const [formInput, setFormInput] = useState({ price: '', name: '', description: '' });

  const router = useRouter();

  const uploadFile = async (e) => {
    const file = e.target.files[0];
    try {
      const added = await client.add(file, {
        progress: (p) => console.debug('received:', p),
      });
      const url = `https://ipfs.infura.io/ipfs/${added.path}`;
      setFileUrl(url);
    } catch (err) {
      console.warn(err);
    }
  };

  const createSale = async (url) => {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    console.debug('test');

    let contract = new ethers.Contract(nftAddress, NFT.abi, signer);
    console.debug('url:', url);
    let transaction = await contract.createToken(url);
    console.debug('test2');
    const tx = await transaction.wait();
    console.debug('test3');

    const event = tx.events[0];
    const value = event.args[2];
    const tokenId = value.toNumber();

    const price = ethers.utils.parseUnits(formInput.price, 'ether');
    console.debug('price:', price);

    contract = new ethers.Contract(nftMarketAddress, Market.abi, signer);
    let listingPrice = await contract.getListingPrice();
    listingPrice = listingPrice.toString();
    console.debug('listingPrice:', listingPrice);

    transaction = await contract.createMarketItem(nftAddress, tokenId, price, { value: listingPrice });
    await transaction.wait();
    router.push('/');
  };

  const createNFT = async () => {
    const { name, description, price } = formInput;
    if (!name || !description || !price || !fileUrl) return;
    const data = JSON.stringify({
      name,
      description,
      image: fileUrl,
    });

    try {
      const added = await client.add(data, {
        progress: (p) => console.debug('received:', p),
      });
      const url = `https://ipfs.infura.io/ipfs/${added.path}`;
      createSale(url);
    } catch (err) {
      console.warn(err);
    }
  };

  return (
    <div className="flex justify-center">
      <div className="w-1/2 flex flex-col pb-12">
        <input
          placeholder="Asset Name"
          className="mt-8 border rounded p-4"
          onChange={(e) => setFormInput({ ...formInput, name: e.target.value })}
        />
        <textarea
          placeholder="Asset Description"
          className="mt-2 border rounded p-4"
          onChange={(e) => setFormInput({ ...formInput, description: e.target.value })}
        />
        <input
          placeholder="Asset Price in Matic"
          className="mt-2 border rounded p-4"
          onChange={(e) => setFormInput({ ...formInput, price: e.target.value })}
        />
        <input type="file" name="Asset" className="my-4" onChange={uploadFile} />
        {fileUrl && <img className="rounded mt-4" width="350" src={fileUrl} alt="An NFT" />}
        <button onClick={createNFT} className="font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg">
          Create Digital Asset
        </button>
      </div>
    </div>
  );
};

export default CreateNFT;
