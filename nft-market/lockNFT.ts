import { applyParamsToScript, Blockfrost, Data, fromHex, fromText, Lucid, SpendingValidator, toHex } from "lucid-cardano";
import * as cbor from "https://deno.land/x/cbor@v1.4.1/index.js";

const lucid = await Lucid.new(
  new Blockfrost("https://cardano-preprod.blockfrost.io/api/v0", "preprodaDCuJ1u8d8yNWBBjWcc5NCGJLr9mNZeJ"),
  "Preprod",
);

lucid.selectWalletFromSeed(await Deno.readTextFile("./seller.seed"));

async function readValidator(): Promise<SpendingValidator> {
    const validator = JSON.parse(await Deno.readTextFile("./plutus.json")).validators[0];
    return {
        type: "PlutusV2",
        script: toHex(cbor.encode(fromHex(validator.compiledCode)))
    };
}

const validator = await readValidator();

// console.log(validator);

const sellerPubKeyHash = lucid.utils.getAddressDetails(await lucid.wallet.address()).paymentCredential?.hash;

const Datum = Data.Object({
    policyId: Data.String,
    assetName: Data.String,
    seller: Data.String,
    price: Data.BigInt
})

type Datum = Data.Static<typeof Datum>;

const priceNFT = BigInt(10000000);
const feeMarket = BigInt(10000000 * 1 / 100);

const policyId = "7195ea1a65172c958cef3adbe2690af984db8441572a9c6f195aff10";
const assetName = "436572742d5662692d4144412d32";

const datum = Data.to<Datum>(
    {
        policyId: policyId,
        assetName: assetName,
        seller: sellerPubKeyHash??"",
        price: priceNFT,
    },
    Datum
)

const NFT = policyId + assetName;
const contractAddress = lucid.utils.validatorToAddress(validator);

const tx = await lucid.newTx()
            .payToContract(contractAddress, {inline: datum}, {[NFT]: 1n, lovelace: feeMarket}).complete();

const signedTx = await tx.sign().complete();
const txHash = await signedTx.submit();

console.log("hash", txHash);