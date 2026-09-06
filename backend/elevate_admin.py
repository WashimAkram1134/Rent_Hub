import asyncio
from app.database.session import AsyncSessionLocal
from app.models.user import User
from app.models.user import Role
from sqlalchemy import select

async def main():
    async with AsyncSessionLocal() as db:
        user = await db.scalar(select(User).where(User.email == "washimakram013099@gmail.com"))
        if not user:
            print("User not found.")
            return

        admin_role = await db.scalar(select(Role).where(Role.name == "admin"))
        if not admin_role:
            admin_role = Role(name="admin", description="Administrator")
            db.add(admin_role)
            await db.commit()
            
        if admin_role not in user.roles:
            user.roles.append(admin_role)
            await db.commit()
            print(f"Successfully elevated {user.email} to Admin!")
        else:
            print(f"User {user.email} is already an Admin.")

asyncio.run(main())
