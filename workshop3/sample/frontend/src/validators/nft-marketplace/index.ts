import { SpendingValidator } from "lucid-cardano"
import marketplace from "./plutus.json"

// Returns a SpendingValidator object that can be used in transactions
const readValidator = (): SpendingValidator => {
    const marketplaceValidator = marketplace.validators.find((validator) => validator.title === "marketplace.marketplace");

    if (!marketplaceValidator) {
        throw new Error("marketplace validator not found");
    }

    return {
        type: "PlutusV2",
        script: marketplaceValidator.compiledCode,
    }
}

export default readValidator;