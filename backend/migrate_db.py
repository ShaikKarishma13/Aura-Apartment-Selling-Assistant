import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Load backend environment variables
load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/selling_apartment_agent")

print(f"Connecting to database: {DATABASE_URL}")
engine = create_engine(DATABASE_URL)

alter_queries = [
    "ALTER TABLE call_history ADD COLUMN IF NOT EXISTS summary TEXT;",
    "ALTER TABLE call_history ADD COLUMN IF NOT EXISTS key_points TEXT;",
    "ALTER TABLE call_history ADD COLUMN IF NOT EXISTS requirements TEXT;",
    "ALTER TABLE call_history ADD COLUMN IF NOT EXISTS next_action TEXT;",
    "ALTER TABLE call_history ADD COLUMN IF NOT EXISTS follow_up_notes TEXT;"
]

with engine.connect() as conn:
    for query in alter_queries:
        try:
            conn.execute(text(query))
            # Commit the transaction explicitly
            conn.commit()
            print(f"Executed successfully: {query}")
        except Exception as e:
            print(f"Error executing '{query}': {e}")

print("Migration completed.")
