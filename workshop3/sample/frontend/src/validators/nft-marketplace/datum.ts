import { Data } from "lucid-cardano";

const MarketplaceDatumSchema = Data.Object({
    policyId: Data.Bytes(),
    assetName: Data.Bytes(),
    seller: Data.Bytes(),
    price: Data.Integer()
})

// enable type safety when accessing the datum fields
type MarketplaceDatum = Data.Static<typeof MarketplaceDatumSchema>;

export const MarketplaceDatum = MarketplaceDatumSchema as unknown as MarketplaceDatum
