/** Shapes returned by the Logistics (api/wh/*) endpoints. */

export interface WhPermissions {
  ready: boolean;
  can_count: boolean;
}

export interface WhLocation {
  id: number;
  name: string;
}

export interface WhItem {
  id: number;
  item_code: string;
  part_name: string;
  unit: string;
  safety: number;
  on_hand: number;
  // only when a single item is opened (wh/items/{id}/stock)
  reserved?: number;
  other_committed?: number;
  on_po?: number;
  available?: number;
}

export interface WhItemLocation {
  room_id: number;
  location: string;
  type: string;
  on_hand: number;
  available: number;
}

export interface WhStocktake {
  id: number;
  doc_no: string;
  scope: string;        // 'location' | 'part'
  location: string;
  parts: string;
  count_date: string;
  status: string;       // Open | Recount | Review | Pending Approval | Approved | Posted | Cancelled
  round: number;        // 1 = first count, 2 = recount of the lines with a big difference
  remarks: string;
  total: number;
  counted: number;
}

export interface WhStocktakeLine {
  id: number;
  inventory_id: number;
  item_code: string;
  part_name: string;
  unit: string;
  room_id: number;
  location: string;
  system_qty: number;
  counted_qty: number;  // count of the current round, null until counted
  countable: boolean;   // false for the lines that are not part of a 2nd count
  recount: boolean;     // sent for a 2nd count
  // used by the count page only
  input?: any;
  pending?: boolean;
}

/** One row of the item history (the stock ledger). Field names are the web's. */
export interface WhMovement {
  Id: number;
  Date: string;
  Action: string;
  Direction: string;    // 'IN' | 'OUT' | '-'
  Quantity: number;     // signed: plus for IN, minus for OUT
  Location: string;
  From: string;
  To: string;
  Ownership: string;
  DocType: string;
  DocNo: string;
  Remarks: string;
  CreatedBy: string;
  Balance: number;      // balance after this row, null when the IN/OUT filter is on
}

export interface WhHistory {
  item: { Id: number, Item_Code: string, Part_Name: string, Unit: string };
  opening: number;
  closing: number;
  total_in: number;
  total_out: number;
  total: number;
  page: number;
  per_page: number;
  pages: number;
  data: WhMovement[];
}

/** One unit with a serial number (wh/serial). */
export interface WhSerial {
  id: number;
  serial_no: string;
  item_id: number;
  item_code: string;
  part_name: string;
  unit: string;
  condition: string;
  state: string;        // 'store' | 'technician' | 'delivery' | 'site'
  where: string;        // e.g. 'In store: WH01 / STORAGE LOCATION 1' or 'With Mohd Saiful'
  location: string;     // the room it was received into
  holder: string;       // technician who has it, if any
  since: string;        // when the last hand-over happened
  detail: string;
  receiving_no: string;
  received_at: string;
  company: string;
  segment: string;
  ownership: string;
}

export interface WhSerialLookup {
  ok: boolean;
  serials: WhSerial[];
  item_match: { id: number, item_code: string, part_name: string };   // the code is a part label, not a serial
}

/** One event in the life of a unit. */
export interface WhSerialEvent {
  when: string;
  type: string;         // Received | Allocated | On Hand | On Delivery | On Site | Returned | Status
  text: string;
  by: string;
  remarks: string;
}

/** One count typed on the phone that has not reached the server yet. */
export interface WhQueuedCount {
  stocktakeId: number;
  lineId: number;
  qty: number;
  at: number;
}
