use aiken/transaction.{Transaction, Output}
use nft_marketplace/types.{VerificationKeyHash}
use aiken/list
use aiken/transaction/value.{lovelace_of}
use aiken/transaction/credential.{Address}

pub fn must_be_signed_by(transaction: Transaction, vk: VerificationKeyHash) {
    list.has(transaction.extra_signatories, vk)
}

pub fn find_output(outputs: List<Output>, price: Int, address: Address) -> Option<Output> {
    list.find(outputs,
        fn (output) {
            lovelace_of(output.value) >= price && output.address.payment_credential == address.payment_credential
        }
    )
}
