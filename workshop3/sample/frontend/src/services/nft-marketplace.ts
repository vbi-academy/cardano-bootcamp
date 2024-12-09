import { Lucid } from "lucid-cardano";
import getMarketplaceValidator from "../validators/nft-marketplace";

class NFTMarketplaceService {
    private contractAddress: string;
    private lucid: Lucid;

    constructor(lucid: Lucid) {
        const validator = getMarketplaceValidator();
        
        this.lucid = lucid;
        this.contractAddress = this.lucid.utils.validatorToAddress(validator);
    }

    getContractAddress() {
        return this.contractAddress;
    }

    async getUTxOs() {
        return this.lucid.utxosAt(this.contractAddress);
    }
}

export default NFTMarketplaceService;