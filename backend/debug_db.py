"""Debug: show the resolved DATABASE_URL and which tables exist in the connected database."""
import os
import sys
sys.path.insert(0, '.')

from core.config import settings
from database import engine
from sqlalchemy import inspect, text

print(f"DATABASE_URL = {settings.DATABASE_URL}")
print(f"CWD = {os.getcwd()}")
print(f"Engine URL = {engine.url}")

inspector = inspect(engine)
tables = inspector.get_table_names()
print(f"\nTables found via SQLAlchemy engine: {tables}")

if 'users' in tables:
    cols = inspector.get_columns('users')
    print("\nColumns in 'users':")
    for c in cols:
        print(f"  {c['name']} ({c['type']})")
else:
    print("\n'users' table NOT FOUND - create_all needed!")
