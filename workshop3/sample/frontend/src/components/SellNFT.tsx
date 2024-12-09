import React, { useEffect, useState } from 'react'
import NFTCard from './NFTCard'
import BlockfrostService from '../services/blockforst';
import { useLucid } from '../context/LucidProvider';
import { MarketplaceDatum } from '../validators/nft-marketplace/datum';
import { Data } from 'lucid-cardano';
import getMarketplaceValidator from '../validators/nft-marketplace';
export const SellNFT = () => {
    const { lucid, address } = useLucid();
    const blockfrost = new BlockfrostService();
    const [price, setPrice] = useState(0);

    const [currentNFT, setCurrentNFT] = useState<any>(null);
    const [nfts, setNfts] = useState([]);
    const [txHash, setTxHash] = useState<string>("");

    useEffect(() => {
        async function fetchNFTs() {
            if (!lucid || !address) return;
            const res = await blockfrost.getNFTs(address);
            setNfts(res);
        }
        fetchNFTs();
    }, [address]);

    const sellNFT = async () => {
        try {
            if (!address) {
                throw new Error("Address not found");
            }

            const sellerPubKeyHash = lucid?.utils.getAddressDetails(address).paymentCredential?.hash;

            if (!sellerPubKeyHash) {
                throw new Error("Seller public key hash not found");
            }

            const feeMarket = (BigInt(price) * 1n * 10n ** 6n) / 100n; // 1% fee of the price

            const policyId = currentNFT.assetDetails.policy_id;
            const assetName = currentNFT.assetDetails.asset_name;

            const datum = Data.to(
                {
                    policyId,
                    assetName,
                    seller: sellerPubKeyHash,
                    price: BigInt(price)
                },
                MarketplaceDatum
            )

            const nft = policyId + assetName;

            const validator = getMarketplaceValidator();

            const contractAddress = lucid?.utils.validatorToAddress(validator)

            if (!contractAddress) {
                throw new Error("Contract address not found");
            }

            const tx = await lucid?.newTx().payToContract(contractAddress, { inline: datum }, {
                [nft]: 1n,
                lovelace: feeMarket
            }).complete();

            if (!tx) {
                throw new Error("Transaction not found");
            }

            const signedTx = await tx.sign().complete();

            const txHash = await signedTx.submit();

            setTxHash(txHash);
        } catch (error) {
            console.error("Error locking ADA:", error);
        }
    }


    return (
        <div className="max-w-6xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6 text-center">Sell NFT</h1>

            {currentNFT && (
                <div className="flex justify-center mb-8">
                    <div className="w-64">
                        <NFTCard nft={currentNFT} />
                        <div className="mt-4 space-y-4">
                            <div className="relative">
                                <input
                                    type="number"
                                    value={price}
                                    onChange={(e) => setPrice(Number(e.target.value))}
                                    placeholder="Enter price in ADA"
                                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    ADA
                                </span>
                            </div>
                            <button
                                onClick={sellNFT}
                                className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl font-medium shadow-lg hover:shadow-blue-500/25 transition-all duration-200"
                            >
                                Sell
                            </button>
                            {txHash && (
                                <div className="mt-3 text-sm text-gray-400 break-all">
                                    Transaction:
                                    <a
                                        href={`https://preprod.cardanoscan.io/transaction/${txHash}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="ml-1 text-blue-400 hover:text-blue-300"
                                    >
                                        {txHash}
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {nfts.map((nft, index) => (
                    <div key={index} onClick={() => setCurrentNFT(nft)}>
                        <NFTCard nft={nft} />
                    </div>
                ))}
            </div>
        </div>
    )
}
