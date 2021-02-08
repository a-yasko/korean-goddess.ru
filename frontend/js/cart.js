'use strict';


function CartItemView(item, handlers) {

    var handleDecrement = function() {
        typeof(handlers.onDecrement) == 'function' && handlers.onDecrement(item.key);
    };

    var handleIncrement = function() {
        typeof(handlers.onIncrement) == 'function' && handlers.onIncrement(item.key);
    };

    var handleRemove = function() {
        typeof(handlers.onRemove) == 'function' && handlers.onRemove(item.key);
    };

    this.render = function(rootElement) {
        var root = document.createElement("div");
        root.classList.add('cart__item');
        root.setAttribute("id", "cart-item-" + item.key);

        root.innerHTML = `
            <div class="item__delete"><span class="mazzard-bold">X</span></div>
            <div class="row">
                <div class="col-md-2 col-sm-3 col-2 text-center align-self-center">
                    <img src="/product-images/${item.data.img}" alt=${item.data.altimg} class="img-fluid">
                </div>
                <div class="col-xl-2 col-md-3 col-sm-2 col-3 text-center align-self-center">
                    <button class="mazzard-bold item__plusminus minus">−</button>
                    <div class="item__count">
                        <span class="mazzard-bold count__number">${item.amount || 1}</span>
                    </div>
                    <button class="mazzard-bold item__plusminus plus">+</button>
                </div>
                <div class="col-xl-5 col-sm-4 col-4 align-self-center">
                    <span class="mazzard-bold item__name">${item.data.nameitem}</span>
                </div>
                <div class="col-sm col align-self-center">
                    <span class="mazzard-bold item__price">${item.data.price} руб./шт.</span>
                </div>
            </div>
        `;

        rootElement.append(root);

        root.querySelector(".minus").addEventListener("click", handleDecrement);
        root.querySelector(".plus").addEventListener("click", handleIncrement);
        root.querySelector(".item__delete").addEventListener("click", handleRemove);
    };
}

function OrderItemView(item, isDiscountEnabled) {

    this.render = function(rootElement) {
        var root = document.createElement("h6");
        root.classList.add('mazzard-bold', 'order__item');
        root.setAttribute("id", "order-item-" + item.key);
        root.innerHTML = `
            <div class="row">
                <div class="col-7">
                    <span class="order__name">${item.data.nameitem}</span>
                </div>
                <div class="col-5">
                    <span class="order__price">${isDiscountEnabled ? item.data.priceopt : item.data.price} руб. х ${item.amount}</span>
                </div>
            </div>
        `;
        rootElement.prepend(root);
    };
}

function StockProvider(onLoadCallback) {
    var storage = [];

    axios.get('/api/shop/catalog')
        .then(response => {
            storage = response.data;
            if (typeof(onLoadCallback) == "function") {
                onLoadCallback();
            }
        })
        .catch(err => {
            console.warn(err);
        });

    this.getStockAmount = function(productId) {
        for(var i = 0; i < storage.length; i++) {
            var stockItem = storage[i];
            if (stockItem.id == productId) {
                return stockItem.count;
            }
        }

        if (storage.length > 0) {
            return 0;
        }
        else {
            return -1;
        }
    }
}

