
import csv
import re
from pathlib import Path

import firebase_admin
from firebase_admin import credentials, firestore

BASE_DIR = Path(__file__).resolve().parent.parent
INPUT_FILE = BASE_DIR / "data" / "legacy_leads.csv"
REPORT_FILE = BASE_DIR / "reports" / "reconciliation.csv"
SERVICE_ACCOUNT_FILE = (
    Path.home() / "firebase-credentials" / "serviceAccountKey.json"
)

COLLECTION_NAME = "leads"
DEALERS = {
    "500": ("D01", "Sri Sai Power Solutions"),
    "502": ("D02", "Kandi Energy Point"),
    "506": ("D03", "Warangal Green Systems"),
    "505": ("D04", "Karimnagar Solar Hub"),
    "530": ("D05", "Vizag Home Power"),
    "531": ("D05", "Vizag Home Power"),
    "520": ("D06", "Krishna Energy Store"),
    "521": ("D06", "Krishna Energy Store"),
    "522": ("D07", "Guntur Battery World"),
    "517": ("D08", "Tirupati PowerHouse"),
}

VALID_PRODUCTS = {
    "PuREPower Home 3kWh",
    "PuREPower Home 5kWh",
    "PuREPower Commercial 10kWh",
}

VALID_SOURCES = {
    "Website",
    "Voice Agent",
    "WhatsApp",
    "Dealer Walk-in",
}

VALID_STATUSES = {
    "New",
    "Contacted",
    "Converted",
    "Lost",
}

def normalize_header(value):
    """Normalize a column name for flexible matching."""
    return re.sub(r"[^a-z0-9]", "", value.lower().strip())


def get_value(row, *possible_names):
    normalized_row = {
        normalize_header(key): value
        for key, value in row.items()
        if key is not None
    }

    for name in possible_names:
        key = normalize_header(name)

        if key in normalized_row:
            value = normalized_row[key]

            if value is not None:
                return str(value).strip()

    return ""


def normalize_choice(value, valid_values):
    for valid_value in valid_values:
        if value.strip().casefold() == valid_value.casefold():
            return valid_value

    return None


def assign_dealer(pincode):
    prefix = pincode[:3]

    if prefix in DEALERS:
        dealer_id, dealer_name = DEALERS[prefix]
        return dealer_id, dealer_name

    return "INHOUSE", "In-house Sales"

def clean_row(row):
    errors = []
    changes = []

    lead_id = get_value(
        row, "lead_id", "leadId", "id", "lead id"
    )

    name = get_value(row, "name", "customer_name", "customer")
    raw_mobile = get_value(
        row, "mobile", "phone", "phone_number", "mobile_number"
    )
    raw_pincode = get_value(
        row, "pincode", "pin_code", "postal_code", "zip"
    )
    raw_product = get_value(row, "product", "product_name")
    raw_source = get_value(row, "source", "lead_source")
    raw_status = get_value(row, "status", "lead_status")
    cleaned_name = " ".join(name.split())

    if not cleaned_name:
        errors.append("Missing name")
    elif not re.fullmatch(r"[A-Za-z][A-Za-z .'-]*", cleaned_name):
        errors.append("Invalid name")
    elif cleaned_name != name:
        changes.append("Normalized name spacing")

    mobile_digits = re.sub(r"[\s()+-]", "", raw_mobile)

    if mobile_digits.startswith("91") and len(mobile_digits) == 12:
        mobile_digits = mobile_digits[2:]
        changes.append("Removed country code")

    if not re.fullmatch(r"[6-9]\d{9}", mobile_digits):
        errors.append("Invalid Indian mobile number")
    elif mobile_digits != raw_mobile:
        changes.append("Normalized mobile number")


    pincode = re.sub(r"\s", "", raw_pincode)

    if not re.fullmatch(r"\d{6}", pincode):
        errors.append("Invalid six-digit PIN code")
    elif pincode != raw_pincode:
        changes.append("Normalized PIN code")

    product = normalize_choice(raw_product, VALID_PRODUCTS)
    source = normalize_choice(raw_source, VALID_SOURCES)

    if not product:
        errors.append("Missing or invalid product")
    elif product != raw_product:
        changes.append("Normalized product")

    if not source:
        errors.append("Missing or invalid source")
    elif source != raw_source:
        changes.append("Normalized source")

    status = normalize_choice(raw_status, VALID_STATUSES)

    if not raw_status:
        status = "New"
        changes.append("Defaulted missing status to New")
    elif not status:
        errors.append("Invalid status")
    elif status != raw_status:
        changes.append("Normalized status")

    cleaned = {
        "source_lead_id": lead_id,
        "name": cleaned_name,
        "mobile": mobile_digits,
        "pincode": pincode,
        "product": product,
        "source": source,
        "status": status,
    }

    return cleaned, errors, changes

