# Metadata

## Fields

1. Title

  Human readable title of the dataset.

  Type: String
  Entered by user: Yes
  UI: Text field

2. Contributor

  Government department, organization, group, or person
  Entered by user: Yes
  UI: Text field

3. Contact

  Type: String
  Entered by user: Yes
  UI: Text field

4. Date Added

  Date the dataset was added to the ADI platform.

  Type: ISO 8601 Date
  Entered by user: No. Automatic upon upload.
  UI: Label field. Non-editable.

5. Date Created

  Date the dataset was created.

  Type: ISO 8601 Date
  Entered by user: Yes. For generated datasets, No.
  UI: DateTime picker / field

6. Date Updated

  Date the dataset was last updated.

  Type: ISO 8601 Date
  Entered by user: Yes for uploaded datasets (automatic default to time of upload). No for generated (always last generated time).
  UI: DateTime picker / field

7. Update Frequency

  Frequency with which the dataset is updated. For generated datasets, this will affect when they are automatically regenerated.

  Type: Boolean/String/Int (___Boolean___ updated checkbox) (Every ___Int___ ___String___)
  UI: Checkbox (for whether or not it's updated), Number field, and Dropdown (for frequency unit)

8. Format

  Basic format of the data when it enters ADI.

  Type: String/Enumeration
  UI: Dropdown (of supported types: CSV, XML, etc. - Currenlty just CSV)

9. Description

  Freeform description.

  Type: String
  UI: Multi-line text field.

10. Source

  Not sure how this is different from #2...

11. Identifier

  Best short way of identifying the dataset outside of ADI. This could be a [DOI](https://www.doi.org/index.html) or an ID within the original system.

  Type: String
  UI: Text field