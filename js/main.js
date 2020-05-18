const cartButton = document.querySelector('#cart-button');
const modal = document.querySelector('.modal');
const close = document.querySelector('.close');
const buttonAuth = document.querySelector('.button-auth');
const modalAuth = document.querySelector('.modal-auth');
const closeAuth = document.querySelector('.close-auth');
const logInForm = document.querySelector('#logInForm');
const loginInput = document.querySelector('#login');
const userName = document.querySelector('.user-name');
const buttonOut = document.querySelector('.button-out');
const cardsRestaurants = document.querySelector('.cards-restaurants');
const containerPromo = document.querySelector('.container-promo');
const restaurants = document.querySelector('.restaurants');
const menu = document.querySelector('.menu');
const buttonLogin = document.querySelector('.button-login');
const logo = document.querySelector('.logo');
const cardsMenu = document.querySelector('.cards-menu');
const restaurantTitleHead = document.querySelector('.restaurant-title');
const ratingHead = document.querySelector('.rating');
const priceHead = document.querySelector('.price');
const categoryHead = document.querySelector('.category');
const inputSearch = document.querySelector('.input-search');
const modalBody = document.querySelector('.modal-body');
const modalPrice = document.querySelector('.modal-pricetag');
const buttonClearCart = document.querySelector('.clear-cart');
let login = localStorage.getItem('gloDelivery');

const cart = [];

const loadCart = () => {
  if (localStorage.getItem(login)) {
        cart.push(...JSON.parse(localStorage.getItem(login)));
  }
}

const saveCart = () => {
  localStorage.setItem(login, JSON.stringify(cart));
}

const getData = async function(url) {

  const response = await window.fetch(url);

  if (!response.ok) {
    throw  new Error(`Ошибка по адресу ${url}, 
    статус ошибки ${response.status}!`)
  }
  return await response.json();
};

const valid = function(str) {
  const nameReg = /^[a-zA-Z][a-zA-Z0-9-_\.]{1,20}$/;
  return nameReg.test(str);
}

const toggleModal = () => {
  modal.classList.toggle('is-open');
}

const  toggleModalAuth = () => {
  modalAuth.classList.toggle('is-open');
  loginInput.style.borderColor = '';
}

const prevHome = () => {
  containerPromo.classList.remove('hide');
  restaurants.classList.remove('hide');
  menu.classList.add('hide');
}

const autorized = () => {
  console.log('Авторизован');

  const logOut = () =>{
    login = null;
    cart.length = 0;
    localStorage.removeItem('gloDelivery');
    buttonAuth.style.display = '';
    userName.style.display = '';
    buttonOut.style.display = '';
    cartButton.style.display = '';
    buttonOut.removeEventListener('click', logOut);

    checkAuth();
    prevHome();
  }

  userName.textContent = login;
  cartButton.style.display = 'flex'
  buttonAuth.style.display = 'none';
  userName.style.display = 'inline';
  buttonOut.style.display = 'flex';
  buttonOut.addEventListener('click', logOut);
  loadCart();
}

const notAutorized = () => {
  console.log('Не авторизован');

  const logIn = (event) => {
    event.preventDefault();
    console.log('Логин');
    if (valid(loginInput.value.trim())) {
      login = loginInput.value;
      localStorage.setItem('gloDelivery', login);
      toggleModalAuth();
      buttonAuth.removeEventListener('click', toggleModalAuth);
      closeAuth.removeEventListener('click', toggleModalAuth);
      logInForm.removeEventListener('submit', logIn);
      logInForm.reset();
      checkAuth();

    } else {
      loginInput.style.borderColor = 'tomato';
      loginInput.value = '';
    }

  }

  buttonAuth.addEventListener('click', toggleModalAuth);
  closeAuth.addEventListener('click', toggleModalAuth);
  logInForm.addEventListener('submit', logIn);
}

const checkAuth = () => login ? autorized() : notAutorized();

const createCardRestaurant = (restaurant) => {

  const {image,
    price,
    name,
    stars,
    kitchen,
    products,
    time_of_delivery: timeOfDelivery
  } = restaurant;

  const card = document.createElement('a');
  card.className = 'card card-restaurant';
  card.products = products;
  card.info = [name, price, stars, kitchen];
  card.insertAdjacentHTML('beforeend', `
  <img src="${image}" alt="${name}" class="card-image"/>
    <div class="card-text">
    <div class="card-heading">
      <h3 class="card-title">${name}</h3>
      <span class="card-tag tag">${timeOfDelivery} мин</span>
    </div>
    <div class="card-info">
      <div class="rating">${stars}</div>
      <div class="price">От ${price} ₽</div>
      <div class="category">${kitchen}</div>
    </div>
    </div>
  `);

  cardsRestaurants.insertAdjacentElement('beforeend', card);
}

