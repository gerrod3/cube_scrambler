// Default settings
const DEFAULT_SETTINGS = {
  theme: 'system',
  newScrambleKeybind: 'c',
  timerKeybind: 'Space',
  resetTimerKeybind: 'x',
  saveTimeKeybind: 'z',
  scrambleLength: 20
};

// Validation constants
const MIN_SCRAMBLE_LENGTH = 1;
const MAX_SCRAMBLE_LENGTH = 100;

// Custom alert function
function showAlert(message) {
  const overlay = document.getElementById('alertOverlay');
  const messageEl = document.getElementById('alertMessage');
  const button = document.getElementById('alertButton');

  messageEl.textContent = message;
  overlay.style.display = 'flex';

  // Close on button click
  button.onclick = () => {
    overlay.style.display = 'none';
  };

  // Close on overlay click (optional)
  overlay.onclick = (e) => {
    if (e.target === overlay) {
      overlay.style.display = 'none';
    }
  };
}

// Get current settings from storage or use defaults
async function loadSettings() {
  try {
    const result = await browser.storage.local.get('settings');
    return result.settings || DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Error loading settings:', error);
    return DEFAULT_SETTINGS;
  }
}

// Save settings to storage
async function saveSettings(settings) {
  try {
    // Validate scramble length before saving
    const scrambleLength = parseInt(settings.scrambleLength, 10);
    if (isNaN(scrambleLength) || scrambleLength < MIN_SCRAMBLE_LENGTH || scrambleLength > MAX_SCRAMBLE_LENGTH) {
      throw new Error(`Scramble length must be between ${MIN_SCRAMBLE_LENGTH} and ${MAX_SCRAMBLE_LENGTH}`);
    }
    
    await browser.storage.local.set({ settings });

  } catch (error) {
    console.error('Error saving settings:', error);
    showAlert(error.message);
    return false;
  }
  return true;
}

// Update UI with current settings
async function updateUI() {
  const settings = await loadSettings();
  
  document.getElementById('theme').value = settings.theme;
  document.getElementById('newScrambleKeybind').value = settings.newScrambleKeybind;
  document.getElementById('timerKeybind').value = settings.timerKeybind;
  document.getElementById('resetTimerKeybind').value = settings.resetTimerKeybind;
  document.getElementById('saveTimeKeybind').value = settings.saveTimeKeybind;
  document.getElementById('scrambleLength').value = settings.scrambleLength;
}

// Handle keybind input
function setupKeybindListeners() {
  const keybindInputs = ['newScrambleKeybind', 'timerKeybind', 'resetTimerKeybind', 'saveTimeKeybind'];
  
  keybindInputs.forEach(inputId => {
    const input = document.getElementById(inputId);
    
    input.addEventListener('keydown', (e) => {
      e.preventDefault();
      
      const keys = [];
      if (e.ctrlKey) keys.push('Ctrl');
      if (e.altKey) keys.push('Alt');
      if (e.shiftKey) keys.push('Shift');
      
      // Add the key if it's not a modifier
      if (!['Control', 'Alt', 'Shift'].includes(e.key)) {
        keys.push(e.key === ' ' ? 'Space' : e.key);
      }
      
      input.value = keys.join('+');
    });
  });
}

// Setup scramble length validation
function setupScrambleLengthValidation() {
  const input = document.getElementById('scrambleLength');
  const validationMessage = document.getElementById('scrambleLengthValidation');
  
  function validateInput() {
    const value = parseInt(input.value, 10);
    let message = '';
    let isValid = true;

    if (isNaN(value)) {
      message = 'Please enter a number';
      isValid = false;
    } else if (value < MIN_SCRAMBLE_LENGTH) {
      message = `Minimum length is ${MIN_SCRAMBLE_LENGTH}`;
      isValid = false;
    } else if (value > MAX_SCRAMBLE_LENGTH) {
      message = `Maximum length is ${MAX_SCRAMBLE_LENGTH}`;
      isValid = false;
    }

    validationMessage.textContent = message;
    input.classList.toggle('invalid', !isValid);
    return isValid;
  }

  input.addEventListener('input', validateInput);
  input.addEventListener('blur', validateInput);
}

// Save button click handler
async function handleSave() {
  const scrambleLengthInput = document.getElementById('scrambleLength');
  const value = parseInt(scrambleLengthInput.value, 10);
  
  if (isNaN(value) || value < MIN_SCRAMBLE_LENGTH || value > MAX_SCRAMBLE_LENGTH) {
    scrambleLengthInput.focus();
    return;
  }

  const settings = {
    theme: document.getElementById('theme').value,
    newScrambleKeybind: document.getElementById('newScrambleKeybind').value,
    timerKeybind: document.getElementById('timerKeybind').value,
    resetTimerKeybind: document.getElementById('resetTimerKeybind').value,
    saveTimeKeybind: document.getElementById('saveTimeKeybind').value,
    scrambleLength: value
  };
  
  if (await saveSettings(settings)) {
    showAlert('Settings saved!');
  }
}

// Handle theme selection changes
function setupThemeListener() {
  const themeSelect = document.getElementById('theme');
  themeSelect.addEventListener('change', (e) => {
    applyTheme(e.target.value);
  });
}

// Global settings used by other parts of the extension
var GLOBAL_SETTINGS = {};
var GLOBAL_SETTINGS_PROMISE = null;
async function initGlobalSettings() {
    GLOBAL_SETTINGS = await loadSettings();
}

// Chrome compatibility
if (typeof browser === 'undefined') {
  var browser = chrome;
}

// Initialize
GLOBAL_SETTINGS_PROMISE = initGlobalSettings();
if (document.location.pathname === '/popup/settings.html') {
  document.addEventListener('DOMContentLoaded', () => {
    updateUI();
    setupKeybindListeners();
    setupScrambleLengthValidation();
    setupThemeListener();
    
    document.getElementById('saveSettings').addEventListener('click', handleSave);
  });
}
