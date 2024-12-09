import React, { useState, useEffect } from 'react';
import { useLucid } from '../context/LucidProvider';
import { UTxO } from 'lucid-cardano';
import NFTMarketplaceService from '../services/nft-marketplace';
import { Data } from 'lucid-cardano';
import { MarketplaceDatum } from '../validators/nft-marketplace/datum';
import getMarketplaceValidator from '../validators/nft-marketplace';
export interface NFTListing {
  address: string;
  assetName: string;
  assets: {
    [policyId: string]: string;
  };
  datum: string;
  datumHash?: string;
  outputIndex: number;
  policyId: string;
  price: bigint;
  scriptRef?: string;
  seller: string;
  txHash: string;
}

const NFTMarketplace: React.FC = () => {
  const [nfts, setNfts] = useState<NFTListing[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { lucid } = useLucid();
  const [txHash, setTxHash] = useState<string>("");

  useEffect(() => {
    const fetchNFTs = async () => {
      const nftMarketplaceService = new NFTMarketplaceService(lucid);
      const scriptUTxOs = await nftMarketplaceService.getUTxOs();

      const utxos = scriptUTxOs?.map((utxo) => {
        try {
          const temp = Data.from<MarketplaceDatum>(utxo.datum, MarketplaceDatum);
          return {
            ...utxo,
            ...temp
          }
        } catch (error) {
          return false;
        }
      }).filter(Boolean) as NFTListing[];

      setNfts(utxos || []);
      setLoading(false);
    };

    fetchNFTs();
  }, [lucid]);

  const buyNFT = async (nft: NFTListing) => {
    try {
      const validator = getMarketplaceValidator();

      const contractAddress = lucid?.utils.validatorToAddress(validator)

      if (!contractAddress) {
        throw new Error("Contract address not found");
      }

      // const feeMarket 
      const policyId = nft.policyId;
      const assetName = nft.assetName;

      const scriptUTxOs = await lucid?.utxosAt(contractAddress); // get utxos at contract address

      const marketAddress = "addr_test1qqh6c35y50368n68uw8mqmp09n94acqeyhxnhzme582c63fpyhlgnl7ygwz524ppsrgk30k8kdsqgek5mht9ffsdtf5snjnge0";

      const feeMarket = (BigInt(nft.price) * 1n * 10n ** 6n) / 100n; // 1% fee of the price

      let utxoNft;
      const utxos = scriptUTxOs?.filter((utxo) => {
        try {
          const temp = Data.from<MarketplaceDatum>(utxo.datum, MarketplaceDatum);
          // console.log("temp", temp);
          if (temp.assetName === assetName && temp.policyId === policyId) {
            utxoNft = temp;
            return true;
          } else {
            return false;
          }
        } catch (error) {
          return false;
        }
      });

      const sellerAddressCredential = lucid?.utils.keyHashToCredential(
        utxoNft?.seller
      );
      console.log("sellerAddressCredential", sellerAddressCredential);

      const sellerAddress = lucid?.utils.credentialToAddress(sellerAddressCredential);
      console.log("sellerAddress", sellerAddress);
      
      // const sellerAddress = "addr_test1qr7xvrx6zea988hz5juazw32qyfmh5jg6z9euursqs390pz62landnfc3ggslmdvaglwmuquuxt2pkkxctzp0adfrxasyzm9m9"


      const tx = await lucid?.newTx().payToAddress(sellerAddress, { lovelace: utxoNft?.price }).payToAddress(marketAddress, { lovelace: feeMarket }).collectFrom(utxos as UTxO[], Data.void()).attachSpendingValidator(validator).complete();

      if (!tx) {
        throw new Error("Transaction not found");
      }

      const signedTx = await tx.sign().complete();

      const txHash = await signedTx.submit();

      setTxHash(txHash);
    } catch (error) {
      console.error("Error unlocking ADA:", error);
    }
  }

  if (loading) {
    return <div>Loading NFTs...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-4">
          NFT Marketplace
        </h1>
        {txHash && (
          <div className="mt-4 p-4 bg-green-100 text-green-700 rounded-lg">
            <p>Purchase successful! Transaction Hash:</p>
            <a
              href={`https://preprod.cardanoscan.io/transaction/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-600 hover:text-green-800 underline break-all"
            >
              {txHash}
            </a>
          </div>
        )}
        <p className="text-gray-600 text-xl max-w-2xl mx-auto">
          Discover unique digital assets and join the future of digital collectibles. Buy, sell, and trade NFTs with ease.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {nfts.map((nft, index) => (
          <div
            key={`${nft.txHash}-${nft.outputIndex}`}
            className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
          >
            {/* NFT Image Placeholder */}
            <div className="aspect-square bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400">NFT Image</span>
            </div>

            {/* NFT Details */}
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2 truncate">
                {nft.assetName}
              </h3>

              <div className="text-sm text-gray-600 mb-3">
                <p className="truncate">Policy ID: {nft.policyId}</p>
                <p className="mt-1">
                  Price: {Number(nft.price) / 1_000_000} ₳
                </p>
              </div>

              <button
                onClick={() => { buyNFT(nfts[index]) }}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-4 rounded-lg hover:opacity-90 transition-opacity"
              >
                Buy NFT
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NFTMarketplace;
