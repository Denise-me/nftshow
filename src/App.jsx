import { useState } from 'react'
import './App.css'
import { useWallet } from './hooks/useWallet'

function App() {
  const { account, isConnecting, connectWallet, disconnectWallet, formatAddress, isConnected } = useWallet()
  
  const [nfts] = useState([
    {
      id: 1,
      name: "Digital Art #001",
      creator: "Artist1",
      price: "2.5 ETH",
      image: "https://via.placeholder.com/300x300/6366f1/ffffff?text=NFT+1"
    },
    {
      id: 2,
      name: "Pixel Portrait #042",
      creator: "PixelMaster",
      price: "1.8 ETH",
      image: "https://via.placeholder.com/300x300/8b5cf6/ffffff?text=NFT+2"
    },
    {
      id: 3,
      name: "Abstract Vision #123",
      creator: "ModernArt",
      price: "3.2 ETH",
      image: "https://via.placeholder.com/300x300/ec4899/ffffff?text=NFT+3"
    }
  ])

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div className="header-title">
            <h1>NFT Show</h1>
            <p>Discover and explore amazing digital artworks</p>
          </div>
          <div className="wallet-section">
            {isConnected ? (
              <div className="wallet-connected">
                <span className="wallet-address">{formatAddress(account)}</span>
                <button onClick={disconnectWallet} className="disconnect-button">
                  断开连接
                </button>
              </div>
            ) : (
              <button 
                onClick={connectWallet} 
                disabled={isConnecting}
                className="connect-button"
              >
                {isConnecting ? '连接中...' : '连接钱包'}
              </button>
            )}
          </div>
        </div>
      </header>
      
      <main className="main">
        <div className="nft-grid">
          {nfts.map(nft => (
            <div key={nft.id} className="nft-card">
              <img src={nft.image} alt={nft.name} className="nft-image" />
              <div className="nft-info">
                <h3 className="nft-name">{nft.name}</h3>
                <p className="nft-creator">by {nft.creator}</p>
                <p className="nft-price">{nft.price}</p>
                <button className="buy-button">View Details</button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

export default App
