interface NFTCardProps {
    nft: {
        unit: string;
        quantity: string;
        assetDetails: {
            asset: string;
            policy_id: string;
            asset_name: string;
            fingerprint: string;
            quantity: string;
            initial_mint_tx_hash: string;
            mint_or_burn_count: number;
            onchain_metadata: {
                name: string;
                description: string;
                image: string;
                mediaType: string;
            };
            onchain_metadata_standard: string;
            onchain_metadata_extra: null | any;
            metadata: null | any;
        }
    }
}

const NFTCard: React.FC<NFTCardProps> = ({ nft }) => {
    console.log(nft)
    return (
        <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="relative">
                <img
                    src={nft.assetDetails.onchain_metadata?.image?.replace('ipfs://', 'https://crimson-fascinating-vulture-838.mypinata.cloud/ipfs/') || '/placeholder-image.png'}
                    alt={nft.assetDetails.onchain_metadata?.name || 'NFT Image'}
                    className="w-full h-64 object-cover rounded-t-lg"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                    <span className="text-purple-600 text-sm">{nft.assetDetails.onchain_metadata?.name || 'Unnamed NFT'}</span>
                </div>
            </div>

            <div className="p-4">
                <div className="flex items-center space-x-2 mb-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full overflow-hidden">
                        {/* Owner avatar placeholder */}
                    </div>
                    <div className="flex-1">
                        <p className="text-sm text-gray-600 truncate">{nft.assetDetails.onchain_metadata?.description || 'No description available'}</p>
                    </div>
                </div>

                <div className="flex flex-col space-y-2 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                        <span>Policy ID:</span>
                        <span className="font-mono truncate">{nft.assetDetails.policy_id}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                        <span>Asset Name:</span>
                        <span className="font-mono">{nft.assetDetails.asset_name}</span>
                    </div>
                    {nft.assetDetails.fingerprint && (
                        <div className="flex items-center space-x-1">
                            <span>Fingerprint:</span>
                            <span className="font-mono truncate">{nft.assetDetails.fingerprint}</span>
                        </div>
                    )}
                    {nft.assetDetails.quantity && (
                        <div className="flex items-center space-x-1">
                            <span>Quantity:</span>
                            <span>{nft.assetDetails.quantity}</span>
                        </div>
                    )}
                    <button className="text-purple-600 self-end hover:text-purple-700 transition-colors duration-200">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
                            <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5z" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NFTCard; 