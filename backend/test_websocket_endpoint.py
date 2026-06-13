import asyncio
import json
import base64
from routers.call import twilio_media_stream

class MockWebSocket:
    def __init__(self):
        self.sent_messages = []
        # We will feed it a start event, then a media event, then a stop event
        self.events = [
            {
                "event": "start",
                "streamSid": "test_stream_123",
                "start": {
                    "callSid": "test_call_123",
                    "streamSid": "test_stream_123"
                }
            },
            {
                "event": "media",
                "media": {
                    "track": "inbound",
                    "payload": base64.b64encode(b"\xff" * 160).decode("utf-8")
                }
            },
            {
                "event": "stop"
            }
        ]
        self.event_idx = 0

    async def accept(self):
        print("[MockWS] accept() called")

    async def receive_text(self):
        if self.event_idx < len(self.events):
            evt = self.events[self.event_idx]
            self.event_idx += 1
            print(f"[MockWS] receive_text() -> sending event: {evt['event']}")
            return json.dumps(evt)
        else:
            # Sleep to simulate waiting, then raise disconnect
            await asyncio.sleep(1)
            raise Exception("Mock disconnect")

    async def send_json(self, data):
        print(f"[MockWS] send_json() called with keys: {list(data.keys())}")
        self.sent_messages.append(data)

async def run_test():
    print("Starting direct handler test...")
    ws = MockWebSocket()
    try:
        await twilio_media_stream(ws)
        print("Handler exited cleanly.")
    except Exception as e:
        print("HANDLER FAILED WITH EXCEPTION:")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(run_test())
