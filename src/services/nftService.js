import { ethers } from 'ethers'
import { NFT_CONTRACTS, ERC721_ABI } from '../constants/contracts'

export class NFTService {
  constructor(provider) {
    this.provider = provider
  }

  async getUserNFTs(address) {
    try {
      const allNFTs = []
      
      // 获取BAYC NFTs
      const baycNFTs = await this.getNFTsFromContract(
        address, 
        NFT_CONTRACTS.BAYC.address, 
        NFT_CONTRACTS.BAYC
      )
      allNFTs.push(...baycNFTs)

      // 获取Azuki NFTs
      const azukiNFTs = await this.getNFTsFromContract(
        address, 
        NFT_CONTRACTS.AZUKI.address, 
        NFT_CONTRACTS.AZUKI
      )
      allNFTs.push(...azukiNFTs)

      return allNFTs
    } catch (error) {
      console.error('获取NFT失败:', error)
      throw error
    }
  }

  async getNFTsFromContract(ownerAddress, contractAddress, contractInfo) {
    try {
      const contract = new ethers.Contract(contractAddress, ERC721_ABI, this.provider)
      const balance = await contract.balanceOf(ownerAddress)
      const nfts = []

      // 限制最多获取10个NFT以避免请求过多
      const maxNFTs = Math.min(Number(balance), 10)

      for (let i = 0; i < maxNFTs; i++) {
        try {
          const tokenId = await contract.tokenOfOwnerByIndex(ownerAddress, i)
          const tokenURI = await contract.tokenURI(tokenId)
          
          // 获取元数据
          const metadata = await this.fetchMetadata(tokenURI)
          
          nfts.push({
            id: `${contractAddress}-${tokenId}`,
            tokenId: tokenId.toString(),
            contractAddress,
            name: metadata.name || `${contractInfo.name} #${tokenId}`,
            description: metadata.description || '',
            image: this.formatImageURL(metadata.image),
            collection: contractInfo.name,
            symbol: contractInfo.symbol,
            opensea: `${contractInfo.opensea}/${tokenId}`
          })
        } catch (tokenError) {
          console.error(`获取token ${i}失败:`, tokenError)
          // 继续获取下一个
        }
      }

      return nfts
    } catch (error) {
      console.error(`获取${contractInfo.name} NFT失败:`, error)
      return []
    }
  }

  async fetchMetadata(tokenURI) {
    try {
      // 处理IPFS URL
      const url = this.formatMetadataURL(tokenURI)
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('获取元数据失败:', error)
      return {
        name: 'Unknown NFT',
        description: '',
        image: ''
      }
    }
  }

  formatMetadataURL(url) {
    if (url.startsWith('ipfs://')) {
      return url.replace('ipfs://', 'https://ipfs.io/ipfs/')
    }
    return url
  }

  formatImageURL(url) {
    if (!url) return 'https://via.placeholder.com/300x300/6366f1/ffffff?text=NFT'
    
    if (url.startsWith('ipfs://')) {
      return url.replace('ipfs://', 'https://ipfs.io/ipfs/')
    }
    return url
  }

  // 创建示例NFT数据（当用户没有NFT时显示）
  getExampleNFTs() {
    return [
      {
        id: 'example-1',
        name: "Bored Ape #1234",
        collection: "Bored Ape Yacht Club",
        image: "https://via.placeholder.com/300x300/f59e0b/ffffff?text=BAYC+1234",
        tokenId: "1234",
        symbol: "BAYC",
        opensea: "https://opensea.io/collection/boredapeyachtclub"
      },
      {
        id: 'example-2',
        name: "Azuki #567",
        collection: "Azuki",
        image: "https://via.placeholder.com/300x300/ef4444/ffffff?text=AZUKI+567",
        tokenId: "567",
        symbol: "AZUKI",
        opensea: "https://opensea.io/collection/azuki"
      }
    ]
  }
}