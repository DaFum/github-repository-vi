// Placeholder for simple-peer types as we are using it via npm
// In a real env, we'd install @types/simple-peer
import SimplePeer from 'simple-peer'
import { Lifecycle } from '../interfaces'

/**
 * Represents a message exchanged between peers.
 */
export type PeerMessage = {
  type: 'handshake' | 'task_request' | 'task_response' | 'error'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: any
}

/**
 * Handles Peer-to-Peer communication using SimplePeer.
 */
export class P2PClient implements Lifecycle {
  private peer: SimplePeer.Instance | null = null
  private isInitiator: boolean
  private onConnectCallback?: () => void
  private onDataCallback?: (data: PeerMessage) => void

  constructor(initiator: boolean = false) {
    this.isInitiator = initiator
  }

  /**
   * Initializes the P2P client and sets up event listeners.
   */
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

  /**
   * Destroys the peer connection and cleans up resources.
   */
  dispose() {
    if (this.peer) {
      this.peer.destroy()
      this.peer = null
    }
  }

  /**
   * Signals the peer with connection data from the remote peer.
   * @param data The signal data string.
   */
  signal(data: string) {
    if (this.peer) {
      this.peer.signal(JSON.parse(data))
    }
  }

  /**
   * Sends a message to the connected peer.
   * @param message The message object to send.
   */
  send(message: PeerMessage) {
    if (this.peer && this.peer.connected) {
      this.peer.send(JSON.stringify(message))
    } else {
      console.warn('P2P not connected')
    }
  }

  /**
   * Sets the callback for when a connection is established.
   * @param cb The callback function.
   */
  onConnect(cb: () => void) {
    this.onConnectCallback = cb
  }

  /**
   * Sets the callback for when data is received.
   * @param cb The callback function.
   */
  onData(cb: (data: PeerMessage) => void) {
    this.onDataCallback = cb
  }
}

/**
 * Protocol helpers for agent handshake and task exchange.
 */
export class AgentHandshakeProtocol {
  /**
   * Creates a task request message.
   * @param taskDescription Description of the task.
   * @returns A PeerMessage object.
   */
  static createRequest(taskDescription: string): PeerMessage {
    return {
      type: 'task_request',
      payload: { task: taskDescription, timestamp: Date.now() },
    }
  }

  /**
   * Creates a task response message.
   * @param result The result of the task.
   * @returns A PeerMessage object.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static createResponse(result: any): PeerMessage {
    return {
      type: 'task_response',
      payload: { result, timestamp: Date.now() },
    }
  }
}

/**
 * Factory to create a P2PClient instance.
 * @param initiator Whether this client is initiating the connection.
 */
export const createP2PClient = (initiator: boolean) => new P2PClient(initiator)
