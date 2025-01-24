import { useState, useEffect } from 'react'
import { ethers } from 'ethers'

export const useWallet = () => {
  const [account, setAccount] = useState('')
  const [isConnecting, setIsConnecting] = useState(false)
  const [provider, setProvider] = useState(null)

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
    localStorage.removeItem('walletConnected')
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
  }, [])

  return {
    account,
    isConnecting,
    provider,
    connectWallet,
    disconnectWallet,
    formatAddress,
    isConnected: !!account
  }
}