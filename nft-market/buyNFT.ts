import { applyParamsToScript, Blockfrost, Data, fromHex, fromText, Lucid, SpendingValidator, toHex } from "lucid-cardano";
import * as cbor from "https://deno.land/x/cbor@v1.4.1/index.js";

const lucid = await Lucid.new(
  new Blockfrost("https://cardano-preprod.blockfrost.io/api/v0", "preprodaDCuJ1u8d8yNWBBjWcc5NCGJLr9mNZeJ"),
  "Preprod",
);

lucid.selectWalletFromSeed(await Deno.readTextFile('./buyer.seed'));

async function readValidator(): Promise<SpendingValidator> {
    const validator = JSON.parse(await Deno.readTextFile('./plutus.json')).validators[0];
    return {
        type: "PlutusV2",
        script: toHex(cbor.encode(fromHex(validator.compiledCode)))
    };
}

const validator = await readValidator();

const Datum = Data.Object({
    policyId: Data.String,
    assetName: Data.String,
    seller: Data.String,
    price: Data.BigInt,
});

type Datum = Data.Static<typeof Datum>;

const contractAddress = lucid.utils.validatorToAddress(validator);

const feeMarket = BigInt(100000000 * 1 / 100);

const policyId = "7195ea1a65172c958cef3adbe2690af984db8441572a9c6f195aff10";
const assetName = "436572742d5662692d4144412d32";

const scriptUTXO = await lucid.utxosAt(contractAddress);

let utxoNFT;

const utxos = scriptUTXO.filter((utxo) => {
    try {
        const temp = Data.from<Datum>(utxo.datum ?? "", Datum);
        if (temp.assetName === assetName && temp.policyId === policyId) {
            utxoNFT = temp;
            return true;
        }
        return false;
    } catch(e) {
        return false;
    }
});

console.log(utxos.length);

const redeemer = Data.void();

const sellerAddress = "addr_test1qpsdzdncpusejkld5escyufak8yjtjre88ep3c95fldnjqdr4mrtrtnusz0v0ryf0hmctecy2lrua4jhsepzp9v80jvs3fx8xf";
const marketAddress = "addr_test1qzveaqrp96fm0d4twr8jgdgqvpwzekett94jtgtcy3a27tpvxxffh57wnsh6pxwd0qrcpfy3ghgjey9dza7x9ssr975qrjsmqg";

const tx = await lucid.newTx()
            .payToAddress(sellerAddress, { lovelace: utxoNFT.price })
            .payToAddress(marketAddress, { lovelace: feeMarket })
            .collectFrom(utxos, redeemer)
            .attachSpendingValidator(validator)
            .complete();

const signedTx = await tx.sign().complete();

const txHash = await signedTx.submit();

console.log("hash", txHash);