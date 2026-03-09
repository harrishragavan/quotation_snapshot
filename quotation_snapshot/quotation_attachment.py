import frappe


def attach_item_files(doc, method=None):

    if not doc.items:
        return

    for item in doc.items:

        if not item.item_code:
            continue

        item_files = frappe.get_all(
            "File",
            filters={
                "attached_to_doctype": "Item",
                "attached_to_name": item.item_code
            },
            fields=["file_url", "file_name", "is_private"]
        )

        for f in item_files:

            exists = frappe.db.exists(
                "File",
                {
                    "attached_to_doctype": "Quotation",
                    "attached_to_name": doc.name,
                    "file_url": f.file_url
                }
            )

            if not exists:

                frappe.get_doc({
                    "doctype": "File",
                    "file_url": f.file_url,
                    "file_name": f.file_name,
                    "attached_to_doctype": "Quotation",
                    "attached_to_name": doc.name,
                    "is_private": f.is_private
                }).insert(ignore_permissions=True)