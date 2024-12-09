use aiken/transaction/credential.{Address, Inline, VerificationKeyCredential}
use nft_marketplace/types.{VerificationKeyHash}

pub const market_payment_vkh: VerificationKeyHash = #"2fac4684a3e3a3cf47e38fb06c2f2ccb5ee01925cd3b8b79a1d58d45"

pub const market_state_vkh: VerificationKeyHash = #"2125fe89ffc4438545542180d168bec7b3600466d4ddd654a60d5a69"

pub fn get_marketplace_address() -> Address {
    Address {
        payment_credential: VerificationKeyCredential(market_payment_vkh),
        stake_credential: Some(Inline(VerificationKeyCredential(market_state_vkh)))
    }
}

pub const market_percentage: Int = 1
