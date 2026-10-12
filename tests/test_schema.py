"""Local SQLite smoke test; uses synthetic fixtures, never actual cutter inventory."""
import sqlite3
from pathlib import Path

SCHEMA = Path(__file__).resolve().parents[1] / "database/migrations/0001_initial.sql"

def test_schema():
    db = sqlite3.connect(":memory:")
    db.executescript(SCHEMA.read_text(encoding="utf-8"))
    db.execute("PRAGMA foreign_keys = ON")
    db.execute("INSERT INTO shapes(id,name) VALUES (?,?)", ("shape-1","Generic tree"))
    db.execute("INSERT INTO locations(id,label) VALUES (?,?)", ("loc-1","Test bin"))
    db.execute("INSERT INTO physical_cutters(id,shape_id,location_id,width_mm,height_mm) VALUES (?,?,?,?,?)", ("cutter-1","shape-1","loc-1",80,100))
    db.execute("INSERT INTO designs(id,name) VALUES (?,?)", ("design-1","Holiday tree"))
    db.execute("INSERT INTO design_shape_links(id,design_id,shape_id,status,use_type) VALUES (?,?,?,?,?)", ("link-1","design-1","shape-1","tested","flip"))
    db.execute("INSERT INTO tags(id,label) VALUES (?,?)", ("tag-1","Christmas"))
    db.execute("INSERT INTO design_tags(design_id,tag_id) VALUES (?,?)", ("design-1","tag-1"))
    rows = db.execute("""SELECT d.name, s.name, pc.width_mm, l.label
        FROM designs d JOIN design_tags dt ON dt.design_id=d.id
        JOIN tags t ON t.id=dt.tag_id
        JOIN design_shape_links m ON m.design_id=d.id
        JOIN shapes s ON s.id=m.shape_id
        JOIN physical_cutters pc ON pc.shape_id=s.id
        JOIN locations l ON l.id=pc.location_id
        WHERE t.label=?""", ("Christmas",)).fetchall()
    assert rows == [("Holiday tree","Generic tree",80.0,"Test bin")], rows
    db.execute("UPDATE physical_cutters SET width_mm=? WHERE id=?", (90,"cutter-1"))
    assert db.execute("SELECT width_mm FROM physical_cutters WHERE id='cutter-1'").fetchone()[0] == 90
    try:
        db.execute("INSERT INTO physical_cutters(id,shape_id) VALUES (?,?)", ("bad","missing"))
    except sqlite3.IntegrityError:
        pass
    else:
        raise AssertionError("Missing foreign key was accepted")
    try:
        db.execute("INSERT INTO design_shape_links(id,design_id,shape_id,status) VALUES (?,?,?,?)", ("bad2","design-1","shape-1","unreviewed"))
    except sqlite3.IntegrityError:
        pass
    else:
        raise AssertionError("Invalid status was accepted")
    db.close()

if __name__ == "__main__":
    test_schema()
    print("SQLite schema smoke test passed")
