define(["doh/main", "require"], function(doh, require){

	doh.register("_BidiSupport.form.test_PlaceholderInput.", require.toUrl("./test_PlaceholderInput.html"));

	doh.register("_BidiSupport.form.multiSelect", require.toUrl("./multiSelect.html"));

	doh.register("_BidiSupport.form.noTextDirTextWidgets", require.toUrl("./noTextDirTextWidgets.html"));

	doh.register("_BidiSupport.form.Button", require.toUrl("./Button.html"));

	doh.register("_BidiSupport.form.Select", require.toUrl("./test_Select.html"));

	doh.register("_BidiSupport.form.Slider", require.toUrl("./test_Slider.html"));

	doh.register("_BidiSupport.form.robot.Textarea", require.toUrl("./robot/Textarea.html"), 999999);

	doh.register("_BidiSupport.form.robot.SimpleComboBoxes", require.toUrl("./robot/SimpleComboBoxes.html"), 999999);

	doh.register("_BidiSupport.form.robot.SimpleTextarea", require.toUrl("./robot/SimpleTextarea.html"), 999999);

	doh.register("_BidiSupport.form.robot.TextBoxes", require.toUrl("./robot/TextBoxes.html"), 999999);

	doh.register("_BidiSupport.form.robot.InlineEditBox", require.toUrl("./robot/InlineEditBox.html"), 999999);

	doh.register("_BidiSupport.form.TimeTextBox", require.toUrl("./test_TimeTextBox.html?mode=test"), 999999);

});