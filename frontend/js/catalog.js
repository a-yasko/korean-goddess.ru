'use strict';

function ProductCard(data) {
    this.root = null;

    var exceedsStockLimit = function() {
        var cart = new CustomerCart();
        var productInfo = cart.getByProductId(data.id);

        if (productInfo == null) {
            return false;
        }
        else {
            return productInfo.amount >= data.count;
        }
    }

    this.onClick = function (handler) {
        if (this.root) {
            var button = this.root.querySelector("button");
            button.addEventListener("click", function (event) {
                if (typeof (handler) == 'function') {
                    var productInfo = {
                        productId: data.id,
                        quality: data.quality,
                        typeitem: data.typeitem,
                        nameitem: data.nameitem,
                        price: data.price,
                        priceopt: data.priceopt,
                        idmodal: data.idmodal,
                        idmodallink: data.idmodallink,
                        img: data.img,
                        description: data.description,
                        descriptionHeader: data.descriptionHeader,
                        stockCount: data.count
                    };
                    handler(event, productInfo);
                }
            });
        } else {
            console.error(".render() this component first");
        }
    };

    this.render = function (rootElement) {
        this.root = document.createElement('div');
        this.root.classList.add('col-xl-4', 'col-lg-4', 'col-md-6', 'col-sm-6', 'col-6', 'catalog__item');


        var activeButtonHtml = `
            <button class="neon-btn btn-block mazzard-bold">
                В корзину <img src="/img/arrow.svg" alt="arrow" />
                <span class="neon-btn__decorate neon-btn__decorate--one" aria-hidden="true"></span>
                <span class="neon-btn__decorate neon-btn__decorate--two" aria-hidden="true"></span>
                <span class="neon-btn__decorate neon-btn__decorate--three" aria-hidden="true"></span>
                <span class="neon-btn__decorate neon-btn__decorate--four" aria-hidden="true"></span>
            </button>
        `;

        var stockLimitButtonHtml = `
            <button class="btn-block mazzard-bold disabled">Недостаточно товара на складе</button>
        `;

        this.root.innerHTML = `
            <a href="" data-toggle="modal" data-target="${data.idmodallink}"><img src="/product-images/${data.img}" alt="${data.altimg}" class="img-fluid"></a>
            <p>${data.quality}</p>
            <h5><a href="" data-toggle="modal" data-target="${data.idmodallink}"><span class="mazzard-bold">${data.typeitem} ${data.nameitem}</span></a></h5>
            <h6 class="mazzard-bold">Цена: ${data.price} р.</h6>
            <p>Цена при заказе от 5000 р.: ${data.priceopt} р.</p>
            ${exceedsStockLimit() ? stockLimitButtonHtml : activeButtonHtml}
        `;
        
        rootElement.append(this.root);
        return this;
    };
    
    this.renderModal = function (rootElement) {
        this.root = document.createElement('div');
        this.root.classList.add('modal', 'fade');
        this.root.setAttribute('id', data.idmodal);
        this.root.setAttribute('tabindex', '-1');
        this.root.setAttribute('role', 'dialog');
        this.root.setAttribute('aria-labelledby', 'exampleModalCenterTitle');
        this.root.setAttribute('aria-hidden', 'true');

        this.root.innerHTML = `
            <div class="modal-dialog modal-xl modal-dialog-centered" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-lg-4 col-md-5 col-sm-8">
                                <img src="/product-images/${data.img}" alt="" class="img-fluid">
                            </div>
                            <div class="col-lg-8 col-md-7">
                                <h5 class="mazzard-bold">${data.descriptionHeader}</h5>
                                <p class="mt-3">${data.description}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
      `;
        
        rootElement.append(this.root);
        return this;
    };
}

