document.addEventListener('DOMContentLoaded', () => {
    const telegramIdInput = document.getElementById('telegramId');
    const tokenInput = document.getElementById('token');
    const saveButton = document.getElementById('saveButton');
    const connectTelegramButton = document.getElementById('connectTelegram');
  
    // Загрузка сохраненных данных
    chrome.storage.local.get(['telegramId', 'token'], (result) => {
      if (result.telegramId) {
        telegramIdInput.value = result.telegramId;
      }
      if (result.token) {
        tokenInput.value = result.token;
      }
    });
  
    // Сохранение данных
    saveButton.addEventListener('click', () => {
      const telegramId = telegramIdInput.value.trim();
      const token = tokenInput.value.trim();
  
      if (!telegramId || !token) {
        alert('Пожалуйста, введите ваш Telegram ID и токен.');
        return;
      }
  
      chrome.storage.local.set({ telegramId, token }, () => {
        alert('Данные Telegram сохранены!');
      });
    });
  
    connectTelegramButton.addEventListener('click', () => {
      window.open('https://t.me/TrackerPrices_bot', '_blank');
    });
  });
  