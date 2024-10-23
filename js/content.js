(function () {
    const button = document.createElement('button');
    button.innerText = 'Добавить в отслеживаемые';
    button.style.position = 'fixed';
    button.style.bottom = '10px';
    button.style.right = '10px';
    button.style.padding = '12px 20px';
    button.style.zIndex = '1000';
    button.style.backgroundColor = '#ff5a5f';
    button.style.color = '#fff';
    button.style.border = 'none';
    button.style.borderRadius = '5px';
    button.style.cursor = 'pointer';
    button.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
    button.style.fontSize = '14px';
    button.style.transition = 'background-color 0.3s ease, transform 0.2s ease';

    button.addEventListener('mouseover', () => {
        button.style.backgroundColor = '#ff787d';
        button.style.transform = 'translateY(-2px)';
    });

    button.addEventListener('mouseout', () => {
        button.style.backgroundColor = '#ff5a5f';
        button.style.transform = 'translateY(0)';
    });

    const priceInput = document.createElement('input');
    priceInput.type = 'number';
    priceInput.placeholder = 'Лимит цены';
    priceInput.style.position = 'fixed';
    priceInput.style.bottom = '50px';
    priceInput.style.right = '10px';
    priceInput.style.padding = '10px';
    priceInput.style.width = '150px';
    priceInput.style.borderRadius = '5px';
    priceInput.style.zIndex = '1000';
    priceInput.style.backgroundColor = '#f5f5f5';
    priceInput.style.border = '1px solid #ccc';
    priceInput.style.fontSize = '14px';
    priceInput.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.1)';
    priceInput.style.transition = 'border-color 0.3s ease, transform 0.2s ease';

    priceInput.addEventListener('focus', () => {
        priceInput.style.borderColor = '#0073e6';
        priceInput.style.transform = 'translateY(-2px)';
    });

    priceInput.addEventListener('blur', () => {
        priceInput.style.borderColor = '#ccc';
        priceInput.style.transform = 'translateY(0)';
    });

    document.body.appendChild(button);
    document.body.appendChild(priceInput);

    function getProductDetails() {
        let price = null;
        let title = null;
        let imageUrl = null;
        let productUrl = window.location.href;
        let marketplace = '';
    
        // Парсинг для Ozon
        if (window.location.host.includes('ozon.ru')) {
            marketplace = 'ozon';
            title = document.querySelector('[data-widget="webProductHeading"] h1')?.innerText ||
                    document.evaluate('//div[@data-widget="webProductHeading"]//h1', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue?.innerText;
            price = document.querySelector('div.m3s_27 span.s5m_27')?.innerText.replace(/\D/g, '') ||
                    document.querySelector('div.alternate-price-class')?.innerText.replace(/\D/g, '');
            imageUrl = document.querySelector('div.kq7_27 img')?.src || '';
        }
        // Парсинг для Wildberries
        else if (window.location.host.includes('wildberries.ru')) {
            marketplace = 'wildberries';
            title = document.querySelector('h1.product-page__title')?.innerText;
            price = document.querySelector('.price-block__final-price')?.innerText.replace(/\D/g, '');
            imageUrl = document.querySelector('.photo-zoom__preview')?.src || '';
        }
        // Парсинг для Яндекс Маркета
        else if (window.location.host.includes('market.yandex.ru')) {
            marketplace = 'yandex_market';
            title = document.querySelector('h1[data-auto="productCardTitle"]')?.innerText;
            price = document.querySelector('h3[data-auto="snippet-price-current"]')?.innerText.replace(/\D/g, '');
            imageUrl = document.querySelector('img#transition-page')?.src || '';
        }
    
        if (price && title) {
            return { title, price: parseFloat(price), imageUrl, productUrl, marketplace };
        }
        return null;
    }    

    // Обработка события нажатия на кнопку
    button.addEventListener('click', () => {
        const productDetails = getProductDetails();
        const targetPrice = parseFloat(priceInput.value);

        if (!targetPrice) {
            alert('Введите лимит цены');
            return;
        }

        if (productDetails) {
            const product = {
                title: productDetails.title,
                price: productDetails.price,
                targetPrice: targetPrice,
                imageUrl: productDetails.imageUrl,
                productUrl: productDetails.productUrl,
                marketplace: productDetails.marketplace
            };

            // Добавляем товар в хранилище
            chrome.storage.local.get({ trackedProducts: [] }, (result) => {
                let trackedProducts = result.trackedProducts;
                trackedProducts = trackedProducts.filter(item => item.productUrl !== product.productUrl); // Удаляем старую версию товара
                trackedProducts.push(product); // Добавляем обновленную информацию о товаре
                chrome.storage.local.set({ trackedProducts }, () => {
                    alert(`${product.title} добавлен в отслеживаемые с лимитом цены: ${targetPrice}₽`);

                    // Отправляем данные на сервер через background.js
                    chrome.runtime.sendMessage({ action: 'saveProducts', products: trackedProducts }, (response) => {
                        if (response && response.success) {
                            console.log('Продукты успешно отправлены на сервер');
                        } else {
                            console.error('Ошибка при отправке продуктов на сервер:', response?.error);
                        }
                    });
                });
            });
        } else {
            alert('Не удалось получить данные о товаре.');
        }
    });

    // Слушатель изменений в хранилище
    chrome.storage.onChanged.addListener((changes, areaName) => {
        if (areaName === 'local' && changes.trackedProducts) {
            const trackedProducts = changes.trackedProducts.newValue || [];
            console.log('Обновленные отслеживаемые продукты:', trackedProducts);

            // Отправляем обновленный список продуктов на сервер
            chrome.runtime.sendMessage({ action: 'saveProducts', products: trackedProducts }, (response) => {
                if (response && response.success) {
                    console.log('Продукты успешно обновлены на сервере');
                } else {
                    console.error('Ошибка при обновлении продуктов на сервере:', response?.error);
                }
            });
        }
    });
})();
