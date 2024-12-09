use aiken/transaction/value.{AssetName, PolicyId}
use nft_marketplace/types.{VerificationKeyHash}
use aiken/transaction.{ScriptContext, Transaction, Spend}
use nft_marketplace/constants.{get_marketplace_address, market_percentage}
use nft_marketplace/utils.{find_output, must_be_signed_by}
use aiken/transaction/credential.{from_verification_key}

type DatumMarketplace {
    policyId: PolicyId, // policy id of the asset
    assetName: AssetName, // asset name of the asset
    seller: VerificationKeyHash,
    price: Int
}

validator {
    fn marketplace(datum: DatumMarketplace, _redeemer: Void, ctx: ScriptContext) {
        let ScriptContext {transaction, purpose} = ctx
        let Transaction {outputs, ..} = transaction

        let signed_by_seller = must_be_signed_by(transaction, datum.seller)

        when purpose is {
            Spend(_) -> {
                when signed_by_seller is {
                    True -> True // seller signed the transaction
                    False -> { // buyer signed the transaction
                        let market_fee: Int = market_percentage * datum.price / 100
                        let output_seller = find_output(outputs, datum.price, from_verification_key(datum.seller)) // transfer amount to seller (fee for sellter)
                        let output_market = find_output(outputs, datum.price, get_marketplace_address())

                        if output_seller == None || output_market == None {
                            False
                        } else {
                            True
                        }
                    }
                }
            }
            _ -> False
        }
    }
}