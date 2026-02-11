import frappe
from frappe.utils import now


# ------------------------------------------------------------------
# EXISTING CODE (UNCHANGED)
# ------------------------------------------------------------------

@frappe.whitelist()
def save_quotation_snapshot(quotation, print_format):
    """
    Save HTML snapshot of selected print format
    """

    if not quotation:
        frappe.throw("Quotation is required")

    if not print_format:
        frappe.throw("Print Format is required")

    # Generate HTML snapshot of selected print format
    html = frappe.get_print(
        doctype="Quotation",
        name=quotation,
        print_format=print_format,
        as_pdf=False
    )

    doc = frappe.get_doc("Quotation", quotation)

    row = doc.append("custom_print_snapshots", {
        "print_format": print_format,
        "html_content": html,
        "snapshot_date": now()
    })

    doc.save(ignore_permissions=True)

    # return child row name (used for PDF)
    return row.name


@frappe.whitelist()
def download_snapshot_pdf(snapshot_row):
    """
    Generate PDF using stored snapshot's print format
    """

    if not snapshot_row:
        frappe.throw("Snapshot row missing")

    snapshot = frappe.get_doc("Quotation Print Snapshot", snapshot_row)

    # Generate PDF using SAME print format
    pdf = frappe.get_print(
        doctype="Quotation",
        name=snapshot.parent,
        print_format=snapshot.print_format,
        as_pdf=True
    )

    frappe.response.filename = "Quotation_Snapshot.pdf"
    frappe.response.filecontent = pdf
    frappe.response.type = "binary"
    frappe.response.headers = {
        "Content-Type": "application/pdf",
        "Content-Disposition": "inline; filename=Quotation_Snapshot.pdf"
    }

