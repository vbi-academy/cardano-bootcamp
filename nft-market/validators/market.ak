use aiken/transaction/value.{AssetName, PolicyId}
use nft_marketplace/types.{VerificationKeyHash}
use aiken/transaction/credential.{from_verification_key}
use aiken/transaction.{ScriptContext, Spend, Transaction}
use aiken/list.{filter, length}
use nft_marketplace/constants.{market_pct, market_addr}
use nft_marketplace/utils.{check_none, find_output, must_be_signed_by}

type Datum {
    policyId: PolicyId, 
    assetName: AssetName,
    seller: VerificationKeyHash,
    price: Int,
}

validator {
    fn marketplace(datum: Datum, _redeemer: Void, ctx: ScriptContext) {
        let ScriptContext { transaction, purpose } = ctx
        let Transaction { outputs, .. } = transaction
        let signed_by_seller = must_be_signed_by(transaction, datum.seller)

        when purpose is {
            Spend(_) ->
                when signed_by_seller is {
                True -> True
                False -> {
                    let market_fee: Int = market_pct * datum.price / 100
                    let output_seller =
                        find_output(
                            outputs,
                            datum.price,
                            from_verification_key(datum.seller),
                        )

                    let output_demarket =
                        find_output(outputs, market_fee, market_addr())

                    check_none(output_seller, output_demarket)
                    
                }
            }

            _ -> False
        }
    }
}