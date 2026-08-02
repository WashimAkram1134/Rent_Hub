"""
RentHub Backend — Standard API Response Wrappers

All endpoints return a consistent JSON envelope:

Success:
{
  "success": true,
  "message": "...",   // optional
  "data": { ... }
}

Error responses are handled by exception handlers in core/exceptions.py.
"""

from __future__ import annotations

from typing import Any, Generic, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


class SuccessResponse(BaseModel, Generic[T]):
    """Standard success response envelope."""

    success: bool = True
    message: str | None = None
    data: T | None = None

    @classmethod
    def ok(
        cls,
        data: T | None = None,
        message: str | None = None,
    ) -> "SuccessResponse[T]":
        return cls(success=True, data=data, message=message)


class MessageResponse(BaseModel):
    """Simple message-only response (e.g., for 204-like success confirmations)."""

    success: bool = True
    message: str


def success(data: Any = None, message: str | None = None) -> dict[str, Any]:
    """
    Quick helper to build a success response dict.

    Usage:
        return success(data=product_schema, message="Product created successfully.")
    """
    response: dict[str, Any] = {"success": True}
    if message:
        response["message"] = message
    if data is not None:
        response["data"] = data
    return response
