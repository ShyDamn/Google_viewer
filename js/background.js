async function sendProductsToServer(products, telegramId, token) {
    const validProducts = products.filter(product => {
      return product.title && product.price && product.productUrl && product.targetPrice && product.marketplace;
    });
  
    if (validProducts.length === 0) {
      console.log('Нет валидных продуктов для отправки на сервер');
      return;
    }
  
    try {
      console.log('Отправляемые продукты на сервер:', validProducts);
      const response = await fetch('http://localhost:8000/api/save-products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          telegram_id: parseInt(telegramId),
          token: token,
          products: validProducts
        })
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ошибка при сохранении продуктов: ${response.status} ${errorText}`);
      }
  
      console.log('Продукты успешно сохранены на сервере');
    } catch (error) {
      console.error('Ошибка при сохранении продуктов:', error);
    }
  }
  
  // Обработчик сообщений от content.js
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'saveProducts') {
      chrome.storage.local.get(['telegramId', 'token'], (result) => {
        if (!result.telegramId || !result.token) {
          console.error('Telegram не подключен');
          sendResponse({ success: false, error: 'Telegram не подключен' });
          return;
        }
  
        const products = message.products || [];
        if (!Array.isArray(products)) {
          console.error('Неверные данные продуктов');
          sendResponse({ success: false, error: 'Неверные данные продуктов' });
          return;
        }
  
        // Отправляем продукты на сервер
        sendProductsToServer(products, result.telegramId, result.token)
          .then(() => {
            sendResponse({ success: true });
          })
          .catch((error) => {
            console.error('Ошибка при отправке продуктов на сервер:', error);
            sendResponse({ success: false, error: error.message });
          });
      });
  
      return true;
    }
  });
  