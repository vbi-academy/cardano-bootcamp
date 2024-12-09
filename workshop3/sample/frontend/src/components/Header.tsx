import React from 'react';
import { useLucid } from '../context/LucidProvider';

const Header = () => {
    const { connectWallet, address } = useLucid();

    return (
        <header className="border-b border-white/10 bg-white/10 backdrop-blur-md sticky top-0 z-50">
            <div className="container mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    {/* Navigation */}
                    <nav className="hidden md:flex items-center space-x-10">
                        <a href="/" className="text-white hover:text-blue-200 transition-colors duration-200 font-medium">
                            Home
                        </a>
                        <a href="/marketplace" className="text-white border-b-2 border-white font-medium">
                            Marketplace
                        </a>
                    </nav>

                    {/* Right Section */}
                    <div className="flex items-center space-x-6">
                        {/* Cart Icon */}
                        <div className="relative group">
                            <a href="/cart" className="p-3 rounded-full transition-all duration-200 group-hover:scale-105">
                                <span className="absolute -top-1 -right-1 bg-purple-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                                    0
                                </span>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6 text-white group-hover:text-blue-200 transition-colors duration-200"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                                    />
                                </svg>
                            </a>
                        </div>

                        {/* Connect Wallet Button or Address */}
                        {address ? (
                            <div className="bg-white/10 text-white px-6 py-2.5 rounded-full font-medium border border-white/20 hover:bg-white/20 transition-all duration-200">
                                {address.slice(0, 6)}...{address.slice(-4)}
                            </div>
                        ) : (
                            <button
                                className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-2.5 rounded-full hover:shadow-lg hover:scale-105 transition-all duration-200 font-medium"
                                onClick={connectWallet}
                            >
                                Connect Wallet
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
