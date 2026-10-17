Tools Used

1. ChatGPT: Used to clarify assignment requirements, understand React and      TypeScript 2. concepts, troubleshoot Firebase integration, and understand CSV validation and reconciliation.
3. Visual Studio Code: Used to edit the code and review implementation changes.
4. Firebase Console: Used to configure Firebase and inspect Firestore data.
5. Browser and terminal: Used to run the application, execute scripts, and verify results.
Three Most Useful Prompts:
Prompt 1: Lead Form and Validation

Create a lead entry form using React, TypeScript, React Router DOM, and Material UI. Include customer name, mobile number, PIN code, product, and lead source. Validate the 10-digit Indian mobile number and 6-digit PIN code, prevent duplicate mobile numbers in Firestore, and automatically assign a dealer based on the PIN code. If no dealer matches, assign the lead to In-house Sales.

Prompt 2: Dashboard and Real-Time Updates

Create a dashboard using React, TypeScript, Material UI, and Firebase Firestore. Display total leads, new leads, converted leads, and in-house sales. Include lead status breakdowns, dealer-wise lead counts, and a customer table with an editable status dropdown. When a lead's status changes, update Firestore and refresh the dashboard metrics.

Prompt 3: Legacy Data Migration and Reconciliation

Write a script to process data/legacy_leads.csv, clean and validate mobile numbers and PIN codes, detect duplicate mobile numbers, assign dealers based on PIN codes, and import valid leads into Firebase Firestore. Generate reports/reconciliation.csv with exactly three columns: lead_id, action, and reason, with one output row for every input row. Use the actions imported, fixed, merged, rejected, and assigned_inhouse.

3. Example Where AI Was Wrong and How I Fixed It

Issue:Initially, Firebase generated automatic document IDs for new leads. These IDs were difficult to read and did not provide a sequential lead numbering system.

AI suggestion and correction: I used AI assistance to understand how to generate sequential lead IDs. I updated the lead creation logic to maintain a counter in Firestore and generate readable IDs such as L1, L2, and L3.


Fix: I implemented sequential ID generation using a Firestore transaction so that the counter is incremented when a new lead is created.

Learning:I learned the difference between Firestore's automatically generated document IDs and a readable, sequential business lead ID.