frappe.ui.form.on('Quotation', {
    set_tc_query: function (frm) {
        frm.set_query("tc_name", function () {

            return {
                filters: {
                    custom_pre_sales_type: frm.doc.order_type
                }
            };
        });
    },

    set_payment_terms_query: function (frm) {
        if (frm.doc.order_type == "Import PI") {
            frm.set_query("payment_terms_template", function () {
                return {
                    filters: {
                        custom_pre_sales_type: frm.doc.order_type
                    }
                };
            });
        }
        else {
            frm.set_query("payment_terms_template", function () {
                return {
                    filters: {
                        custom_pre_sales_type: ["!=", "Import PI"]
                    }
                };
            });
        }
    },

    set_shipping_term_query: function (frm) {
        if (frm.doc.order_type == "Import PI") {
            frm.set_query("custom_shipping_term", function () {
                return {
                    filters: {
                        custom_pre_sales_type: frm.doc.order_type
                    }
                };
            });
        }
        else {
            frm.set_query("custom_shipping_term", function () {
                return {
                    filters: {
                        custom_pre_sales_type: ["!=", "Import PI"]
                    }
                };
            });
        }
    },

    refresh: function (frm) {
        frm.trigger('set_tc_query');

        frm.trigger('set_payment_terms_query');

        frm.trigger('set_shipping_term_query');
        setTimeout(() => {
            $(frm.page.wrapper).find('.btn:contains("Get Items From")').remove();
            // $(frm.page.wrapper).find('.btn:contains("Submit")').remove();
        }, 5);

        if (frm.doc.name && frm.doc.creation && frm.doc.docstatus < 2) {
            frm.add_custom_button(__('Preview 👁️‍🗨️'), function () {
                let format = '';

                switch (frm.doc.order_type) {
                    case 'Stock PI':
                        format = 'Machine PI';
                        break;
                    case 'Import PI':
                        format = 'Import PI';
                        break;
                    case 'Spares PI':
                        format = 'Spares PI';
                        break;
                    case 'Service PI':
                        format = 'Service PI';
                        break;
                }

                let url = `/api/method/frappe.utils.print_format.download_pdf?doctype=${frm.doc.doctype}&name=${frm.doc.name}&format=${format}`;
                window.open(url, '_blank');
            });

            frm.add_custom_button('Save PDF 📥', function () {
                frappe.call({
                    method: "vin_isipl.utils.pi_version_tracker.save_to_table",
                    args: {
                        quotation_name: frm.doc.name
                    },
                    freeze: true,
                    callback: function () {

                        frappe.show_alert({
                            message: __("Version Tracker Updated!"),
                            indicator: 'green'
                        });

                        // 🔥 Refresh full doc (best way)
                        frm.reload_doc();

                        // OR (lighter option)
                        // frm.refresh_field("custom_pi_version_history");
                    }
                });
            });
        }
    },

    party_name: function (frm) {
        frm.set_value('sales_person', '');
        frm.trigger('set_party_name');
    },

    order_type: function (frm) {
        if (frm.doc.order_type == "Import PI" || frm.doc.order_type == "Stock PI") {
            frm.set_value('company', 'ISIPL');
        } else if (frm.doc.order_type == "Spares PI" || frm.doc.order_type == "Service PI") {
            frm.set_value('company', 'INNOVATIVE');
        }

        setTimeout(() => {
            if (frm.doc.order_type == "Import PI") {
                frm.set_value('currency', 'USD');
                frm.set_value('tax_category', 'Nil Tax');
                frm.set_df_property('tc_name', 'reqd', 0);
                frm.set_df_property('tc_name', 'hidden', 1);
            } else {
                frm.set_value('currency', 'INR');
                frm.set_df_property('tc_name', 'reqd', 1);
                frm.set_df_property('tc_name', 'hidden', 0);
            }

            // frm.trigger('set_terms');
            frm.trigger('set_tc_query');
            frm.trigger('set_payment_terms_query');
            frm.trigger('set_shipping_term_query');

            // clear old values to avoid mismatch
            frm.set_value('tc_name', '');
            frm.set_value('payment_terms_template', '');
            frm.set_value('custom_shipping_term', '');
        }, 500);
        frm.trigger('party_name');
    },

    company: function (frm) {
        if (frm.doc.company == "ISIPL") {
            frm.set_value('naming_series', 'ISIPL-TPR-.FY.####');
            // frm.set_value('tc_name', '')
            frm.set_value('custom_isipl_bank_account', '');
            // frm.set_value('payment_terms_template', '');
            // frm.set_value('custom_shipping_term', '');
        } else if (frm.doc.company == "INNOVATIVE") {
            frm.set_value('naming_series', 'INN-TPR-.FY.####');
            frm.set_value('custom_isipl_bank_account', 'Innovative - IndusInd Bank');
            // frm.set_value('payment_terms_template', 'Immediate');
            // frm.set_value('custom_shipping_term', 'Ex - Works Tirupur');
            // if (frm.doc.order_type == "Service PI") {
            //     frm.set_value('tc_name', 'Terms and Conditions - SERVICE AMC')
            // } else {
            //     frm.set_value('tc_name', 'Terms and Conditions - STANDARD')
            // }
        }
    },

    set_terms: function (frm) {
        if (frm.doc.company == "ISIPL") {
            frm.set_value('tc_name', '')
        }
        // else {
        //     if (frm.doc.order_type == "Service PI") {
        //         frm.set_value('tc_name', 'Terms and Conditions - SERVICE AMC')
        //     } else {
        //         frm.set_value('tc_name', 'Terms and Conditions - STANDARD')
        //     }
        // }  

    },

    set_party_name: function (frm) {
        if (frm.doc.party_name) {
            // frappe.db.get_value('CRM Deal', { organization: frm.doc.party_name }, 'custom_sales_person')
            //     .then(r => {
            //         if (r.message && r.message.custom_sales_person) {
            //             fetch_sales_person(frm, r.message.custom_sales_person);
            //         } else {
            //             if (!frm.doc.sales_person) {
            //                 frm.set_value('sales_person', '');
            //             }
            //         }
            //     });
            frappe.db.get_value('Customer', frm.doc.party_name, 'custom_sales_person')
                .then(r => {
                    if (r.message && r.message.custom_sales_person) {
                        frm.set_value('sales_person', r.message.custom_sales_person);
                    } else {
                        if (!frm.doc.sales_person) {
                            frm.set_value('sales_person', '');
                        }
                    }
                });
        } else {
            if (!frm.doc.sales_person) {
                frm.set_value('sales_person', '');
            }

        }
    }
});

