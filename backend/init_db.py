"""Bootstrap script: creates the SQLite database with the correct schema."""
from database import engine, Base
from models.user import User  # Must be imported so SQLAlchemy registers the table

print("Creating database tables...")
Base.metadata.create_all(bind=engine)
print("Done! Tables created.")

# Verify
import sqlite3
conn = sqlite3.connect('app.db')
cursor = conn.cursor()
cursor.execute("PRAGMA table_info(users);")
rows = cursor.fetchall()
print("\nColumns in 'users' table:")
for row in rows:
    print(f"  cid={row[0]}  name={row[1]}  type={row[2]}")
conn.close()
