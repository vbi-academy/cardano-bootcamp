import React, { useState } from 'react';
import { fromText, Script } from "lucid-cardano";
import { useLucid } from '../context/LucidProvider';

export const MintTokenValidator = () => {
    const { lucid } = useLucid();
    const [txHash, setTxHash] = useState<string>("");
    const [name, setName] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [image, setImage] = useState<string>("");
    const [isFungible, setIsFungible] = useState<boolean>(false);
    const [quantity, setQuantity] = useState<number>(1);
    const [loading, setLoading] = useState<boolean>(false);

    const handleTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setIsFungible(event.target.value === 'ft');
        // Reset quantity to 1 for NFT
        if (event.target.value === 'nft') {
            setQuantity(1);
        }
    };

    const mintingPolicyId = async function () {
        if (!lucid) {
            throw new Error("Lucid instance not found");
        }

        const { paymentCredential } = lucid.utils.getAddressDetails(await lucid.wallet.address());

        if (!paymentCredential) {
            throw new Error("Payment credential not found");
        }

        const mintingPolicy: Script = lucid.utils.nativeScriptFromJson({
            type: "all",
            scripts: [
                { type: "sig", keyHash: paymentCredential.hash },
                { type: "before", slot: lucid.utils.unixTimeToSlot(Date.now() + 1000000) },
            ],
        });

        const policyId: string = lucid.utils.mintingPolicyToId(mintingPolicy);

        return { policyId: policyId, mintingPolicy: mintingPolicy };
    };

    const mintAssetService = async function () {
        try {
            setLoading(true);
            if (!lucid) {
                throw new Error("Lucid instance not found");
            }

            const { mintingPolicy, policyId } = await mintingPolicyId();
            const assetName = fromText(name);
            const tx = await lucid
                .newTx()
                .mintAssets({ [policyId + assetName]: BigInt(quantity) })
                .attachMetadata(isFungible ? 20 : 721, {
                    [policyId]: {
                        [name]: {
                            name: name,
                            description: description,
                            image: image,
                            mediaType: "image/png",
                        },
                    },
                })
                .validTo(Date.now() + 200000)
                .attachMintingPolicy(mintingPolicy)
                .complete();
            const signedTx = await tx.sign().complete();
            const txHash = await signedTx.submit();
            await lucid.awaitTx(txHash);

            setTxHash(txHash);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mt-8 border-t border-white/30 pt-8">
            <h2 className="text-3xl font-extrabold mb-6 text-white bg-gradient-to-r from-purple-400 to-blue-400 inline-block text-transparent bg-clip-text">Mint Tokens</h2>
            <div className="flex flex-col gap-4 p-8 bg-gradient-to-br from-purple-500/30 to-blue-500/30 backdrop-blur-md border border-white/30 rounded-xl shadow-2xl">
                <div className="flex flex-col gap-4">
                    <div className="flex gap-4 items-center text-white/90">
                        <label className="flex items-center cursor-pointer hover:text-white transition-colors">
                            <input
                                type="radio"
                                name="tokenType"
                                value="nft"
                                checked={!isFungible}
                                onChange={handleTypeChange}
                                className="mr-2 accent-purple-400"
                            />
                            NFT
                        </label>
                        <label className="flex items-center cursor-pointer hover:text-white transition-colors">
                            <input
                                type="radio"
                                name="tokenType"
                                value="ft"
                                checked={isFungible}
                                onChange={handleTypeChange}
                                className="mr-2 accent-purple-400"
                            />
                            Fungible Token
                        </label>
                    </div>
                    {isFungible && (
                        <input
                            type="number"
                            min="1"
                            value={quantity}
                            onChange={(e) => setQuantity(parseInt(e.target.value))}
                            placeholder="Quantity"
                            className="bg-white/10 hover:bg-white/15 border border-white/30 rounded-lg p-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition-all"
                        />
                    )}
                    <input
                        type="text"
                        placeholder="NFT Name"
                        className="bg-white/10 hover:bg-white/15 border border-white/30 rounded-lg p-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition-all"
                        onChange={(e) => setName(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Description"
                        className="bg-white/10 hover:bg-white/15 border border-white/30 rounded-lg p-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition-all"
                        onChange={(e) => setDescription(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Image URL"
                        className="bg-white/10 hover:bg-white/15 border border-white/30 rounded-lg p-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition-all"
                        onChange={(e) => setImage(e.target.value)}
                    />
                    <div className="flex gap-4">
                        <button
                            className="bg-gradient-to-r from-purple-500/80 to-blue-500/80 hover:from-purple-500/90 hover:to-blue-500/90 text-white font-bold py-3 px-8 rounded-lg border border-white/30 transition-all duration-200 shadow-lg"
                            onClick={mintAssetService}
                            disabled={loading}
                        >
                            {loading ? 'Processing...' : 'Mint Tokens'}
                        </button>
                    </div>
                </div>
                {txHash && (
                    <div className="bg-white/10 border border-white/30 p-4 rounded-lg mt-4">
                        <p className="text-sm text-white/90">
                            Transaction hash:
                            <a
                                href={`https://preprod.cardanoscan.io/transaction/${txHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-mono ml-2 break-all text-purple-200 hover:text-purple-100"
                            >
                                {txHash}
                            </a>
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
