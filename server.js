
const PROGRAMS = {
  BSIT: "Bachelor of Science in Information Technology",
  BSCS: "Bachelor of Science in Computer Science"
};

const output = document.getElementById("output");
let jsonData = null;
let fileName = "output.json";

// Parses the CSV file
function parseCSV(text) {
  const rows = [];
  let row = [], field = "", inQuotes = false;

  text = text.replace(/^\uFEFF/, "");

  for (let i = 0; i < text.length; i++) {
    const c = text[i];

    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') {
        inQuotes = false;
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;

      row.push(field);
      field = "";

      if (row.some(v => v.trim() !== "")) {
        rows.push(row);
      }

      row = [];
    } else {
      field += c;
    }
  }

  row.push(field);

  if (row.some(v => v.trim() !== "")) {
    rows.push(row);
  }

  return rows;
}

// Capitalize first letter
const capitalize = s => {
  s = s.trim().toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
};

// Capitalize first letter of every word
const capitalizeWords = s =>
  s.trim().split(/\s+/).map(capitalize).join(" ");

// Transform CSV record into JSON object
function transform(rec) {
  const code = rec.course.trim().toUpperCase();

  return {
    studentId: parseInt(rec.student_id, 10),
    firstName: capitalizeWords(rec.first_name),
    lastName: capitalizeWords(rec.last_name),
    program: PROGRAMS[code] || rec.course.trim(),
    yearLevel: parseInt(rec.year_level, 10),
    emailAddress: rec.email.trim().toLowerCase(),
    outstandingBalance: Number(
      parseFloat(rec.tuition_balance).toFixed(2)
    )
  };
}

// Convert CSV to JSON
document.getElementById("convertBtn").addEventListener("click", () => {
  const file = document.getElementById("csvFile").files[0];

  if (!file) {
    output.innerHTML =
      '<span class="error">Please choose a CSV file first.</span>';
    return;
  }

  const reader = new FileReader();

  reader.onload = e => {
    try {
      const rows = parseCSV(e.target.result);
      const headers = rows.shift().map(h => h.trim());

      const required = [
        "student_id",
        "first_name",
        "last_name",
        "course",
        "year_level",
        "email",
        "tuition_balance"
      ];

      const missing = required.filter(h => !headers.includes(h));

      if (missing.length) {
        throw new Error("Missing column(s): " + missing.join(", "));
      }

      const records = rows.map(r => {
        const obj = {};

        headers.forEach((h, i) => {
          obj[h] = r[i] !== undefined ? r[i] : "";
        });

        return transform(obj);
      });

      jsonData = records;
      fileName = file.name.replace(/\.csv$/i, "") + ".json";

      output.textContent = JSON.stringify(records, null, 2);
    } catch (err) {
      jsonData = null;
      output.innerHTML =
        '<span class="error">Error: ' + err.message + '</span>';
    }
  };

  reader.readAsText(file);
});
