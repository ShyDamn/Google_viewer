document.addEventListener('DOMContentLoaded', () => {
    const productList = document.getElementById('productList');
    const settingsButton = document.getElementById('settingsButton');
    const productSection = document.getElementById('productSection');
    const settingsSection = document.getElementById('settingsSection');
    const backButton = document.getElementById('backButton');
    const title = document.getElementById('title');
  
    const telegramIdInput = document.getElementById('telegramId');
    const tokenInput = document.getElementById('token');
    const saveButton = document.getElementById('saveButton');
    const connectTelegramButton = document.getElementById('connectTelegram');
  
    // Загрузка сохраненных данных
    chrome.storage.local.get(['trackedProducts', 'telegramId', 'token'], (result) => {
      displayProducts(result.trackedProducts || []);
      if (result.telegramId) {
        telegramIdInput.value = result.telegramId;
      }
      if (result.token) {
        tokenInput.value = result.token;
      }
    });
  
    // Переход в настройки
    settingsButton.addEventListener('click', () => {
      productSection.style.display = 'none';
      settingsSection.style.display = 'block';
      title.textContent = 'Настройки';
    });
  
    // Возврат к списку товаров
    backButton.addEventListener('click', () => {
      settingsSection.style.display = 'none';
      productSection.style.display = 'block';
      title.textContent = 'Отслеживаемые товары';
    });
  
    // Сохранение данных настроек
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
  
    // Отображение отслеживаемых продуктов
    function displayProducts(products) {
      productList.innerHTML = '';
      products.forEach((product, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
          <div class="product-item">
            <img src="${product.imageUrl}" alt="${product.title}" class="product-image">
            <div class="product-details">
              <a href="${product.productUrl}" target="_blank">${product.title}</a><br>
              <span class="price">Текущая цена: ${product.price}₽</span><br>
              <span class="target-price">Лимит цены: ${product.targetPrice}₽</span>
            </div>
            <img src="img/${product.marketplace}.png" class="marketplace-icon" alt="${product.marketplace}">
            <button class="remove" data-index="${index}">&times;</button>
          </div>
        `;
        productList.appendChild(li);
      });
  
      // Удаление продукта из отслеживания
      document.querySelectorAll('.remove').forEach(button => {
        button.addEventListener('click', (e) => {
          const index = e.target.getAttribute('data-index');
          removeProduct(index);
        });
      });
    }
  
    // Удаление продукта
    function removeProduct(index) {
      chrome.storage.local.get('trackedProducts', (result) => {
        let products = result.trackedProducts || [];
        products.splice(index, 1);
        chrome.storage.local.set({ trackedProducts: products }, () => {
          displayProducts(products);
  
          // Отправляем обновленный список продуктов на сервер
          chrome.runtime.sendMessage({ action: 'saveProducts' }, (response) => {
            if (response && response.success) {
              console.log('Обновленный список продуктов отправлен на сервер');
            } else {
              console.error('Ошибка при обновлении продуктов на сервере:', response?.error);
            }
          });
        });
      });
    }
  });
  