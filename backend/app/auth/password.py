"""
RentHub — Password Hashing using direct bcrypt library

Since passlib is deprecated and has compatibility bugs with newer versions
of the bcrypt library (especially on newer Python versions), we use the
bcrypt library directly.
"""

from __future__ import annotations

import bcrypt

from app.core.config import settings


def hash_password(plain_password: str) -> str:
    """Return a bcrypt hash of the given password."""
    # Ensure password length does not exceed bcrypt's limit
    if len(plain_password) > 72:
        plain_password = plain_password[:72]
    
    salt = bcrypt.gensalt(rounds=settings.BCRYPT_ROUNDS)
    hashed = bcrypt.hashpw(plain_password.encode("utf-8"), salt)
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Return True if the plain password matches the stored hash."""
    try:
        # Ensure password length does not exceed bcrypt's limit
        if len(plain_password) > 72:
            plain_password = plain_password[:72]
            
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8")
        )
    except Exception:
        return False


def is_password_strong(password: str) -> tuple[bool, str]:
    """
    Validate password strength.

    Rules:
    - Minimum length from settings (default 8)
    - At least one uppercase letter
    - At least one lowercase letter
    - At least one digit
    - At least one special character

    Returns: (is_valid, error_message)
    """
    if len(password) < settings.PASSWORD_MIN_LENGTH:
        return False, f"Password must be at least {settings.PASSWORD_MIN_LENGTH} characters long."
    if not any(c.isupper() for c in password):
        return False, "Password must contain at least one uppercase letter."
    if not any(c.islower() for c in password):
        return False, "Password must contain at least one lowercase letter."
    if not any(c.isdigit() for c in password):
        return False, "Password must contain at least one number."
    if not any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in password):
        return False, "Password must contain at least one special character."
    return True, ""
