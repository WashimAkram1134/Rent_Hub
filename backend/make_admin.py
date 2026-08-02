import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
import os

# Create engine (using asyncpg)
DATABASE_URL = "postgresql+asyncpg://renthub:renthub_secret@localhost:5432/renthub"

async def make_admin():
    engine = create_async_engine(DATABASE_URL)
    async with engine.begin() as conn:
        # First let's get all users to see who exists
        result = await conn.execute(text("SELECT id, email, first_name, last_name, primary_role FROM users"))
        users = result.fetchall()
        
        print("Existing Users:")
        target_email = None
        for u in users:
            print(f"ID: {u.id}, Email: {u.email}, Name: {u.first_name} {u.last_name}, Role: {u.primary_role}")
            if u.email != "admin@example.com":  # Just picking a target
                target_email = u.email

        if not target_email and users:
            target_email = users[0].email

        if target_email:
            print(f"\nMaking {target_email} an admin...")
            await conn.execute(
                text("UPDATE users SET primary_role = 'admin' WHERE email = :email"),
                {"email": target_email}
            )
            print("Done!")
        else:
            print("No users found to make admin.")

if __name__ == "__main__":
    asyncio.run(make_admin())
