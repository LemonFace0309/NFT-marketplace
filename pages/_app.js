import { Provider } from 'next-auth/client';
import Link from 'next/link';

import '../styles/globals.css';

const MyApp = ({ Component, pageProps }) => {
  return (
    <Provider session={pageProps.session}>
      <div>
        <nav className="border-b p-6">
          <p className="text-4xl font-bold">NFT Marketplace</p>
          <div className="flex mt-4">
            <Link href="/">
              <a className="mr-6 text-pink-500">Home</a>
            </Link>
            <Link href="/create-nft">
              <a className="mr-6 text-pink-500">Sell NFTs</a>
            </Link>
            <Link href="/my-nfts">
              <a className="mr-6 text-pink-500">My NFTs</a>
            </Link>
            <Link href="/creator-dashboard">
              <a className="mr-6 text-pink-500">Creator Dashboard</a>
            </Link>
          </div>
        </nav>
        <Component {...pageProps} />
      </div>
    </Provider>
  );
};

export default MyApp;
