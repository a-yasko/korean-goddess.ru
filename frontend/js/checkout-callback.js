'use strict';

window.addEventListener('DOMContentLoaded', function() {
  const urlParams = new URLSearchParams(window.location.search);

  const status = urlParams.get('status');
  const orderId = urlParams.get('order');
  
  if (status == "New") {
    document.getElementById("success-message").innerText = "Заказ №" + orderId + " успешно обработан!";
  }

  if (status == "Paid") {
    const success = urlParams.get('success');

    if (success.toLowerCase() == "true") {
      document.getElementById("success-message").innerText = "Заказ №" + orderId + " успешно оплачен!";
    }
    else {
      document.getElementById("success-message").innerText = "Заказ №" + orderId + " не оплачен";
    }
  }

});