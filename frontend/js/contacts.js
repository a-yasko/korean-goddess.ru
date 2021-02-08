'use strict';

window.addEventListener('DOMContentLoaded', function() {
    
    let selector = document.querySelectorAll('input[type="tel"]');
    let im = new Inputmask('+7 (999) 999-99-99');
    im.mask(selector);

    let validateForms = function(selector, rules, successModal, yaGoal) {
        new window.JustValidate(selector, {
            rules: rules,
            messages: {
                name: {
                    required: 'Без имени не отправлю'
                },
                tel: {
                    required: 'Без телефона тоже'
                },
            },
            submitHandler: function(form) {
                let formData = new FormData(form);

                let xhr = new XMLHttpRequest();

                xhr.onreadystatechange = function() {
                    if (xhr.readyState === 4) {
                        if (xhr.status === 200) {
                            console.log('Отправлено');
                        }
                    }
                };

                xhr.open('POST', '/api/shop/feedback', true);
                xhr.send(formData);

                form.reset();
            }
        });
    };

    validateForms('.form', {name: {required: true, minLength: 3, maxLength: 15}, tel: {required: true}}, '.thanks-popup', 'send goal');

});