function fetch_sales_person(frm, sales_person) {
    frappe.db.get_value('Employee', { user_id: sales_person }, 'name')
        .then(emp => {
            if (emp.message && emp.message.name) {
                frappe.db.get_value('Sales Person', { employee: emp.message.name }, 'name')
                    .then(sp => {
                        if (!frm.doc.sales_person) {
                            frm.set_value('sales_person', sp.message.name);
                        }
                    });
            } else {
                if (!frm.doc.sales_person) {
                    frm.set_value('sales_person', '');
                }
            }
        });
}

// frappe.ui.form.on('PI Version History', {
//     print: function(frm, cdt, cdn) {
//         let row = locals[cdt][cdn];

//         if (!row.pdf_attachment) {
//             frappe.msgprint('No PDF attachment found');
//             return;
//         }

//         // Build full URL (important for private files)
//         let file_url = window.location.origin + row.pdf_attachment;

//         // Open in new tab → triggers Chrome preview popup
//         let w = window.open(file_url, '_blank');

//         // Auto open print dialog
//         w.onload = function() {
//             w.focus();
//             w.print();
//         };
//     }
// });

// frappe.ui.form.on('PI Version History', {
//     email: function(frm, cdt, cdn) {

//         let row = locals[cdt][cdn];

//         if (!row.pdf_attachment) {
//             frappe.msgprint('No PDF attachment found');
//             return;
//         }

//         frappe.db.get_value('User', frappe.session.user, 'email')
//             .then(async r => {

//                 let composer = new frappe.views.CommunicationComposer({
//                     doc: frm.doc,
//                     recipients: frm.doc.contact_email || '',
//                     cc: "kponsakthivel@gmail.com",
//                     sender: r.message.email,
//                     attach_document_print: false
//                 });

//                 composer.dialog.$wrapper.on('shown.bs.modal', async () => {

//                     // =========================
//                     // APPLY EMAIL TEMPLATE
//                     // =========================
//                     let res = await frappe.call({
//                         method: "frappe.email.doctype.email_template.email_template.get_email_template",
//                         args: {
//                             template_name: "Proforma Invoice Template",
//                             doc: frm.doc
//                         }
//                     });

