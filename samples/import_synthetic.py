"""Load synthetic fixtures into disposable SQLite memory database."""
import json
import sqlite3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

def load_fixture():
    data = json.loads((ROOT / "samples/synthetic_catalog.json").read_text(encoding="utf-8"))
    db = sqlite3.connect(":memory:")
    db.execute("PRAGMA foreign_keys = ON")
    for name in ("0001_initial.sql", "0002_variants_components.sql"):
        db.executescript((ROOT / "database/migrations" / name).read_text(encoding="utf-8"))
    for x in data["shapes"]:
        db.execute("INSERT INTO shapes(id,name) VALUES (?,?)", (x["id"], x["name"]))
    for x in data["locations"]:
        db.execute("INSERT INTO locations(id,label) VALUES (?,?)", (x["id"], x["label"]))
    for x in data["physicalCutters"]:
        db.execute("INSERT INTO physical_cutters(id,shape_id,location_id,width_mm,height_mm,quantity) VALUES (?,?,?,?,?,?)",
                   (x["id"],x["shapeId"],x["locationId"],x["widthMm"],x["heightMm"],x["quantity"]))
    for x in data["designs"]:
        db.execute("INSERT INTO designs(id,name) VALUES (?,?)", (x["id"],x["name"]))
    for x in data["designLinks"]:
        db.execute("INSERT INTO design_shape_links(id,design_id,shape_id,status,use_type) VALUES (?,?,?,?,?)",
                   (x["id"],x["designId"],x["shapeId"],x["status"],x["useType"]))
    for x in data["tags"]:
        db.execute("INSERT INTO tags(id,label) VALUES (?,?)", (x["id"],x["label"]))
    for x in data["designTags"]:
        db.execute("INSERT INTO design_tags(design_id,tag_id) VALUES (?,?)", (x["designId"],x["tagId"]))
    return db

def test_fixture():
    db = load_fixture()
    rows = db.execute("""SELECT d.name,s.name,pc.width_mm,l.label
      FROM designs d JOIN design_shape_links m ON m.design_id=d.id
      JOIN shapes s ON s.id=m.shape_id
      JOIN physical_cutters pc ON pc.shape_id=s.id
      JOIN locations l ON l.id=pc.location_id
      JOIN design_tags dt ON dt.design_id=d.id
      JOIN tags t ON t.id=dt.tag_id WHERE t.label=?""", ("Christmas",)).fetchall()
    assert rows == [("Winter woodland tree","Evergreen tree",80.0,"DEMO bin A")], rows
    assert db.execute("PRAGMA foreign_key_check").fetchall() == []
    db.close()

if __name__ == "__main__":
    test_fixture()
    print("Synthetic import and reverse lookup passed")
