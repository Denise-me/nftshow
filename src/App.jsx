import { useState } from 'react'
import './App.css'
import { useWallet } from './hooks/useWallet'
import { ethers } from 'ethers'

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
    loadUserNFTs,
    provider
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

  // 自定义合约状态
  const [customContract, setCustomContract] = useState('')
  const [customNfts, setCustomNfts] = useState([])
  const [isLoadingCustom, setIsLoadingCustom] = useState(false)
  const [showCustomNfts, setShowCustomNfts] = useState(false)

  // 验证合约地址
  const isValidAddress = (address) => {
    try {
      return ethers.isAddress(address)
    } catch {
      return false
    }
  }

  // 获取自定义合约NFT
  const loadCustomContractNFTs = async () => {
    if (!customContract.trim()) {
      alert('请输入NFT合约地址')
      return
    }

    if (!isValidAddress(customContract.trim())) {
      alert('请输入有效的合约地址')
      return
    }

    if (!isConnected) {
      alert('请先连接钱包')
      return
    }

    try {
      setIsLoadingCustom(true)
      const { NFTService } = await import('./services/nftService')
      
      // 使用当前provider创建NFT服务
      const nftService = new NFTService(provider)
      
      // 获取自定义合约信息
      const contractInfo = {
        address: customContract.trim(),
        name: 'Custom NFT Contract',
        symbol: 'CUSTOM',
        opensea: `https://opensea.io/assets/ethereum/${customContract.trim()}`
      }

      const userNFTs = await nftService.getNFTsFromContract(
        account, 
        customContract.trim(), 
        contractInfo
      )

      setCustomNfts(userNFTs)
      setShowCustomNfts(true)
    } catch (error) {
      console.error('获取自定义合约NFT失败:', error)
      alert('获取NFT失败，请检查合约地址是否正确')
    } finally {
      setIsLoadingCustom(false)
    }
  }

  // 返回默认NFT显示
  const showDefaultNFTs = () => {
    setShowCustomNfts(false)
    setCustomNfts([])
    setCustomContract('')
  }

  // 决定显示哪些NFT
  const displayNfts = showCustomNfts 
    ? customNfts 
    : (isConnected ? nfts : exampleNfts)

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
            
            {/* 自定义合约输入区域 */}
            <div className="custom-contract-section">
              <h3>查看自定义NFT合约</h3>
              <div className="contract-input-group">
                <input
                  type="text"
                  value={customContract}
                  onChange={(e) => setCustomContract(e.target.value)}
                  placeholder="输入NFT合约地址 (0x...)"
                  className="contract-input"
                  disabled={isLoadingCustom}
                />
                <button 
                  onClick={loadCustomContractNFTs}
                  disabled={isLoadingCustom}
                  className="search-button"
                >
                  {isLoadingCustom ? '加载中...' : '查看NFT'}
                </button>
              </div>
              {showCustomNfts && (
                <div className="current-view">
                  <p>当前显示: 自定义合约 {customContract}</p>
                  <button onClick={showDefaultNFTs} className="back-button">
                    返回默认NFT
                  </button>
                </div>
              )}
            </div>

            {/* 原有的加载状态显示 */}
            {!showCustomNfts && (
              <>
                {isLoadingNFTs && (
                  <div className="loading">
                    <p>正在加载BAYC和Azuki NFT...</p>
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
              </>
            )}

            {/* 自定义合约加载状态 */}
            {showCustomNfts && (
              <>
                {isLoadingCustom && (
                  <div className="loading">
                    <p>正在加载自定义合约NFT...</p>
                  </div>
                )}
                {!isLoadingCustom && customNfts.length === 0 && (
                  <div className="no-nfts">
                    <p>您的钱包中没有此合约的NFT</p>
                  </div>
                )}
              </>
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
