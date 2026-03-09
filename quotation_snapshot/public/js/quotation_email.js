frappe.ui.form.on("Quotation", {

    refresh(frm) {

        if (frm.email_overridden) return;

        frm.email_overridden = true;

        frm.email_doc = function(message) {

            let template_name = "Quotation Default Template";
            let default_cc = "sales@company.com";

            let print_format = "Standard";

            if (frm.doc.order_type === "Sales") {
                print_format = "Sales Quotation Print";
            }

            if (frm.doc.order_type === "Maintenance") {
                print_format = "Maintenance Quotation Print";
            }

            frappe.db.get_doc("Email Template", template_name)
            .then(template => {

                let subject = __("Quotation") + ": " + frm.doc.name;
                let body = message || "";

                if (template) {

                    subject = frappe.render_template(
                        template.subject || subject,
                        { doc: frm.doc }
                    );

                    body =
                        frappe.render_template(
                            template.response || template.response_html || "",
                            { doc: frm.doc }
                        ) + "<br><br>" + body;
                }

                let composer = new frappe.views.CommunicationComposer({

                    doc: frm.doc,
                    frm: frm,
                    subject: subject,
                    message: body,
                    cc: default_cc,
                    attach_document_print: true,
                    recipients:
                        frm.doc.contact_email ||
                        frm.doc.email_id ||
                        frm.doc.email ||
                        ""

                });

                setTimeout(() => {

                    let dialog = composer.dialog;

                    if (!dialog) return;

                    dialog.set_value("email_template", template_name);

                    dialog.set_value("select_print_format", print_format);

                    dialog.set_value("cc", default_cc);
                    dialog.set_df_property("cc", "read_only", 1);

                    dialog.set_df_property("bcc", "read_only", 1);

                    dialog.set_value("send_me_a_copy", 0);
                    dialog.set_df_property("send_me_a_copy", "read_only", 1);

                    dialog.set_value("send_read_receipt", 0);
                    dialog.set_df_property("send_read_receipt", "read_only", 1);

                    if (dialog.fields_dict.select_attachments) {

                        let checkboxes = $(dialog.fields_dict.select_attachments.wrapper)
                            .find("input[type='checkbox']");

                        checkboxes.prop("checked", true);
                    }

                }, 400);

            });

        };

    }

});