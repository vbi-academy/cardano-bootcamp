import { Blockfrost, fromText, Lucid } from "lucid-cardano";

const lucid = await Lucid.new(
    new Blockfrost("https://cardano-preprod.blockfrost.io/api/v0", "preprodaDCuJ1u8d8yNWBBjWcc5NCGJLr9mNZeJ"),
    "Preprod",
)

lucid.selectWalletFromSeed(await Deno.readTextFile("./seller.seed"));

const addressDetails  = await lucid.utils.getAddressDetails(
    await lucid.wallet.address()
);

if (!addressDetails.paymentCredential) {
    throw new Error("Address not found!");
}

const mintingPolicy = lucid.utils.nativeScriptFromJson(
    {
        type: "all",
        scripts: [
            {
                type: "sig",
                keyHash: addressDetails.paymentCredential.hash
            },
            {
                type: "before",
                slot: lucid.utils.unixTimeToSlot(Date.now() + 1000000)
            }
        ]
    }
)

const policyId = lucid.utils.mintingPolicyToId(mintingPolicy);
const assetName = fromText("Cert-Vbi-ADA-2");
const unit = policyId + assetName;

const description = fromText("Just test");
const imageUrl = fromText("");

const tx = await lucid.newTx()
            .mintAssets({[unit]: 1n})
            .attachMetadata(721, {
                [policyId]: {
                    [assetName]: {
                        name: assetName,
                        description: description,
                        image: imageUrl
                    }
                }
            })
            .validTo(Date.now() + 200000)
            .attachMintingPolicy(mintingPolicy)
            .complete();

const signedTx = await tx.sign().complete();
const txHash = await signedTx.submit();

console.log("hash", txHash);