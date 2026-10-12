import type { CatalogRepository, CutterRecord, DesignRecord, ShapeRecord } from "./catalog-repository";
type Statement = { bind(...values: unknown[]): Statement; first<T>(): Promise<T | null>; all<T>(): Promise<{results: T[]}> };
type Database = { prepare(sql: string): Statement };
type ShapeRow = { id: string; name: string; maker: string | null; notes: string | null };
type DesignRow = { id: string; name: string; notes: string | null };
type CutterRow = { id: string; shape_id: string; location_id: string | null; width_mm: number | null; height_mm: number | null; quantity: number };
export class D1CatalogRepository implements CatalogRepository {
  constructor(private readonly db: Database) {}
  getShape(id: string): Promise<ShapeRecord | null> {
    return this.db.prepare("SELECT id,name,maker,notes FROM shapes WHERE id=?").bind(id).first<ShapeRow>();
  }
  async findShapes(query: string, limit: number): Promise<ShapeRecord[]> {
    const safeLimit = Math.max(1, Math.min(100, Math.trunc(limit)));
    const escaped = query.replace(/[\\%_]/g, "\\$&");
    const result = await this.db.prepare("SELECT id,name,maker,notes FROM shapes WHERE name LIKE ? ESCAPE '\\' ORDER BY name LIMIT ?").bind("%"+escaped+"%", safeLimit).all<ShapeRow>();
    return result.results;
  }
  getDesign(id: string): Promise<DesignRecord | null> {
    return this.db.prepare("SELECT id,name,notes FROM designs WHERE id=?").bind(id).first<DesignRow>();
  }
  async listCuttersForShape(shapeId: string): Promise<CutterRecord[]> {
    const result = await this.db.prepare("SELECT id,shape_id,location_id,width_mm,height_mm,quantity FROM physical_cutters WHERE shape_id=?").bind(shapeId).all<CutterRow>();
    return result.results.map(r => ({id:r.id,shapeId:r.shape_id,locationId:r.location_id,widthMm:r.width_mm,heightMm:r.height_mm,quantity:r.quantity}));
  }
}