//                     if (res.message) {
//                         composer.dialog.set_value("subject", res.message.subject || "");
//                         composer.dialog.set_value("content", res.message.message || "");
//                     }

//                     // =========================
//                     // FETCH FILE DOC
//                     // =========================
//                     let files = await frappe.db.get_list('File', {
//                         filters: {
//                             file_url: row.pdf_attachment
//                         },
//                         fields: ['name', 'file_name', 'file_url']
//                     });

//                     if (!files.length) {
//                         frappe.msgprint("File not found");
//                         return;
//                     }

//                     let file = files[0];

//                     // =========================
//                     //  ADD TO ATTACHMENT LIST (REAL WAY)
//                     // =========================
//                     composer.attachments.push({
//                         name: file.name,          //
//                         file_name: file.file_name,
//                         file_url: file.file_url
//                     });

//                     // Render attachments UI
//                     composer.render_attachment_rows();

//                     // =========================
//                     //  AUTO CHECK THE FILE
//                     // =========================
//                     setTimeout(() => {
//                         $(composer.dialog.wrapper)
//                             .find(`[data-file-name="${file.name}"]`)
//                             .prop("checked", true);
//                     }, 200);

//                 });

//             });
//     }
// });
frappe.ui.form.on('PI Version History', {

    // =========================
    // PRINT FUNCTION
    // =========================
    print: function (frm, cdt, cdn) {

        let row = locals[cdt][cdn];

        if (!row.pdf_attachment) {
            frappe.msgprint('No PDF attachment found');
            return;
        }

        // Build full URL (important for private files)
        let file_url = window.location.origin + row.pdf_attachment;

        // Open in new tab
        let w = window.open(file_url, '_blank');

        if (w) {
            w.onload = function () {
                w.focus();
                w.print();
            };
        }
    },


    // EMAIL FUNCTION
    email: function (frm, cdt, cdn) {

        let row = locals[cdt][cdn];

        if (!row.pdf_attachment) {
            frappe.msgprint('No PDF attachment found');
            return;
        }

        frappe.call({
            method: 'frappe.client.get_list',
            args: {
                doctype: 'Contact',
                filters: [
                    ['Dynamic Link', 'link_doctype', '=', 'Customer'],
                    ['Dynamic Link', 'link_name', '=', frm.doc.party_name]
                ],
                fields: ['email_id', 'is_primary_contact']
            },
            callback: function (contact_res) {
                let fallback_to = '';
                let to_emails = [];
                let cc_emails = [];

                if (contact_res && contact_res.message && contact_res.message.length > 0) {
                    contact_res.message.forEach(c => {
                        if (c.email_id) {
                            if (!fallback_to) fallback_to = c.email_id;
                            if (c.is_primary_contact && to_emails.length === 0) {
                                to_emails.push(c.email_id);
                            } else if (!cc_emails.includes(c.email_id)) {
                                cc_emails.push(c.email_id);
                            }
                        }
                    });
                }

                if (to_emails.length === 0 && fallback_to) {
                    to_emails.push(fallback_to);
                    cc_emails = cc_emails.filter(e => e !== fallback_to);
                }

                if (to_emails.length === 0 && frm.doc.contact_email) {
                    to_emails.push(frm.doc.contact_email);
                }

                // ALWAYS ADD tirupur@innovativeindia.co TO CC
                if (!cc_emails.includes('tirupur@innovativeindia.co')) {
                    cc_emails.push('tirupur@innovativeindia.co');
                }

                let item_codes = [];
                if (frm.doc.items) {
                    frm.doc.items.forEach(item => {
                        if (item.item_code && !item_codes.includes(item.item_code)) {
                            item_codes.push(item.item_code);
                        }
                    });
                }

                frappe.db.get_value('User', frappe.session.user, 'email')
                    .then(async r => {
                        let to_address = to_emails.length > 0 ? to_emails[0] : '';
                        let cc_address = cc_emails.join(', ');

                        let composer = new frappe.views.CommunicationComposer({
                            doc: frm.doc,
                            recipients: to_address,
                            cc: cc_address,
                            sender: r.message.email || '',
                            attach_document_print: false
                        });

                        composer.dialog.$wrapper.on('shown.bs.modal', async () => {

                            if (composer.dialog.get_field("email_template")) {
                                composer.dialog.set_value("email_template", "Proforma Invoice Template");
                                composer.dialog.set_df_property("email_template", "hidden", 1);
                                setTimeout(() => {
                                    let template_wrapper = composer.dialog.get_field("email_template").wrapper;
                                    if (template_wrapper) $(template_wrapper).hide();
                                }, 200);
                            }

                            // HIDE the "Add Template" button
                            if (composer.dialog.get_field("clear_and_add_template")) {
                                composer.dialog.set_df_property("clear_and_add_template", "hidden", 1);
                                let btn_wrapper = composer.dialog.get_field("clear_and_add_template").wrapper;
                                if (btn_wrapper) $(btn_wrapper).hide();
                            }

                            // APPLY EMAIL TEMPLATE
                            let res = await frappe.call({
                                method: "frappe.email.doctype.email_template.email_template.get_email_template",
                                args: {
                                    template_name: "Proforma Invoice Template",
                                    doc: frm.doc
                                }
                            });

                            if (res && res.message) {
                                composer.dialog.set_value("subject", res.message.subject || "");
                                composer.dialog.set_value("content", res.message.message || "");
                            }

                            // Lock fields and tick boxes AFTER values are set to prevent UI form crashes
                            setTimeout(() => {
                                // DO NOT lock recipients and cc so they are editable
                                composer.dialog.set_df_property('bcc', 'hidden', 1);
                                composer.dialog.set_df_property('send_after', 'hidden', 1);
                                composer.dialog.set_df_property('subject', 'read_only', 1);
                                composer.dialog.set_df_property('content', 'read_only', 1);
                                composer.dialog.set_df_property('sender', 'read_only', 1);

                                if (composer.dialog.get_field('attach_document_print')) {
                                    composer.dialog.set_df_property('attach_document_print', 'read_only', 1);
                                }
                                if (composer.dialog.get_field('select_attachments')) {
                                    composer.dialog.set_df_property('select_attachments', 'read_only', 1);
                                }

                                composer.dialog.set_value("send_me_a_copy", 0);
                                composer.dialog.set_df_property("send_me_a_copy", "hidden", 1);

                                composer.dialog.set_value("send_read_receipt", 1);
                                composer.dialog.set_df_property("send_read_receipt", "read_only", 1);

                                // Hook onto send button to add tirupur@... automatically when Send is clicked
                                let primary_btn = composer.dialog.get_primary_btn();
                                primary_btn.on('mousedown', () => {
                                    let current_cc = composer.dialog.get_value('cc') || '';
                                    if (!current_cc.includes('tirupur@innovativeindia.co')) {
                                        let new_cc = current_cc ? current_cc + ', tirupur@innovativeindia.co' : 'tirupur@innovativeindia.co';
                                        composer.dialog.set_value('cc', new_cc);
                                    }
                                });
                            }, 500);

                            // Template applied above

                            // FETCH FILE DOC
                            let files = await frappe.db.get_list('File', {
                                filters: {
                                    file_url: row.pdf_attachment
                                },
                                fields: ['name', 'file_name', 'file_url']
                            });

                            let added_urls = [];

                            if (files.length) {
                                let file = files[0];
                                added_urls.push(file.file_url);
                                composer.attachments.push({
                                    name: file.name,
                                    file_name: file.file_name,
                                    file_url: file.file_url
                                });
                            }

                            // AUTO ATTACH PRODUCT CATALOGUE (from Item attachments)
                            if (item_codes.length > 0) {
                                let item_attachments = await frappe.db.get_list('File', {
                                    filters: {
                                        attached_to_doctype: 'Item',
                                        attached_to_name: ['in', item_codes]
                                    },
                                    fields: ['name', 'file_name', 'file_url']
                                });

                                if (item_attachments && item_attachments.length > 0) {
                                    item_attachments.forEach((file) => {
                                        if (!added_urls.includes(file.file_url)) {
                                            added_urls.push(file.file_url);
                                            composer.attachments.push({
                                                name: file.name,
                                                file_name: file.file_name,
                                                file_url: file.file_url
                                            });
                                        }
                                    });
                                }
                            }

                            // Render attachments UI ONCE
                            if (added_urls.length > 0) {
                                composer.render_attachment_rows();

                                // Auto check ALL the files efficiently
                                setTimeout(() => {
                                    if (composer.dialog.fields_dict.select_attachments) {
                                        let checkboxes = $(composer.dialog.fields_dict.select_attachments.wrapper)
                                            .find("input[type='checkbox']");
                                        checkboxes.prop("checked", true);
                                    }
                                }, 300);
                            }
                        });
                    });
            }
        });
    }
});
