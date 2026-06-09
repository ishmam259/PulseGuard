import websocket
import json
import time

ws = websocket.WebSocket()
ws.connect("ws://localhost:8081/chat/global")
print("Connected")

join_msg = {"userId": "tester", "type": "JOIN"}
ws.send(json.dumps(join_msg))
print("Sent JOIN")

resp = ws.recv()
print(f"Received: {resp}")

time.sleep(1)
chat_msg = {"userId": "tester", "type": "MESSAGE", "message": "Hello from python"}
ws.send(json.dumps(chat_msg))
print("Sent MESSAGE")

resp = ws.recv()
print(f"Received: {resp}")

ws.close()
