frappe.ui.form.on("Quotation", {
    refresh(frm) {
        if (frm.is_new()) return;

        // Save Print Snapshot button
        frm.add_custom_button("Save Print Snapshot", () => {
            open_print_format_dialog(frm);
        });

        // Handle View PDF button click in child table
        frm.fields_dict.custom_print_snapshots.grid.wrapper.on(
            "click",
            ".grid-row .btn",
            function (e) {
                let $row = $(e.target).closest(".grid-row");
                let row_name = $row.attr("data-name");

                if (!row_name) return;

                let url =
                    `/api/method/quotation_snapshot.api.download_snapshot_pdf` +
                    `?snapshot_row=${row_name}`;

                window.open(url, "_blank");
            }
        );
    }
});


function open_print_format_dialog(frm) {
    let dialog = new frappe.ui.Dialog({
        title: "Select Print Format",
        fields: [
            {
                label: "Print Format",
                fieldname: "print_format",
                fieldtype: "Link",
                options: "Print Format",
                reqd: 1,
                get_query: () => {
                    return {
                        filters: {
                            doc_type: "Quotation",
                            disabled: 0
                        }
                    };
                }
            }
        ],
        primary_action_label: "Save Snapshot",
        primary_action(values) {
            dialog.hide();

            frappe.call({
                method: "quotation_snapshot.api.save_quotation_snapshot",
                args: {
                    quotation: frm.doc.name,
                    print_format: values.print_format
                },
                callback() {
                    frappe.msgprint("Print snapshot saved");
                    frm.reload_doc();
                }
            });
        }
    });

    dialog.show();
}
