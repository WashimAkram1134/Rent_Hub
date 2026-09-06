"""
RentHub — Identity Verification Policy Service

Determines whether a user must pass identity verification before a booking.

V1: Global on/off switch (IDENTITY_VERIFICATION_REQUIRED setting).
Future: Category-based, price-based, owner-required rules.

Keep all policy logic HERE — not scattered in booking endpoints.
"""

from __future__ import annotations

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)


class IdentityVerificationPolicyService:
    """
    Determines if identity verification is required for a given booking context.

    Design for extension:
    - V1: global on/off
    - V2: category-based (Vehicle, Electronics > price, Apartment, Camera)
    - V3: owner can require verification for their listings
    """

    def requires_verification_for_booking(
        self,
        user: object,
        product: object | None = None,
    ) -> bool:
        """
        Returns True if the user must be identity-verified to make this booking.

        Args:
            user:    The User ORM object (must have identity_verification_status).
            product: The Product ORM object (for future category/price checks).
        """
        # V1: Simple global flag
        if not settings.IDENTITY_VERIFICATION_REQUIRED:
            return False

        # Future hook: category-based rules
        # if product and hasattr(product, "category"):
        #     return self._requires_for_category(product.category)

        return True

    # ── Future extension points ────────────────────────────────────────────

    def _requires_for_category(self, category_slug: str) -> bool:
        """
        V2: Return True if this category requires identity verification.
        Categories like 'vehicles', 'electronics', 'apartments' can be listed here.
        """
        high_risk_categories = {"vehicles", "apartments", "electronics", "cameras"}
        return category_slug.lower() in high_risk_categories
