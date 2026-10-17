import assert from "node:assert/strict";
import {test} from "node:test";
import React from "react";
import {renderToStaticMarkup} from "react-dom/server";
import {Attachments} from "../src/Attachments";
import {Catalog} from "../src/Catalog";
test("viewer controls retain browsing without create, upload or maintenance",()=>{
  const catalog=renderToStaticMarkup(React.createElement(Catalog,{canEdit:false,onSaved:()=>{}}));
  assert.match(catalog,/Search record metadata/);
  assert.doesNotMatch(catalog,/Create record|New record|Save changes/);
  const files=renderToStaticMarkup(React.createElement(Attachments,{canEdit:false,canManage:false}));
  assert.match(files,/Private files/);
  assert.doesNotMatch(files,/type="file"|Save private file|Storage cleanup|Check unlinked files/);
  const ownerFiles=renderToStaticMarkup(React.createElement(Attachments,{canEdit:true,canManage:true}));
  assert.match(ownerFiles,/Save private file/);
  assert.match(ownerFiles,/Check unlinked files/);
});
