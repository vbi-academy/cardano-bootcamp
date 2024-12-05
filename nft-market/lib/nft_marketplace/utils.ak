use aiken/list
use aiken/transaction.{Output, Transaction}
use aiken/transaction/credential.{Address}
use aiken/transaction/value.{lovelace_of}
use nft_marketplace/types.{VerificationKeyHash}

pub fn check_amount(output: Output, price: Int) -> Bool {
  lovelace_of(output.value) == price
}

pub fn check_address(output: Output, address: Address) -> Bool {
  output.address.payment_credential == address.payment_credential
}

pub fn must_be_signed_by(transaction: Transaction, vk: VerificationKeyHash) {
  list.has(transaction.extra_signatories, vk)
}

pub fn check_none(
  output_seller: Option<Output>,
  output_market: Option<Output>,
) -> Bool {
  if output_seller == None|| output_market == None {
    False
  } else {
    True
  }
}

pub fn find_output(
  outputs: List<Output>,
  price: Int,
  address: Address,
) -> Option<Output> {
  list.find(
    outputs,
    fn(output) { check_amount(output, price) && check_address(output, address) },
  )
}
