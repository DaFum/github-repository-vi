import { Button } from '@/components/ui/button'
import { Sparkle, SignOut } from '@phosphor-icons/react'
import { pollinations } from '@/lib/pollinations'
import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'

export function PollinationsAuth() {
  const [apiKey, setApiKey] = useState<string | null>(pollinations.getApiKey())
  const [balance, setBalance] = useState<number | null>(null)

  // Sync state on mount and intervals
  useEffect(() => {
    const checkStatus = async () => {
      const key = pollinations.getApiKey()
      setApiKey(key)
      if (key) {
        const bal = await pollinations.getBalance()
        setBalance(bal)
      } else {
        setBalance(null)
      }
    }

    checkStatus()
    const interval = setInterval(checkStatus, 30000) // Poll every 30s
    return () => clearInterval(interval)
  }, [])

  const handleLogin = () => {
    // Construct auth URL
    const redirectUrl = encodeURIComponent(window.location.href.split('#')[0]) // Clean base URL
    const authUrl = `https://enter.pollinations.ai/authorize?redirect_url=${redirectUrl}&models=flux,openai,midijourney&budget=10`
    window.location.href = authUrl
  }

  const handleLogout = () => {
    pollinations.setApiKey('')
    setApiKey(null)
    setBalance(null)
    // Clean URL
    window.history.pushState(null, '', window.location.pathname)
  }

  if (apiKey) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="border-accent/50 text-accent font-mono text-xs">
          <Sparkle size={12} weight="fill" className="mr-1" />
          POLLEN: {balance !== null ? balance : '...'}
        </Badge>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          title="Disconnect Pollinations"
          className="text-muted-foreground hover:text-destructive h-6 w-6"
        >
          <SignOut size={16} />
        </Button>
      </div>
    )
  }

  return (
    <Button
      onClick={handleLogin}
      variant="outline"
      size="sm"
      className="border-accent/50 text-accent hover:bg-accent/10 font-mono text-xs uppercase"
    >
      <Sparkle size={14} weight="fill" className="mr-2" />
      Connect Pollinations
    </Button>
  )
}
