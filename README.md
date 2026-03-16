# Quotation Snapshot

Custom Frappe / ERPNext app that enhances the **Quotation email workflow** by automating attachments, email templates, and email dialog restrictions.

This app ensures that when users send a quotation email, the process is standardized and attachments from item masters are automatically included.

---

# Features

### 1. Automatic Item Attachments
When a **Quotation is saved**, the app automatically:

- Fetches files attached to each **Item Master**
- Copies them to the **Quotation attachments**
- Prevents duplicate attachments
- disable the unwanted **Checkbox**
- Ready to send email format

### 2. File Path
1. **quotation_snapshot/quotation_snapshot/quotation_attachment.py** (Server logic)
2. **quotation_snapshot/public/js/quotation_email.js**  (Client script)

   ⚠️ ADD FILE PATH IN **hooks.py**.
   
   ⚠️ Create a **template_name** and **default_cc** in the quotation_email.js
         
        frm.email_doc = function(message) {

            let template_name = "Quotation Default Template";
            let default_cc = "sample@gmail.com";
               ..
               }

### 2. Demo 


![Screencastfrom2026-03-1011-55-27-ezgif com-video-to-gif-converter](https://github.com/user-attachments/assets/c1d4160f-9775-4fff-8563-4bdbde0666e8)
