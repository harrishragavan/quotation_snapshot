frappe.ui.form.on("Quotation", {
    refresh(frm) {
        if (frm.is_new()) return;

        frm.add_custom_button("Save Print Snapshot", () => {
            frappe.call({
                method: "quotation_snapshot.api.save_quotation_snapshot",
                args: {
                    quotation: frm.doc.name
                },
                callback() {
                    frappe.msgprint("Snapshot saved");
                    frm.reload_doc();
                }
            });
        });

        frm.fields_dict.custom_print_snapshots.grid.wrapper.on(
            "click",
            ".grid-row .btn",
            function (e) {
                let $row = $(e.target).closest(".grid-row");
                let row_name = $row.attr("data-name");

                if (!row_name) return;

                let row = frappe.get_doc(
                    "Quotation Print Snapshot",
                    row_name
                );

                if (!row) {
                    frappe.msgprint("Snapshot row not found");
                    return;
                }

                let url =
                    `/api/method/quotation_snapshot.api.download_snapshot_pdf` +
                    `?snapshot_row=${row.name}`;

                window.open(url, "_blank");
            }
        );
    }
});
