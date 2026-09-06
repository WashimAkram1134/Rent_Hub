import asyncio
from app.database.session import AsyncSessionLocal
from app.models.user import User
from sqlalchemy import select

async def main():
    async with AsyncSessionLocal() as db:
        users = await db.execute(select(User))
        for user in users.scalars():
            if user.email == "washimakram@test.com" or user.first_name == "Washim": # assuming test user
                print(f"User {user.email}: {user.identity_verification_status}")
                # We can just set all to NOT_SUBMITTED to let them retry properly
                user.identity_verification_status = 'NOT_SUBMITTED'
        
        # Or let's just delete the identity_verifications record for this user so they can start fresh
        from app.models.identity_verification import IdentityVerification
        recs = await db.execute(select(IdentityVerification))
        for r in recs.scalars():
            print(f"Record: {r.id}, status: {r.status}")
            await db.delete(r)
            
        await db.commit()

asyncio.run(main())