window.addEventListener('DOMContentLoaded', function () {

    // Пагинация
    const catalogPagination = document.querySelector('.catalog__pagination .col-12');

    function pagination(arg) {
        catalogPagination.innerHTML = '<span class="mazzard-bold">Страницы</span>';
        axios.get(arg)
            .then(data => {
                for (let i = 1; i <= Math.ceil(data.data.length / 9); ++i) {
                    let a = document.createElement('a');
                    a.classList.add('pl-3', 'mazzard-bold');
                    a.setAttribute('href', `#${i}`);
                    a.innerHTML = `${i}`;
                    catalogPagination.append(a);
                    a.addEventListener('click', () => {
                        axios.get(`/api/shop/catalog?_page=${i}&_limit=9&${price}&${brand}&${type}`)
                        .then(data => {
                            itemParent.innerHTML = '';

                            data.data.forEach(item => {
                                var card = new ProductCard(item).render(itemParent);
                                new ProductCard(item).renderModal(document.body);
                                card.onClick(addToCart);
                            });
                        });
                    });
                }
            });
    }

    // Формирование карточек товаров
    const itemParent = document.querySelector('.catalog .container .col-xl-9 .row');

    axios.get('/api/shop/catalog?_page=1&_limit=9')
        .then(data => {
            data.data.forEach(item => {
                var card = new ProductCard(item).render(itemParent);
                new ProductCard(item).renderModal(document.body);
                card.onClick(addToCart);
            });
            pagination(`/api/shop/catalog`);
        });

    // Фильтр товаров
    const filterPrice = document.querySelectorAll('#filter__price'),
          filterBrand = document.querySelectorAll('#filter__brand'),
          showResult = document.querySelectorAll('#show-result'),
          resetFilter = document.querySelectorAll('#reset-filter');

    let filterType = document.querySelectorAll('.filter__type input'),
        price, brand, type;

    filterPrice.forEach(i => {
        i.addEventListener('change', () => {
            if (i.value == 1) {
                price = '_sort=price&_order=ASC';
            } else if (i.value == 2) {
                price = '_sort=price&_order=DESC';
            } else if (i.value == 0) {
                price = '';
            }
        });
    });
    
    // filterPrice.addEventListener('change', () => {
    //     if (filterPrice.value == 1) {
    //         price = '_sort=price&_order=ASC';
    //     } else if (filterPrice.value == 2) {
    //         price = '_sort=price&_order=DESC';
    //     } else if (filterPrice.value == 0) {
    //         price = '';
    //     }
    // });

    filterBrand.forEach(i => {
        i.addEventListener('change', () => {
            brand = i.value;
        });
    });

    // filterBrand.addEventListener('change', () => {
    //     brand = filterBrand.value;
    // });

    filterType.forEach(i => {
        i.addEventListener('change', () => {
            type = Array.from(filterType).filter(inp => inp.checked).map(inp => inp.value).join('&');
        });
    });

    showResult.forEach(i => {
        i.addEventListener('click', () => {
            axios.get(`/api/shop/catalog?_page=1&_limit=9&${price}&${brand}&${type}`)
                .then(data => {
                    itemParent.innerHTML = '';
    
                    data.data.forEach(item => {
                        var card = new ProductCard(item).render(itemParent);
                        new ProductCard(item).renderModal(document.body);
                        card.onClick(addToCart);
                    });
    
                    pagination(`/api/shop/catalog?${price}&${brand}&${type}`);
                });
        });
    });

    // showResult.addEventListener('click', () => {
    //     axios.get(`/api/shop/catalog?_page=1&_limit=9&${price}&${brand}&${type}`)
    //         .then(data => {
    //             itemParent.innerHTML = '';

    //             data.data.forEach(item => {
    //                 var card = new ProductCard(item).render(itemParent);
    //                 new ProductCard(item).renderModal(document.body);
    //                 card.onClick(addToCart);
    //             });

    //             pagination(`/api/shop/catalog?${price}&${brand}&${type}`);
    //         });
    // });

    resetFilter.forEach(i => {
        i.addEventListener('click', () => {
            axios.get(`/api/shop/catalog?_page=1&_limit=9&${price = ''}&${brand = ''}&${type = ''}`)
                .then(data => {
                    itemParent.innerHTML = '';
                    data.data.forEach(item => {
                        var card = new ProductCard(item).render(itemParent);
                        new ProductCard(item).renderModal(document.body);
                        card.onClick(addToCart);
                    });
                    pagination(`/api/shop/catalog`);
                });
            filterPrice.forEach(i => {
                i.value = '';
            });
            filterBrand.forEach(i => {
                i.value = '';
            });
            filterType.forEach(i => {
                i.checked = false;
            });
        });
    });

    // resetFilter.addEventListener('click', () => {
    //     axios.get(`/api/shop/catalog?_page=1&_limit=9&${price = ''}&${brand = ''}&${type = ''}`)
    //         .then(data => {
    //             itemParent.innerHTML = '';
    //             data.data.forEach(item => {
    //                 var card = new ProductCard(item).render(itemParent);
    //                 new ProductCard(item).renderModal(document.body);
    //                 card.onClick(addToCart);
    //             });
    //             pagination(`/api/shop/catalog`);
    //         });
    //     filterPrice.value = '';
    //     filterBrand.value = '';
    //     filterType.forEach(i => {
    //         i.checked = false;
    //     });
    // });

    // Добавление в корзину
    var cart = new CustomerCart();

    var cartItemCountElement = document.querySelector('.cart__count p');
    cartItemCountElement.innerHTML = cart.size();

    var addToCart = function (event, data) {
        var target = event.target.tagName == "BUTTON" ? event.target : event.target.parentElement;

        if (target.classList.contains("disabled")) {
            return;
        }

        var targetEntry = null;
        var entries = cart.list();

        for (var i = 0; i < entries.length; i++) {
            if (entries[i].data.idmodal == data.idmodal) {
                targetEntry = entries[i];
                break;
            }
        }

        if (targetEntry) {
            cart.incrementAmount(targetEntry.key);
        } else {
            cart.add(data);
        }

        cartItemCountElement.innerHTML = cart.size();


        var productId = data.productId;
        var stockCount = data.stockCount;
        var productInfo = cart.getByProductId(productId);

        var onButtonTimeout = function () {
            target.classList.remove('disabled');
            target.classList.add('neon-btn');

            target.innerHTML = "" +
                'В корзину <img src="/img/arrow.svg" alt="arrow" />' +
                '<span class="neon-btn__decorate neon-btn__decorate--one" aria-hidden="true"></span>' +
                '<span class="neon-btn__decorate neon-btn__decorate--two" aria-hidden="true"></span>' +
                '<span class="neon-btn__decorate neon-btn__decorate--three" aria-hidden="true"></span>' +
                '<span class="neon-btn__decorate neon-btn__decorate--four" aria-hidden="true"></span>';

            target.blur();
        };

        if (productInfo !== null) {
            var productAmount = productInfo.amount;

            if (productAmount >= stockCount) {
                onButtonTimeout = function() {
                    target.innerText = 'Недостаточно товара на складе';
                }
            }
        } 

        target.innerText = 'Товар добавлен';
        target.classList.add('disabled');
        target.classList.remove('neon-btn');

        setTimeout(onButtonTimeout, 2000);

    };
});

// 5-63-153-158.cloudvps.regruhosting.ru:32349
// localhost:3000