# PacketLens
### Real-Time 3D Network Traffic Visualizer
**Engineered by Harry Sandhu**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Stack](https://img.shields.io/badge/Stack-Python%20%7C%20Three.js%20%7C%20WebSockets-blue)](https://github.com/hsandhu01)

> "Visualizing the invisible flow of data."

PacketLens is a network analysis tool that bridges low-level packet capturing with high-performance 3D rendering. It captures raw TCP/UDP frames from the network interface card (NIC) and visualizes them as particles in a 3D space, providing an immersive view of network traffic density and protocol distribution.

---

## Architecture

### 1. The Backend (Python & Scapy)
* **Packet Sniffing:** Uses `scapy` to tap into the network adapter in promiscuous mode.
* **Protocol Parsing:** Analyzing IP headers to distinguish between TCP (Blue), UDP (Red), and other protocols.
* **Real-Time Streaming:** Uses `Flask-SocketIO` to emit lightweight JSON payloads to connected clients via WebSockets (Event-driven architecture).

### 2. The Frontend (React & Three.js)
* **3D Rendering:** Uses `react-three-fiber` (WebGL) to render thousands of particles at 60fps.
* **State Management:** React manages the WebSocket connection and state, while Three.js handles the physics and geometry of the particle system.

## Tech Stack
* **Backend:** Python 3.10+, Flask, Socket.IO, Scapy
* **Frontend:** React, TypeScript, Vite
* **Graphics:** Three.js, React Three Fiber, Drei

## Local Setup

**1. Clone the Repo**
```bash
git clone [https://github.com/hsandhu01/packet-lens.git](https://github.com/hsandhu01/packet-lens.git)
cd packet-lens