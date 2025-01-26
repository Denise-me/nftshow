import { useState } from 'react'
import './App.css'
import { useWallet } from './hooks/useWallet'

function App() {
  const { 
    account, 
    isConnecting, 
    connectWallet, 
    disconnectWallet, 
    formatAddress, 
    isConnected,
    nfts,
    isLoadingNFTs,
    loadUserNFTs
  } = useWallet()
  
  // 示例NFT数据，当用户未连接钱包时显示
  const [exampleNfts] = useState([
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

  // 决定显示哪些NFT
  const displayNfts = isConnected ? nfts : exampleNfts

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
        {isConnected && (
          <div className="wallet-info">
            <h2>我的NFT收藏</h2>
            <p>钱包地址: {formatAddress(account)}</p>
            {isLoadingNFTs && (
              <div className="loading">
                <p>正在加载NFT...</p>
              </div>
            )}
            {!isLoadingNFTs && nfts.length === 0 && (
              <div className="no-nfts">
                <p>您的钱包中没有BAYC或Azuki NFT</p>
                <button onClick={loadUserNFTs} className="refresh-button">
                  刷新
                </button>
              </div>
            )}
          </div>
        )}
        
        <div className="nft-grid">
          {displayNfts.map(nft => (
            <div key={nft.id} className="nft-card">
              <img 
                src={nft.image} 
                alt={nft.name} 
                className="nft-image" 
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/300x300/6366f1/ffffff?text=NFT'
                }}
              />
              <div className="nft-info">
                <h3 className="nft-name">{nft.name}</h3>
                {nft.collection && (
                  <p className="nft-collection">{nft.collection}</p>
                )}
                {nft.creator && (
                  <p className="nft-creator">by {nft.creator}</p>
                )}
                {nft.tokenId && (
                  <p className="nft-token">Token ID: {nft.tokenId}</p>
                )}
                {nft.price && (
                  <p className="nft-price">{nft.price}</p>
                )}
                {nft.opensea ? (
                  <a 
                    href={nft.opensea} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="opensea-button"
                  >
                    在OpenSea查看
                  </a>
                ) : (
                  <button className="buy-button">View Details</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

export default App
