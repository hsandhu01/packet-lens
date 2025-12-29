from flask import Flask
from flask_socketio import SocketIO
from scapy.all import sniff, IP, TCP, UDP
import threading
import asyncio
import json

# Initialize Flask & SocketIO
app = Flask(__name__)
# cors_allowed_origins="*" allows React (on port 5173) to connect
socketio = SocketIO(app, cors_allowed_origins="*")

print("🔌 PacketLens Backend Initialized...")

def packet_callback(packet):
    """
    This function runs for EVERY single packet your computer receives.
    """
    if IP in packet:
        try:
            # Extract basic IP info
            src_ip = packet[IP].src
            dst_ip = packet[IP].dst
            proto = packet[IP].proto
            length = len(packet)

            # Determine protocol name
            protocol_name = "OTHER"
            if proto == 6:
                protocol_name = "TCP"
            elif proto == 17:
                protocol_name = "UDP"

            # Create a clean data object
            packet_data = {
                "src": src_ip,
                "dst": dst_ip,
                "protocol": protocol_name,
                "size": length
            }

            # Emit to frontend via WebSocket
            # 'broadcast=True' sends it to all connected React clients
            socketio.emit('packet_data', packet_data)
            
            # Print to console just to verify it's working
            print(f"[Packet] {src_ip} -> {dst_ip} ({protocol_name})")

        except Exception as e:
            pass

def start_sniffing():
    """
    Starts Scapy sniffer in a separate thread so it doesn't block the Web Server
    """
    print("🕵️  Starting Packet Sniffer...")
    # iface=None defaults to the primary network interface
    # store=False prevents memory leaks (we don't need to save them, just stream them)
    sniff(prn=packet_callback, store=False)

if __name__ == '__main__':
    # Start the sniffer thread
    sniffer_thread = threading.Thread(target=start_sniffing)
    sniffer_thread.daemon = True # Kills thread when app stops
    sniffer_thread.start()

    # Start the Web Socket Server
    print("🚀 Server running on http://localhost:5000")
    socketio.run(app, port=5000, debug=False)