def initialize_firestore():
    if not INPUT_FILE.exists():
        raise FileNotFoundError(
            f"CSV file not found: {INPUT_FILE}"
        )

    if not SERVICE_ACCOUNT_FILE.exists():
        raise FileNotFoundError(
            "Missing serviceAccountKey.json in project root."
        )

    if not firebase_admin._apps:
        credential = credentials.Certificate(
            str(SERVICE_ACCOUNT_FILE)
        )
        firebase_admin.initialize_app(credential)

    return firestore.client()


def main():
    db = initialize_firestore()

    REPORT_FILE.parent.mkdir(parents=True, exist_ok=True)

    with INPUT_FILE.open(
        "r", newline="", encoding="utf-8-sig"
    ) as csv_file:
        reader = csv.DictReader(csv_file)

        if not reader.fieldnames:
            raise ValueError("CSV file has no header row.")

        rows = list(reader)

    report_rows = []
    seen_mobile = set()
    counts = {
        "imported": 0,
        "fixed": 0,
        "merged": 0,
        "rejected": 0,
        "assigned_inhouse": 0,
    }

    leads_collection = db.collection(COLLECTION_NAME)

    for row_number, row in enumerate(rows, start=2):
        cleaned, errors, changes = clean_row(row)

        source_id = cleaned["source_lead_id"]
        report_id = source_id or f"row_{row_number - 1:03d}"

        if errors:
            action = "rejected"
            reason = "; ".join(errors)

        elif cleaned["mobile"] in seen_mobile:
            action = "merged"
            reason = "Duplicate mobile number within CSV"

        else:
            mobile = cleaned["mobile"]

            existing = list(
                leads_collection
                .where("mobile", "==", mobile)
                .limit(1)
                .stream()
            )

            if existing:
                seen_mobile.add(mobile)
                action = "merged"
                reason = "Mobile number already exists in Firestore"

            else:
                dealer_id, dealer_name = assign_dealer(
                    cleaned["pincode"]
                )

                document = {
                    "name": cleaned["name"],
                    "mobile": mobile,
                    "pincode": cleaned["pincode"],
                    "product": cleaned["product"],
                    "source": cleaned["source"],
                    "dealerId": dealer_id,
                    "dealerName": dealer_name,
                    "status": cleaned["status"],
                    "createdAt": firestore.SERVER_TIMESTAMP,
                }

                # Use source ID as the Firestore document ID
                # when supplied; otherwise generate one.
                if source_id:
                    document_ref = leads_collection.document(
                        source_id
                    )
                    if document_ref.get().exists:
                        action = "merged"
                        reason = (
                            "Source lead ID already exists in Firestore"
                        )
                        seen_mobile.add(mobile)
                        counts[action] += 1
                        report_rows.append({
                            "lead_id": report_id,
                            "action": action,
                            "reason": reason,
                        })
                        continue
                else:
                    document_ref = leads_collection.document()

                document_ref.set(document)
                seen_mobile.add(mobile)

                if dealer_id == "INHOUSE":
                    action = "assigned_inhouse"
                    reason = "No matching dealer for PIN prefix"
                elif changes:
                    action = "fixed"
                    reason = "; ".join(changes)
                else:
                    action = "imported"
                    reason = "Imported without changes"

                if changes and action == "assigned_inhouse":
                    reason += "; " + "; ".join(changes)

        counts[action] += 1

        report_rows.append({
            "lead_id": report_id,
            "action": action,
            "reason": reason,
        })
    with REPORT_FILE.open(
        "w", newline="", encoding="utf-8"
    ) as report_file:
        writer = csv.DictWriter(
            report_file,
            fieldnames=["lead_id", "action", "reason"],
        )
        writer.writeheader()
        writer.writerows(report_rows)

    print("\nImport completed.")
    print(f"Input rows: {len(rows)}")
    print(f"Reconciliation rows: {len(report_rows)}")
    print(f"Report saved to: {REPORT_FILE}")

    for action, count in counts.items():
        print(f"{action}: {count}")

    if len(report_rows) != len(rows):
        raise RuntimeError(
            "Reconciliation count does not match input row count."
        )


if __name__ == "__main__":
    main()
