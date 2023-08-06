const MODULE_ID = 'tidy5esheet-corruption';

const TEMPLATES = {
    corruptionBlock: `modules/${MODULE_ID}/templates/corruption_block.html`,
};

const corruption = {
    1 : ['unchecked','unchecked','unchecked','unchecked','unchecked'],
    2 : ['unchecked','unchecked','unchecked','unchecked','unchecked'],
    3 : ['unchecked','unchecked','unchecked','unchecked','unchecked'],
    4 : ['unchecked','unchecked','unchecked','unchecked','unchecked']
}

setDataStateForCheckboxes = data => {
  const corruptionNotesElement = document.querySelector('.corruption-notes');
  if (!corruptionNotesElement) {
    console.error("Element 'corruption-notes' not found.");
    return;
  }

  const checkboxLines = corruptionNotesElement.querySelectorAll('.line');
  for (const [lineNumber, dataStates] of Object.entries(data)) {
    const lineIndex = parseInt(lineNumber) - 1;
    const line = checkboxLines[lineIndex];
    if (line) {
      const checkboxes = line.querySelectorAll('input[type="checkbox"]');
      checkboxes.forEach((checkbox, index) => {
        const dataState = dataStates[index];
        if (['unchecked', 'checkedOnce', 'checkedTwice'].includes(dataState)) {
          checkbox.setAttribute('data-state', dataState);
          checkbox.checked = dataState === 'checkedOnce' || dataState === 'checkedTwice';
        } else {
          console.warn(`Invalid data-state value for checkbox ${lineNumber}-${index + 1}: ${dataState}`);
        }
      });
    } else {
      console.error(`Line ${lineNumber} not found.`);
    }
  }
}

Hooks.once('init', () => {
    
  // CONFIG.debug.hooks = true;
  
  if (!game.modules.get('tidy5e-sheet')) {
    console.error('Tidy5eSheet not found. Make sure it is installed and enabled.');
    return;
  }
  
  Hooks.on('renderTidy5eSheet', async (app, html, data) => {
      
    const corruptionData = app.actor.getFlag('tidy5esheet-corruption', 'corruptionData');
    
    if (!corruptionData) {
      app.actor.setFlag('tidy5esheet-corruption', 'corruptionData', corruption);
    }
    
    const rightNotesDiv = html.find('.right-notes.note-entries');
    const rendered_html = await renderTemplate(TEMPLATES.corruptionBlock);
    rightNotesDiv.append(rendered_html);
    
    setDataStateForCheckboxes(app.actor.getFlag('tidy5esheet-corruption', 'corruptionData'));
  });
  
  Hooks.on('closeTidy5eSheet', async (app, html, data) => {
      
    const rightNotesDiv = html.find('.right-notes.note-entries');
    const corruptionNotesDiv = rightNotesDiv.find('.corruption-notes');

    const checkboxDataStates = {};
    
    corruptionNotesDiv.first().find('.line').each(function(index) {
      const checkboxes = $(this).find("input[type='checkbox']");
    
      const dataStates = [];
    
      checkboxes.each(function() {
        const dataState = $(this).data('state');
        dataStates.push(dataState);
      });
    
      checkboxDataStates[index + 1] = dataStates;
    });
    
    app.actor.setFlag('tidy5esheet-corruption', 'corruptionData', checkboxDataStates);
  });

  console.log('Corruption module initialized');
});
