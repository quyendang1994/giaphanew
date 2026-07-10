import { Person, Relationship } from "@/types";
import JSZip from "jszip";
import Papa from "papaparse";

const UTF8_BOM = "\uFEFF";

// Ch\u1ED1ng CSV formula injection: c\u00E1c \u00F4 b\u1EAFt \u0111\u1EA7u b\u1EB1ng = + - @ (ho\u1EB7c tab/CR) c\u00F3 th\u1EC3
// b\u1ECB Excel/Sheets hi\u1EC3u l\u00E0 c\u00F4ng th\u1EE9c. Th\u00EAm d\u1EA5u nh\u00E1y \u0111\u01A1n \u1EDF \u0111\u1EA7u \u0111\u1EC3 v\u00F4 hi\u1EC7u ho\u00E1.
function sanitizeCsvCell<T>(value: T): T | string {
  if (typeof value !== "string") return value;
  if (/^[=+\-@\t\r]/.test(value)) {
    return `'${value}`;
  }
  return value;
}

function sanitizeRows<T extends object>(rows: T[]): T[] {
  return rows.map((row) => {
    const clean: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(row)) {
      clean[key] = sanitizeCsvCell(value);
    }
    return clean as T;
  });
}


interface PersonDetailsPrivateRow {
  person_id: string;
  phone_number: string | null;
  occupation: string | null;
  current_residence: string | null;
}

interface CustomEventRow {
  id: string;
  name: string;
  content: string | null;
  event_date: string;
  location: string | null;
  created_by: string | null;
}

export async function exportToCsvZip(data: {
  persons: Partial<Person>[];
  relationships: Partial<Relationship>[];
  person_details_private?: PersonDetailsPrivateRow[];
  custom_events?: CustomEventRow[];
}): Promise<Blob> {
  const personsCsv = UTF8_BOM + Papa.unparse(sanitizeRows(data.persons));
  const relationshipsCsv =
    UTF8_BOM + Papa.unparse(sanitizeRows(data.relationships));

  const zip = new JSZip();
  zip.file("persons.csv", personsCsv);
  zip.file("relationships.csv", relationshipsCsv);

  if (data.person_details_private && data.person_details_private.length > 0) {
    zip.file(
      "person_details_private.csv",
      UTF8_BOM + Papa.unparse(sanitizeRows(data.person_details_private)),
    );
  }

  if (data.custom_events && data.custom_events.length > 0) {
    zip.file(
      "custom_events.csv",
      UTF8_BOM + Papa.unparse(sanitizeRows(data.custom_events)),
    );
  }

  const zipBlob = await zip.generateAsync({ type: "blob" });
  return zipBlob;
}

export async function parseCsvZip(zipBlob: Blob): Promise<{
  persons: Partial<Person>[];
  relationships: Partial<Relationship>[];
  person_details_private?: PersonDetailsPrivateRow[];
  custom_events?: CustomEventRow[];
}> {
  const zip = new JSZip();
  const loadedZip = await zip.loadAsync(zipBlob);

  const personsFile = loadedZip.file("persons.csv");
  const relationshipsFile = loadedZip.file("relationships.csv");

  if (!personsFile || !relationshipsFile) {
    throw new Error(
      "File ZIP không hợp lệ: thiếu persons.csv hoặc relationships.csv.",
    );
  }

  const personsCsvRaw = await personsFile.async("text");
  const relationshipsCsvRaw = await relationshipsFile.async("text");

  const personsCsvStr = personsCsvRaw.startsWith(UTF8_BOM)
    ? personsCsvRaw.slice(1)
    : personsCsvRaw;
  const relationshipsCsvStr = relationshipsCsvRaw.startsWith(UTF8_BOM)
    ? relationshipsCsvRaw.slice(1)
    : relationshipsCsvRaw;

  const personsParsed = Papa.parse<Partial<Person>>(personsCsvStr, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true, // Tự động convert số và boolean
  });

  const relationshipsParsed = Papa.parse<Partial<Relationship>>(
    relationshipsCsvStr,
    {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
    },
  );

  if (personsParsed.errors.length > 0) {
    console.error("Lỗi parse persons.csv:", personsParsed.errors);
  }

  if (relationshipsParsed.errors.length > 0) {
    console.error("Lỗi parse relationships.csv:", relationshipsParsed.errors);
  }

  const result: {
    persons: Partial<Person>[];
    relationships: Partial<Relationship>[];
    person_details_private?: PersonDetailsPrivateRow[];
    custom_events?: CustomEventRow[];
  } = {
    persons: personsParsed.data,
    relationships: relationshipsParsed.data,
  };

  // Parse person_details_private.csv (optional, backward compat)
  const privateFile = loadedZip.file("person_details_private.csv");
  if (privateFile) {
    const raw = await privateFile.async("text");
    const privateCsvStr = raw.startsWith(UTF8_BOM) ? raw.slice(1) : raw;
    const privateParsed = Papa.parse<PersonDetailsPrivateRow>(privateCsvStr, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
    });
    if (privateParsed.errors.length > 0) {
      console.error(
        "Lỗi parse person_details_private.csv:",
        privateParsed.errors,
      );
    }
    result.person_details_private = privateParsed.data;
  }

  // Parse custom_events.csv (optional, backward compat)
  const eventsFile = loadedZip.file("custom_events.csv");
  if (eventsFile) {
    const raw = await eventsFile.async("text");
    const eventsCsvStr = raw.startsWith(UTF8_BOM) ? raw.slice(1) : raw;
    const eventsParsed = Papa.parse<CustomEventRow>(eventsCsvStr, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
    });
    if (eventsParsed.errors.length > 0) {
      console.error("Lỗi parse custom_events.csv:", eventsParsed.errors);
    }
    result.custom_events = eventsParsed.data;
  }

  return result;
}
