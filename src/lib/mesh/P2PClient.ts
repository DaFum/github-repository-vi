// Placeholder for simple-peer types as we are using it via npm
// In a real env, we'd install @types/simple-peer
import SimplePeer from 'simple-peer'
import { Lifecycle } from '../interfaces'

export type PeerMessage = {
  type: 'handshake' | 'task_request' | 'task_response' | 'error'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: any
}

export class P2PClient implements Lifecycle {
  private peer: SimplePeer.Instance | null = null
  private isInitiator: boolean
  private onConnectCallback?: () => void
  private onDataCallback?: (data: PeerMessage) => void

  constructor(initiator: boolean = false) {
    this.isInitiator = initiator
  }

  initialize() {
    // Note: In a browser env, we need 'wrtc' polyfill if strictly node, but simple-peer handles browser natively.
    // However, Vite might need defining 'global' or 'process'.
    // For now, assume standard browser WebRTC support.

    this.peer = new SimplePeer({
      initiator: this.isInitiator,
      trickle: false,
    })

    this.peer.on('signal', (data) => {
      // In a real app, this signal data is what you copy-paste via WhatsApp/Link
      if (process.env.NODE_ENV === 'development') {
        console.log('SIGNAL DATA (Share this):', JSON.stringify(data))
      }
    })

    this.peer.on('connect', () => {
      console.log('P2P CONNECTION ESTABLISHED')
      if (this.onConnectCallback) this.onConnectCallback()
    })

    this.peer.on('data', (data) => {
      try {
        const message = JSON.parse(data.toString())
        if (this.onDataCallback) this.onDataCallback(message)
      } catch (e) {
        console.error('Failed to parse P2P message', e)
      }
    })
  }

  dispose() {
    if (this.peer) {
      this.peer.destroy()
      this.peer = null
    }
  }

  // To complete the handshake, we need to pass the other peer's signal data here
  signal(data: string) {
    if (this.peer) {
      this.peer.signal(JSON.parse(data))
    }
  }

  send(message: PeerMessage) {
    if (this.peer && this.peer.connected) {
      this.peer.send(JSON.stringify(message))
    } else {
      console.warn('P2P not connected')
    }
  }

  onConnect(cb: () => void) {
    this.onConnectCallback = cb
  }

  onData(cb: (data: PeerMessage) => void) {
    this.onDataCallback = cb
  }
}

export class AgentHandshakeProtocol {
  static createRequest(taskDescription: string): PeerMessage {
    return {
      type: 'task_request',
      payload: { task: taskDescription, timestamp: Date.now() },
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static createResponse(result: any): PeerMessage {
    return {
      type: 'task_response',
      payload: { result, timestamp: Date.now() },
    }
  }
}

export const createP2PClient = (initiator: boolean) => new P2PClient(initiator)
