Blockly.Blocks['openhab_persistence_get'] = {
  init: function () {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(290);
    this.appendDummyInput().setAlign(Blockly.ALIGN_LEFT).appendField('Get').appendField(new Blockly.FieldDropdown([
      [
        'state',
        'STATE'
      ],
      [
        'average',
        'AVERAGE'
      ],
      [
        'minimum',
        'MINIMUM'
      ],
      [
        'maximum',
        'MAXIMUM'
      ]
    ]), 'TYPE').appendField('of Item').appendField(new Blockly.FieldVariable('Item'), 'ITEM');
    this.appendDummyInput().setAlign(Blockly.ALIGN_RIGHT).appendField('since').appendField(new Blockly.FieldDropdown([
      [
        'midnight',
        'MIDNIGHT'
      ],
      [
        'current time',
        'TIME'
      ]
    ], this.customChangeHandler), 'SINCE');
    this.setOutput(true, [
      'Number',
      'String'
    ]);
  },
  getVars: function (varType) {
    return [this.getFieldValue(varType)];
  },
  renameVar: function (varType, oldName, newName) {
    if (Blockly.Names.equals(oldName, this.getFieldValue(varType))) {
      this.setFieldValue(newName, varType);
    }
  },
  mutationToDom: function () {
    var parameter = {};
    parameter.name = 'SINCE';
    parameter.value = this.getFieldValue('SINCE');
    var container = [];
    container.push(parameter);
    return container;
  },
  domToMutation: function (xmlElement) {
    this.arguments_ = [];
    var elements = [].concat(xmlElement);
    for (var x = 0; x < elements.length; x++) {
      if (elements[x].name.toLowerCase() == 'since' && elements[x].value.toLowerCase() == 'time') {
        this.appendDummyInput('TIME').setAlign(Blockly.ALIGN_RIGHT).appendField('minus').appendField(new Blockly.FieldTextInput('0', Blockly.FieldTextInput.numberValidator), 'NUM').appendField(new Blockly.FieldDropdown([
          [
            'seconds',
            'SECONDS'
          ],
          [
            'minutes',
            'MINUTES'
          ],
          [
            'hours',
            'HOURS'
          ]
        ]), 'PERIOD');
      }
    }
  },
  customContextMenu: function (options) {
    var option = { enabled: true };
    var name = this.getFieldValue('VAR');
    option.text = this.contextMenuMsg_.replace('%1', name);
    var xmlField = Ext.DomHelper.createDom({
        tag: 'field',
        children: name
      });
    xmlField.setAttribute('name', 'VAR');
    var xmlBlock = Ext.DomHelper.createDom({
        tag: 'block',
        children: xmlField
      });
    xmlBlock.setAttribute('type', this.contextMenuType_);
    option.callback = Blockly.ContextMenu.callbackFactory(this, xmlBlock);
    options.push(option);
  },
  customChangeHandler: function (option) {
    this.setValue(option);
    if (option == 'TIME') {
      this.sourceBlock_.appendDummyInput('TIME').setAlign(Blockly.ALIGN_RIGHT).appendField('minus').appendField(new Blockly.FieldTextInput('0', Blockly.FieldTextInput.numberValidator), 'NUM').appendField(new Blockly.FieldDropdown([
        [
          'seconds',
          'SECONDS'
        ],
        [
          'minutes',
          'MINUTES'
        ],
        [
          'hours',
          'HOURS'
        ]
      ]), 'PERIOD');
    } else {
      this.sourceBlock_.removeInput('TIME');
    }
    this.sourceBlock_.render();
  }
};
Blockly.Blocks['openhab_rule'] = {
  init: function () {
    this.setHelpUrl('HELP');
    this.setColour(45);
    this.appendDummyInput().appendField('Rule').appendField(new Blockly.FieldTextInput(name, Blockly.Procedures.rename), 'NAME').appendField('', 'PARAMS');
    this.appendStatementInput('CONSTANT').appendField('Definitions');
    this.appendStatementInput('STACK').appendField('Rule');
    this.setTooltip('Rule Tooltip');
  }
};
Blockly.Blocks['openhab_iftimer'] = {
  init: function () {
    this.setHelpUrl('BLAH');
    this.setColour(120);
    this.appendValueInput('IF0').setCheck('Boolean').appendField('If');
    this.appendDummyInput().setAlign(Blockly.ALIGN_LEFT).appendField('For').appendField(new Blockly.FieldTextInput('0', Blockly.FieldTextInput.numberValidator), 'NUM').appendField(new Blockly.FieldDropdown([
      [
        'seconds',
        'SECONDS'
      ],
      [
        'minutes',
        'MINUTES'
      ],
      [
        'hours',
        'HOURS'
      ]
    ]), 'PERIOD');
    this.appendStatementInput('DO0').appendField('Do');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    var thisBlock = this;
    this.setTooltip('Timer help');
  }
};
Blockly.Blocks['openhab_itemcmd'] = {
  init: function () {
    this.setHelpUrl('Help');
    this.setColour(290);
    this.interpolateMsg('Set Item' + ' %1 ' + 'to' + ' %2', [
      'ITEM',
      new Blockly.FieldVariable('command')
    ], [
      'VALUE',
      null,
      Blockly.ALIGN_RIGHT
    ], Blockly.ALIGN_RIGHT);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('command tooltip');
  },
  getVars: function (varType) {
    return [this.getFieldValue(varType)];
  },
  renameVar: function (varType, oldName, newName) {
    if (Blockly.Names.equals(oldName, this.getFieldValue(varType))) {
      this.setFieldValue(newName, varType);
    }
  }
};
Blockly.Blocks['openhab_itemget'] = {
  init: function () {
    this.setHelpUrl('BLAH');
    this.setColour(290);
    this.appendDummyInput().appendField('Item State').appendField(new Blockly.FieldVariable('Item'), 'ITEM');
    this.setOutput(true);
    this.setTooltip('Get tooltip');
    this.contextMenuMsg_ = 'Make a set';
    this.contextMenuType_ = 'openhab_itemset';
  },
  getVars: function (varType) {
    return [this.getFieldValue(varType)];
  },
  renameVar: function (varType, oldName, newName) {
    if (Blockly.Names.equals(oldName, this.getFieldValue(varType))) {
      this.setFieldValue(newName, varType);
    }
  },
  customContextMenu: function (options) {
    var option = { enabled: true };
    var name = this.getFieldValue('ITEM');
    option.text = this.contextMenuMsg_.replace('%1', name);
    var xmlField = Ext.DomHelper.createDom({
        tag: 'field',
        children: name
      });
    xmlField.setAttribute('name', 'ITEM');
    var xmlBlock = Ext.DomHelper.createDom({
        tag: 'block',
        children: xmlField
      });
    xmlBlock.setAttribute('type', this.contextMenuType_);
    option.callback = Blockly.ContextMenu.callbackFactory(this, xmlBlock);
    options.push(option);
  }
};
Blockly.Blocks['openhab_state_onoff'] = {
  init: function () {
    this.setHelpUrl('Help');
    this.setColour(210);
    this.setOutput(true, 'State');
    this.appendDummyInput().appendField(new Blockly.FieldDropdown([
      [
        'On',
        'ON'
      ],
      [
        'Off',
        'OFF'
      ]
    ]), 'STATE');
    this.setTooltip('Tooltip');
  }
};
Blockly.Blocks['openhab_state_openclosed'] = {
  init: function () {
    this.setHelpUrl('Help');
    this.setColour(210);
    this.setOutput(true, 'State');
    this.appendDummyInput().appendField(new Blockly.FieldDropdown([
      [
        'Open',
        'OPEN'
      ],
      [
        'Closed',
        'CLOSED'
      ]
    ]), 'STATE');
    this.setTooltip('Tooltip');
  }
};
Blockly.Blocks['openhab_itemset'] = {
  init: function () {
    this.setHelpUrl(Blockly.Msg.VARIABLES_SET_HELPURL);
    this.setColour(290);
    this.interpolateMsg('Set Item' + ' %1 ' + 'to' + ' %2', [
      'ITEM',
      new Blockly.FieldVariable('Item')
    ], [
      'VALUE',
      null,
      Blockly.ALIGN_RIGHT
    ], Blockly.ALIGN_RIGHT);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('Tooltip');
    this.contextMenuMsg_ = 'Get';
    this.contextMenuType_ = 'openhab_itemget';
  },
  getVars: function (varType) {
    return [this.getFieldValue(varType)];
  },
  renameVar: function (varType, oldName, newName) {
    if (Blockly.Names.equals(oldName, this.getFieldValue(varType))) {
      this.setFieldValue(newName, varType);
    }
  },
  customContextMenu: Blockly.Blocks['openhab_itemget'].customContextMenu
};
Blockly.Blocks['openhab_itemget'] = {
  init: function () {
    this.setHelpUrl('BLAH');
    this.setColour(290);
    this.appendDummyInput().appendField('Get Item').appendField(new Blockly.FieldVariable('Item'), 'ITEM');
    this.setOutput(true);
    this.setTooltip('Get tooltip');
    this.contextMenuMsg_ = 'Make a set';
    this.contextMenuType_ = 'openhab_itemset';
  },
  getVars: function (varType) {
    return [this.getFieldValue(varType)];
  },
  renameVar: function (varType, oldName, newName) {
    if (Blockly.Names.equals(oldName, this.getFieldValue(varType))) {
      this.setFieldValue(newName, varType);
    }
  },
  customContextMenu: function (options) {
    var option = { enabled: true };
    var name = this.getFieldValue('ITEM');
    option.text = this.contextMenuMsg_.replace('%1', name);
    var xmlField = Ext.DomHelper.createDom({
        tag: 'field',
        children: name
      });
    xmlField.setAttribute('name', 'ITEM');
    var xmlBlock = Ext.DomHelper.createDom({
        tag: 'block',
        children: xmlField
      });
    xmlBlock.setAttribute('type', this.contextMenuType_);
    option.callback = Blockly.ContextMenu.callbackFactory(this, xmlBlock);
    options.push(option);
  }
};
Blockly.Blocks['openhab_constantget'] = {
  init: function () {
    this.setHelpUrl('BLAH');
    this.setColour(45);
    this.appendDummyInput().appendField('Get Constant').appendField(new Blockly.FieldVariable('Constant'), 'CONSTANT');
    this.setOutput(true);
    this.setTooltip('Get tooltip');
    this.contextMenuMsg_ = 'Make a set';
    this.contextMenuType_ = 'openhab_constantset';
  },
  getVars: function (varType) {
    return [this.getFieldValue(varType)];
  },
  renameVar: function (varType, oldName, newName) {
    if (Blockly.Names.equals(oldName, this.getFieldValue(varType))) {
      this.setFieldValue(newName, varType);
    }
  },
  customContextMenu: function (options) {
    var option = { enabled: true };
    var name = this.getFieldValue('ITEM');
    option.text = this.contextMenuMsg_.replace('%1', name);
    var xmlField = Ext.DomHelper.createDom({
        tag: 'field',
        children: name
      });
    xmlField.setAttribute('name', 'CONSTANT');
    var xmlBlock = Ext.DomHelper.createDom({
        tag: 'block',
        children: xmlField
      });
    xmlBlock.setAttribute('type', this.contextMenuType_);
    option.callback = Blockly.ContextMenu.callbackFactory(this, xmlBlock);
    options.push(option);
  }
};
Blockly.Blocks['openhab_constantset'] = {
  init: function () {
    this.setHelpUrl(Blockly.Msg.VARIABLES_SET_HELPURL);
    this.setColour(45);
    this.interpolateMsg('Define Constant' + ' %1 ' + 'as' + ' %2', [
      'CONSTANT',
      new Blockly.FieldVariable('Constant')
    ], [
      'VALUE',
      null,
      Blockly.ALIGN_RIGHT
    ], Blockly.ALIGN_RIGHT);
    this.setPreviousStatement(true, 'Constant');
    this.setNextStatement(true, 'Constant');
    this.setTooltip('Tooltip');
    this.contextMenuMsg_ = 'Set';
    this.contextMenuType_ = 'openhab_constantget';
  },
  getVars: function (varType) {
    return [this.getFieldValue(varType)];
  },
  renameVar: function (varType, oldName, newName) {
    if (Blockly.Names.equals(oldName, this.getFieldValue(varType))) {
      this.setFieldValue(newName, varType);
    }
  },
  customContextMenu: Blockly.Blocks['openhab_constantget'].customContextMenu
};
Blockly.Blocks['openhab_time'] = {
  init: function () {
    this.setHelpUrl('Help');
    this.setColour(210);
    this.setOutput(true, 'Boolean');
    this.appendDummyInput().appendField('Time of day is').appendField(new Blockly.FieldDropdown([
      [
        'before',
        'BEFORE'
      ],
      [
        'after',
        'AFTER'
      ]
    ]), 'COMPARE').appendField(new Blockly.FieldTextInput('0', Blockly.FieldTextInput.numberValidator), 'HOUR').appendField(':').appendField(new Blockly.FieldTextInput('0', Blockly.FieldTextInput.numberValidator), 'MIN');
    this.setTooltip('Tooltip');
  }
};