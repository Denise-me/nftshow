import { useState } from 'react'
import './App.css'

function App() {
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
        <h1>NFT Show</h1>
        <p>Discover and explore amazing digital artworks</p>
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
