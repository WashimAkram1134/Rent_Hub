import asyncio
import json
import logging
from collections import defaultdict
from typing import Any
from uuid import UUID

from fastapi import WebSocket
from redis.asyncio import Redis

from app.database.redis import get_redis_pool

logger = logging.getLogger(__name__)

class WebSocketManager:
    def __init__(self):
        # user_id -> set of active WebSockets
        self.active_connections: dict[str, set[WebSocket]] = defaultdict(set)
        self.redis: Redis | None = None
        self.pubsub = None
        self.task = None

    async def startup(self):
        self.redis = await get_redis_pool()
        self.pubsub = self.redis.pubsub()
        await self.pubsub.subscribe("renthub_ws_channel")
        self.task = asyncio.create_task(self._listen_to_redis())
        logger.info("WebSocketManager startup complete")

    async def shutdown(self):
        if self.task:
            self.task.cancel()
        if self.pubsub:
            await self.pubsub.unsubscribe("renthub_ws_channel")
            await self.pubsub.close()
        logger.info("WebSocketManager shutdown complete")

    async def connect(self, websocket: WebSocket, user_id: UUID | str):
        await websocket.accept()
        user_id_str = str(user_id)
        self.active_connections[user_id_str].add(websocket)
        logger.info(f"WebSocket connected for user {user_id_str}")

    def disconnect(self, websocket: WebSocket, user_id: UUID | str):
        user_id_str = str(user_id)
        if user_id_str in self.active_connections:
            self.active_connections[user_id_str].discard(websocket)
            if not self.active_connections[user_id_str]:
                del self.active_connections[user_id_str]
        logger.info(f"WebSocket disconnected for user {user_id_str}")

    async def broadcast_to_user(self, user_id: UUID | str, message: dict[str, Any]):
        """Publish message to Redis for a specific user"""
        if self.redis:
            payload = json.dumps({"user_id": str(user_id), "data": message})
            await self.redis.publish("renthub_ws_channel", payload)
        else:
            # Fallback if no redis
            await self._send_to_local_user(str(user_id), message)

    async def _send_to_local_user(self, user_id_str: str, message: dict[str, Any]):
        """Send message directly to user's connected WebSockets on this instance"""
        if user_id_str in self.active_connections:
            dead_sockets = set()
            for ws in self.active_connections[user_id_str]:
                try:
                    await ws.send_json(message)
                except Exception as e:
                    logger.error(f"Error sending ws message: {e}")
                    dead_sockets.add(ws)
            for ws in dead_sockets:
                self.active_connections[user_id_str].discard(ws)

    async def _listen_to_redis(self):
        """Background task to listen for Redis pub/sub messages"""
        try:
            async for message in self.pubsub.listen():
                if message["type"] == "message":
                    data = json.loads(message["data"])
                    user_id = data.get("user_id")
                    payload = data.get("data")
                    if user_id and payload:
                        await self._send_to_local_user(user_id, payload)
        except asyncio.CancelledError:
            pass
        except Exception as e:
            logger.error(f"Redis pub/sub listener error: {e}")

ws_manager = WebSocketManager()
