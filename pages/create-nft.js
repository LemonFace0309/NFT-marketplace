/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { create } from 'ipfs-http-client';
import { useRouter } from 'next/router';
import Web3Modal from 'web3modal';

import { nftAddress, nftMarketAddress } from '../config';
import NFT from '../artifacts/contracts/NFT.sol/NFT.json';
import Market from '../artifacts/contracts/NFTMarket.sol/NFTMarket.json';
import axios from 'axios';

const client = create('https://ipfs.infura.io:5001/api/v0');

const CreateNFT = () => {
  const router = useRouter();
  const [fileUrl, setFileUrl] = useState(null);
  const [formInput, setFormInput] = useState({ price: '', name: '', description: '' });
  const [tracks, setTracks] = useState([]);

  useEffect(() => {
    const id = '7n2Ycct7Beij7Dj7meI4X0';
    axios
      .get(`https://api.spotify.com/v1/artists/${id}/top-tracks?market=CA`, {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID}`,
        },
      })
      .then((res) => {
        console.debug(res);
        setTracks(res.data.tracks);
      })
      .catch((err) => {
        console.warn(err);
      });
  }, []);

  // const uploadFile = async (e) => {
  //   const file = e.target.files[0];
  //   try {
  //     const added = await client.add(file, {
  //       progress: (p) => console.debug('received:', p),
  //     });
  //     const url = `https://ipfs.infura.io/ipfs/${added.path}`;
  //     setFileUrl(url);
  //   } catch (err) {
  //     console.warn(err);
  //   }
  // };

  const createSale = async (url) => {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    let contract = new ethers.Contract(nftAddress, NFT.abi, signer);
    let transaction = await contract.createToken(url);
    const tx = await transaction.wait();

    const event = tx.events[0];
    const value = event.args[2];
    const tokenId = value.toNumber();

    const price = ethers.utils.parseUnits(formInput.price, 'ether');

    contract = new ethers.Contract(nftMarketAddress, Market.abi, signer);
    let listingPrice = await contract.getListingPrice();
    listingPrice = listingPrice.toString();

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

  const setImageURL = async (imgURL) => {
    try {
      const res = await fetch(imgURL);
      const file = await res.blob();

      const added = await client.add(file, {
        progress: (p) => console.debug('received:', p),
      });
      const url = `https://ipfs.infura.io/ipfs/${added.path}`;
      setFileUrl(url);
    } catch (err) {
      console.warn(err);
    }
  };

  const handleClicked = (track) => {
    const artistArr = track.artists;
    const artists = artistArr.map((trackObj) => trackObj.name).join(' & ');
    setFormInput({ ...formInput, name: `${artists} - ${track.name}` });
    setImageURL(track.album.images[1].url);
  };

  return (
    <div className="flex justify-center">
      <div className="p-6 w-1/2 grid grid-cols-3 gap-4">
        {tracks.map((track) => (
          <div key={track.id} className="cursor-pointer" onClick={() => handleClicked(track)}>
            <img key={track.id} alt={track.name} src={track.album.images[1].url} />
            <p className="text-center">{track.name}</p>
          </div>
        ))}
      </div>
      <div className="w-1/2 flex flex-col pb-12">
        <input
          disabled
          placeholder="Asset Name"
          className="mt-8 border rounded p-4"
          value={formInput.name}
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
        {/* <input type="file" name="Asset" className="my-4" onChange={uploadFile} /> */}
        {fileUrl && <img className="rounded mt-4" width="350" src={fileUrl} alt="An NFT" />}
        <button onClick={createNFT} className="font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg">
          Create Digital Asset
        </button>
      </div>
    </div>
  );
};

export default CreateNFT;
