import sqlite3
import os

db_path = os.path.join(os.getcwd(), "app.db")

if os.path.exists(db_path):
    print(f"Connecting to database at {db_path}")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        print("Attempting to add 'suggested_topics' column to 'user_resume_data' table...")
        cursor.execute("ALTER TABLE user_resume_data ADD COLUMN suggested_topics JSON")
        conn.commit()
        print("Successfully added 'suggested_topics' column.")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e).lower():
            print("Column 'suggested_topics' already exists.")
        else:
            print(f"Error adding column: {e}")
    finally:
        conn.close()
else:
    print(f"Database file not found at {db_path}")