window.addEventListener("DOMContentLoaded", function() {
    var cart = new CustomerCart();
    var stockProvider = new StockProvider(function(){
        updateAmountControls();
    });

    var cartItemContainer = document.getElementById("cart-items");
    var orderItemContainer = document.getElementById("order-items");
    var cartItemCountElement = document.querySelector('.cart__count p');

    cartItemCountElement.innerHTML = cart.size();

    function handleRemoveItem(key) {
        cart.remove(key);
        var target = document.getElementById("cart-item-" + key);
        cartItemContainer.removeChild(target);
        cartItemCountElement.innerHTML = cart.size();
        updateTotalOrderList();
        updateItemPrices();

        if (cart.size() == 0) {
            renderEmptyView();
        }
    }

    function handleIncrementAmount(key) {
        cart.incrementAmount(key);
        var targetCounterElement = document.querySelector("#cart-item-" + key + " .count__number");
        targetCounterElement.innerText = cart.get(key).amount;
        cartItemCountElement.innerHTML = cart.size();
        updateTotalOrderList();
        updateItemPrices();
        updateAmountControls();
    }

    function handleDecrementAmount(key) {
        cart.decrementAmount(key);
        var targetCounterElement = document.querySelector("#cart-item-" + key + " .count__number");
        targetCounterElement.innerText = cart.get(key).amount;
        cartItemCountElement.innerHTML = cart.size();
        updateTotalOrderList();
        updateItemPrices();
        updateAmountControls();
    }

    function updateItemPrices() {
        var entries = cart.list();
        
        entries.forEach(function(item) {
            var target = document.getElementById("cart-item-" + item.key).querySelector(".item__price");
            if (target) {
                target.innerHTML = (cart.discountEnabled() ? item.data.priceopt : item.data.price) + ' руб./шт.';
            }
        });
    }

    function updateTotalOrderList() {
        var total = cart.total();
        var target = document.getElementById("total");
        target.innerText = total + " руб.";

        var discountEnabled = cart.discountEnabled();
        renderOrderEntries(discountEnabled);
    }

    function renderCartEntries() {

        cartItemContainer.innerHTML = "";
        var entries = cart.list();

        entries.forEach(function(entry) {
            var cartItemView = new CartItemView(entry, {
                onDecrement: handleDecrementAmount,
                onIncrement: handleIncrementAmount,
                onRemove: handleRemoveItem
            });

            cartItemView.render(cartItemContainer);
        });
    }

    function renderOrderEntries(isDiscountEnabled) {
        orderItemContainer.innerHTML = "";
        var entries = cart.list().reverse();

        entries.forEach(function(entry) {
            var orderItemView = new OrderItemView(entry, isDiscountEnabled);
            orderItemView.render(orderItemContainer);
        });
    }

    function renderEmptyView() {
        var root = document.createElement("div");
        root.classList.add("empty-view");
        root.innerHTML = "<h5>Ваша корзина пуста.</h5>";

        cartItemContainer.append(root);

        // disable button
        var submitButton = document.querySelector("#checkout-form button[type=submit]");
        submitButton.classList.replace("neon-btn", "disabled");
        submitButton.setAttribute("disabled", true);
        submitButton.innerHTML = "Заказать";
    }

    function updateAmountControls() {
        var entries = cart.list();

        var stockLimitExceed = false;
        var stockExceedWarning = document.getElementById(`stock-exceed-warning`);
        var checkoutButton = document.getElementById(`checkout-button`);

        entries.forEach(function(entry) {
            var productId = entry.data.productId;
            var cartAmount = entry.amount;
            var stockAmount = stockProvider.getStockAmount(productId);
            
            var incrementControlElement = document.querySelector(`#cart-item-${entry.key} button.plus`);

            if (stockAmount == -1) {
                return;
            }

            if (cartAmount > stockAmount) {
                incrementControlElement.style.visibility = "hidden";
                stockLimitExceed = stockLimitExceed || true;
            }
            else if (cartAmount == stockAmount) {
                incrementControlElement.style.visibility = "hidden";
                stockLimitExceed = stockLimitExceed || false;
            }
            else {
                incrementControlElement.style.visibility = "visible";
                stockLimitExceed = stockLimitExceed || false;
            }
        });

        if (stockLimitExceed) {
            stockExceedWarning.style.display = "block";
            checkoutButton.disabled = true;
        }
        else {
            stockExceedWarning.style.display = "none";
            checkoutButton.disabled = false;
        }
    }

    function initializeView() {
        renderCartEntries();
        updateTotalOrderList();

        if (cart.size() == 0) {
            renderEmptyView();
        }
    }

    initializeView();
});