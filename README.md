# Quotation Print Snapshot (Frappe App)

A custom Frappe app to **freeze quotation print formats as HTML snapshots** and **view them later as PDFs**, ensuring audit safety and consistency even if print formats change in the future.

This app is designed for **ERPNext / Frappe v16+**.

---

##  Problem This App Solves

In standard ERPNext:
- Print formats can change over time
- Old quotations may not render the same way later
- No built-in way to “freeze” a print output at the time of sharing with a customer

###  Solution
This app:
- Captures the **exact print format output (HTML)** at a point in time
- Stores it in a **child table** inside Quotation
- Allows users to **open the snapshot as a PDF** later
- Ensures **quotation output integrity**

---

## How It Works

1. User creates a **Quotation**
2. Clicks **Save Print Snapshot**
3. App renders the selected print format (`quotation pf`) as **HTML**
4. HTML is stored in a child table (`Quotation Print Snapshot`)
5. Later, clicking **View PDF**:
   - Regenerates PDF using Frappe print engine
   - Opens PDF in browser (download optional)

---
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/1c096f43-ec2b-4476-9cf0-3a39490ab9e9" />

