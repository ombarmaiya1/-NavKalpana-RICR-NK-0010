import sqlite3

try:
    conn = sqlite3.connect('app.db')
    cursor = conn.cursor()
    cursor.execute("PRAGMA table_info(users);")
    rows = cursor.fetchall()
    if rows:
        print("Columns in 'users' table:")
        for row in rows:
            print(f"  cid={row[0]} name={row[1]} type={row[2]} notnull={row[3]} default={row[4]} pk={row[5]}")
    else:
        print("Table 'users' not found or no columns.")
    conn.close()
except Exception as e:
    print(f"Error: {e}")
