use aiken/transaction/credential.{Address, Inline, VerificationKeyCredential}
use nft_marketplace/types.{VerificationKeyHash}

pub const market_payment_vkh: VerificationKeyHash =
  #"999e80612e93b7b6ab70cf243500605c2cdb2b596b25a178247aaf2c"

pub const market_stake_vkh: VerificationKeyHash =
  #"2c31929bd3ce9c2fa099cd780780a49145d12c90ad177c62c2032fa8"

pub fn market_addr() -> Address {
  Address {
    payment_credential: VerificationKeyCredential(market_payment_vkh),
    stake_credential: Some(
      Inline(VerificationKeyCredential(market_stake_vkh)),
    ),
  }
}

pub const market_pct: Int = 1
