import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { NFTService } from '../services/nftService'

export const useWallet = () => {
  const [account, setAccount] = useState('')
  const [isConnecting, setIsConnecting] = useState(false)
  const [provider, setProvider] = useState(null)
  const [nfts, setNfts] = useState([])
  const [isLoadingNFTs, setIsLoadingNFTs] = useState(false)
  const [nftService, setNftService] = useState(null)

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('请安装 MetaMask!')
      return
    }

    try {
      setIsConnecting(true)
      const provider = new ethers.BrowserProvider(window.ethereum)
      const accounts = await provider.send('eth_requestAccounts', [])
      
      if (accounts.length > 0) {
        setAccount(accounts[0])
        setProvider(provider)
        localStorage.setItem('walletConnected', 'true')
        
        // 创建NFT服务并获取NFT
        const service = new NFTService(provider)
        setNftService(service)
        await loadUserNFTs(accounts[0], service)
      }
    } catch (error) {
      console.error('连接钱包失败:', error)
      alert('连接钱包失败')
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectWallet = () => {
    setAccount('')
    setProvider(null)
    setNfts([])
    setNftService(null)
    localStorage.removeItem('walletConnected')
  }

  const loadUserNFTs = async (address, service) => {
    try {
      setIsLoadingNFTs(true)
      const userNFTs = await service.getUserNFTs(address)
      
      // 如果用户没有NFT，显示示例数据
      if (userNFTs.length === 0) {
        setNfts(service.getExampleNFTs())
      } else {
        setNfts(userNFTs)
      }
    } catch (error) {
      console.error('加载NFT失败:', error)
      // 发生错误时显示示例数据
      if (service) {
        setNfts(service.getExampleNFTs())
      }
    } finally {
      setIsLoadingNFTs(false)
    }
  }

  const formatAddress = (address) => {
    if (!address) return ''
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  useEffect(() => {
    const checkWalletConnection = async () => {
      if (window.ethereum && localStorage.getItem('walletConnected')) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum)
          const accounts = await provider.listAccounts()
          if (accounts.length > 0) {
            setAccount(accounts[0].address)
            setProvider(provider)
            
            // 重新创建NFT服务并获取NFT
            const service = new NFTService(provider)
            setNftService(service)
            await loadUserNFTs(accounts[0].address, service)
          }
        } catch (error) {
          console.error('检查钱包连接失败:', error)
        }
      }
    }

    checkWalletConnection()

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          disconnectWallet()
        } else {
          setAccount(accounts[0])
          // 账户变更时重新加载NFT
          if (nftService) {
            loadUserNFTs(accounts[0], nftService)
          }
        }
      })

      window.ethereum.on('chainChanged', () => {
        window.location.reload()
      })
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged')
        window.ethereum.removeAllListeners('chainChanged')
      }
    }
  }, [nftService])

  return {
    account,
    isConnecting,
    provider,
    nfts,
    isLoadingNFTs,
    connectWallet,
    disconnectWallet,
    formatAddress,
    isConnected: !!account,
    loadUserNFTs: () => nftService && loadUserNFTs(account, nftService)
  }
}