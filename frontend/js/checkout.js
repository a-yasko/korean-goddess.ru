'use strict';

window.addEventListener('DOMContentLoaded', function() {
    var selector = document.querySelectorAll('input[type="tel"]');
    var mask = new Inputmask('+7 (999) 999-99-99');
    mask.mask(selector);
    

    var showError = function() {
        var target = document.querySelector(".cart .cart__order");
        var errorMsg = document.createElement("div");
        errorMsg.setAttribute("id", "submit-error");
        errorMsg.innerText = "Произошла ошибка в обработке заказа.";
        target.append(errorMsg);
    };

    var hideError = function() {
        var target = document.querySelector(".cart #submit-error");
        if (target) {
            target.parentElement.removeChild(target);
        }
    };

    var callbacks = {
        onSuccess: function(responseText) {
            try {
                var response = JSON.parse(responseText);

                if (response.success) {
                    var cart = new CustomerCart();
                    cart.reset();

                    if (response.data.payment) {
                        document.getElementById("checkout-button").style.display = "none";
                        document.getElementById("redirect-warning").innerText = "Перенаправляем на страницу оплаты...";

                        setTimeout(() => {
                            window.location = response.data.payment;
                        }, 3000);
                    }
                    else {
                        window.location = "/order-success.html?order=" + response.data.order.id + "&status=" + response.data.order.status;
                    }
                }
                else {
                    showError();
                }
            } catch (err) {
                console.log(err);

                showError();
            }
        },
        onError: function() {
            showError();
        },
    };
    
	new window.JustValidate("#checkout-form", {
		rules: {
			name: { required: true, minLength: 3, maxLength: 15 },
            tel: {required: true},
            "payment-type": { required: true },
		},
		messages: {
			name: { required: "Пожалуйста, введите имя" },
            tel: { required: "Пожалуйста, введите свой номер телефона" },
		},
		submitHandler: function(form, values, ajax) {
            hideError();

            values["payment-type"] = form.querySelector("input[name=payment-type]:checked").value;
            
            // Добавляем содержимое корзины
            var cart = new CustomerCart();
            values.positions = cart.list();
            values.total = cart.total();
            values.discount = cart.discountEnabled();

            var xhr = new XMLHttpRequest();
            xhr.open("POST", "/api/shop/checkout", true);
            xhr.setRequestHeader('Content-Type', 'application/json');

            xhr.onreadystatechange = function() {
                if (this.readyState === 4) {
                    var responseText = this.responseText;

                    if (this.status === 200) {
                        callbacks.onSuccess(responseText);
                    } else {
                        callbacks.onError(responseText);
                    }
                }
            };

            var body = JSON.stringify(values);
            xhr.send(body);
        },
	});

});