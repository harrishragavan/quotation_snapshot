import frappe
from frappe.utils import now
from frappe.utils.pdf import get_pdf


@frappe.whitelist()
def save_quotation_snapshot(quotation):
    if not quotation:
        frappe.throw("Quotation is required")

    html = frappe.get_print(
        doctype="Quotation",
        name=quotation,
        print_format="quotation pf",
        as_pdf=False
    )

    doc = frappe.get_doc("Quotation", quotation)

    row = doc.append("custom_print_snapshots", {
        "print_format": "quotation pf",
        "html_content": html,
        "snapshot_date": now()
    })

    doc.save(ignore_permissions=True)

    return row.name


@frappe.whitelist()
def download_snapshot_pdf(snapshot_row):


    if not snapshot_row:
        frappe.throw("Snapshot row missing")

    snapshot = frappe.get_doc("Quotation Print Snapshot", snapshot_row)


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