const createCardGood = (goods) => {
  console.log(goods);
  const { id,
          name,
          description,
          price,
          image
        } = goods;
  const card = document.createElement('div');
  card.className = 'card';

  card.insertAdjacentHTML( 'beforeend', `
      <img src="${image}" alt="${name}" class="card-image"/>
      <div class="card-text">
          <div class="card-heading">
              <h3 class="card-title card-title-reg">${name}</h3>
          </div>
          <div class="card-info">
              <div class="ingredients">${description}</div>
          </div>
          <div class="card-buttons">
              <button class="button button-primary button-add-cart" id="${id}">
                  <span class="button-card-text">В корзину</span>
                  <span class="button-cart-svg"></span>
              </button>
              <strong class="card-price-bold card-price">${price} ₽</strong>
          </div>
      <div>
      `);

      cardsMenu.insertAdjacentElement('beforeend', card);
}

const openGoods = (event) => {
    event.preventDefault();
    const target = event.target;


      const restaurant = target.closest('.card-restaurant');

      if (restaurant) {
        if (login) {
          const [ name, price, stars, kitchen ] = restaurant.info;

        cardsMenu.textContent = '';
        containerPromo.classList.add('hide');
        restaurants.classList.add('hide');
        menu.classList.remove('hide');

        restaurantTitleHead.textContent = name;
        priceHead.textContent = 'От ' + price + ' ₽';
        priceHead.classList.add('price');
        ratingHead.textContent = stars;
        categoryHead.textContent = kitchen;

          getData(`./db/${restaurant.products}`).then(function (data) {
          data.forEach(createCardGood)
        });
       } else {
         toggleModalAuth();
       }
    }
}

const filterSearch = (event) => {
    if (event.keyCode ===13) {
      const target = event.target;
      const value = target.value.toLowerCase().trim();

      target.value = '';

      if (!value || value.length< 3) {
        target.style.outlineColor = 'tomato';
        setTimeout(function () {
          target.style.outlineColor = '';

        }, 2000);
        return;
      }
      const goods = [];
      getData('./db/partners.json')
          .then(function (data) {
            const products = data.map(item=> item.products);
            products.forEach(product=> {
              getData(`./db/${product}`)
                  .then(function ( data) {
                    goods.push(...data);

                    const searchGoods = goods.filter(function (item) {
                      return item.name.toLowerCase().includes(value);
                    })
                    cardsMenu.textContent = '';
                    containerPromo.classList.add('hide');
                    restaurants.classList.add('hide');
                    menu.classList.remove('hide');

                    restaurantTitleHead.textContent = 'Результат поиска';
                    priceHead.textContent = '';
                    priceHead.classList.remove('price');
                    ratingHead.textContent = '';
                    categoryHead.textContent = '';
                    return searchGoods;
                  }).then(function (data) {
                data.forEach(createCardGood);

                if (!data.forEach(createCardGood)) {
                  restaurantTitleHead.textContent = 'По вашему запросу ничего не найдено';
                }
              })
            });
          });
    }
}

const addToCart = (event) => {
  const target = event.target;
  const btnAddToCart = target.closest('.button-add-cart');

  if (btnAddToCart) {
    const card = target.closest('.card');
    const title = card.querySelector('.card-title-reg').textContent;
    const cost = card.querySelector('.card-price').textContent;
    const id = btnAddToCart.id;
    const food = cart.find(item => item.id === id)
    if (food) {
      food.count += 1;
    } else {
      cart.push({
        id,
        title,
        cost,
        count: 1
      });
    }
  }
saveCart();
}

const renderCart = () => {
  modalBody.textContent = '';

  cart.forEach(function ({id, title, cost, count}) {
    const itemCart = `
    <div class="food-row">
      <span class="food-name">${title}</span>
      <strong class="food-price">${cost}</strong>
      <div class="food-counter">
        <button class="counter-button counter-minus" data-id="${id}">-</button>
        <span class="counter">${count}</span>
        <button class="counter-button counter-plus" data-id="${id}">+</button>
      </div>
    </div>
    `;

    modalBody.insertAdjacentHTML('beforeend', itemCart);
  });
  const totalPrice = cart.reduce(function (result, item) {
    return result + (parseFloat(item.cost) * item.count);
  }, 0);
  modalPrice.textContent = totalPrice + ' ₽';
}

const changeCount = (event) => {
  const target = event.target;

  if (target.classList.contains('counter-button')); {
    const food = cart.find(item => item.id === target.dataset.id);
    if (target.classList.contains('counter-minus')) {
      food.count--;
      if (food.count === 0) {
        cart.splice(cart.indexOf(food), 1)
      }
    }
    if (target.classList.contains('counter-plus'))
      food.count++;
    renderCart();
  }
  saveCart();
}

const init = () => {
  getData('./db/partners.json').then(data=>
    data.forEach(createCardRestaurant)
  );

  console.log(getData);
  checkAuth();

  logo.addEventListener('click', prevHome)
  cardsRestaurants.addEventListener('click', openGoods);
  cartButton.addEventListener('click', renderCart);
  cartButton.addEventListener('click', toggleModal);

  buttonClearCart.addEventListener('click', function () {
    cart.length = 0;
    renderCart();
    saveCart();
  });

  modalBody.addEventListener('click', changeCount)
  cardsMenu.addEventListener('click', addToCart);
  close.addEventListener('click', toggleModal);
  inputSearch.addEventListener('keydown', filterSearch);

  new Swiper('.swiper-container', {
    loop: true,
    autoplay: {
      delay: 5000
    }
  });
}

init();
