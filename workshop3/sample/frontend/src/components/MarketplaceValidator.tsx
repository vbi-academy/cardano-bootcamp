import React, { useState } from 'react'
import { useLucid } from '../context/LucidProvider';
import { Data, fromText, Redeemer, UTxO } from 'lucid-cardano';
import { MarketplaceDatum } from '../validators/nft-marketplace/datum';
import getMarketplaceValidator from '../validators/nft-marketplace';

export const MarketplaceValidator = () => {
  const [txHash, setTxHash] = useState<string>("");
  const [sellingLoading, setSellingLoading] = useState(false);
  const [buyingLoading, setBuyingLoading] = useState(false);
  const { lucid, address } = useLucid();

  const [priceNFT, setPriceNFT] = useState(1);


  const sellNFT = async () => {
    setSellingLoading(true);
    try {
      if (!address) {
        throw new Error("Address not found");
      }

      const sellerPubKeyHash = lucid?.utils.getAddressDetails(address).paymentCredential?.hash;

      if (!sellerPubKeyHash) {
        throw new Error("Seller public key hash not found");
      }

      const feeMarket = (BigInt(priceNFT) * 1n * 10n ** 6n) / 100n; // 1% fee of the price

      const policyId = "faec96920bee7c199f6a334b004cadb25e0c7c47db34da2eb707331b";
      const assetName = "54657374343536";

      const datum = Data.to(
        {
          policyId,
          assetName,
          seller: sellerPubKeyHash,
          price: BigInt(priceNFT)
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
    } finally {
      setSellingLoading(false);
    }
  }

  const buyNFT = async () => {
    try {
      setBuyingLoading(true);

      const validator = getMarketplaceValidator();

      const contractAddress = lucid?.utils.validatorToAddress(validator)

      if (!contractAddress) {
        throw new Error("Contract address not found");
      }

      // const feeMarket 
      const policyId = "faec96920bee7c199f6a334b004cadb25e0c7c47db34da2eb707331b";
      const assetName = "54657374343536";

      const scriptUTxOs = await lucid?.utxosAt(contractAddress); // get utxos at contract address

      const marketAddress = "addr_test1qqh6c35y50368n68uw8mqmp09n94acqeyhxnhzme582c63fpyhlgnl7ygwz524ppsrgk30k8kdsqgek5mht9ffsdtf5snjnge0";

      const feeMarket = (BigInt(priceNFT) * 1n * 10n ** 6n) / 100n; // 1% fee of the price

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

      // const sellerAddress = lucid?.utils.credentialToAddress({
      //   type: "Key",
      //   hash: utxoNft?.seller || "",
      // });

      const sellerAddress = "addr_test1qr7xvrx6zea988hz5juazw32qyfmh5jg6z9euursqs390pz62landnfc3ggslmdvaglwmuquuxt2pkkxctzp0adfrxasyzm9m9"

      const tx = await lucid?.newTx().payToAddress(sellerAddress, { lovelace: utxoNft?.price }).payToAddress(marketAddress, { lovelace: feeMarket }).collectFrom(utxos as UTxO[], Data.void()).attachSpendingValidator(validator).complete();

      if (!tx) {
        throw new Error("Transaction not found");
      }

      const signedTx = await tx.sign().complete();

      const txHash = await signedTx.submit();

      setTxHash(txHash);
    } catch (error) {
      console.error("Error unlocking ADA:", error);
    } finally {
      setBuyingLoading(false);
    }
  }

  return (
    <div className="mt-8">
      <div className="border-t pt-8">
        <h2 className="text-3xl font-bold mb-6">Hello World Validator</h2>
        <div className="flex flex-col gap-4 max-w-md">
          <div className="flex flex-col gap-2">
            <label htmlFor="ada-amount" className="text-sm font-medium text-gray-700">
              Amount of ADA
            </label>
            <input
              id="ada-amount"
              type="number"
              value={priceNFT}
              onChange={(e) => setPriceNFT(Number(e.target.value))}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={sellNFT}
              disabled={sellingLoading}
              className="flex-1 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
            >
              {sellingLoading ? "Selling..." : "Sell NFT"}
            </button>

            <button
              onClick={buyNFT}
              disabled={buyingLoading}
              className="flex-1 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
            >
              {buyingLoading ? "Buying..." : "Buy NFT"}
            </button>
          </div>

          {txHash && (
            <div className="mt-4 p-4 bg-gray-100 rounded">
              <p className="text-sm text-gray-600">Transaction Hash:</p>
              <a
                href={`https://preprod.cardanoscan.io/transaction/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-sm break-all text-blue-500 hover:text-blue-700"
              >
                {txHash}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
