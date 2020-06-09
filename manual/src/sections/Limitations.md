# Limitations

The Synthi platform is still in its early stages of development. Thank you for your patience while we continue to add new features and fix bugs.

* **Datasets can only be uploaded as .csv files with commas used as column delimiters.** Custom delimiters and other file formats will be added in the future.
* **Synthi will automatically detect column datatypes as either a String, Integer, Float, Boolean or String.** Other datatypes and smart detection of strings (such as detecting whether a column contains temperatures or postal codes) will be included in the future.
* **When a network error occurs, datasets will disappear from the list in the sidebar.** When this happens, "Error!" will appear. This is a known issue and will be fixed in the future.
* **You cannot use the back button in your browser to get back to a different page in the app.** This is because Synthi is currently a single page application. We'll add routing in the future, which will automatically fix this issue.
* **Your browser may become unresponsive if you try to edit the chart of a very large dataset.** Read the [Visualizing Data](./Visualizing.md) section for more info on this issue.
* **Users cannot be registered or have their password reset from the user interface.** This reset requires SSH and server access for now. Please refer to the [Creating Users & Organizations](./CreatingUsersAndOrganizations) section for instructions.
* **Previously created charts in the *Chart Editor* cannot be re-opened and edited.** The current workaround is to export the JSON definition, edit it by hand, and then re-import it into the chart editor. Visit the [Visualizing Data](./Visualizing.md) section for more info on this issue.
* **Exported datasets will retain their original column names.** In cases where they did not have column names to begin with, the generic "Column_1", "Column_2" and so on will be used instead.