-- Physical photographs belong to an inventory record, never every size of a reference.
CREATE TABLE physical_cutter_attachments (
 cutter_id TEXT NOT NULL REFERENCES physical_cutters(id),
 attachment_id TEXT NOT NULL REFERENCES attachments(id),
 purpose TEXT NOT NULL CHECK(purpose='photo'),
 PRIMARY KEY(cutter_id,attachment_id)
);
