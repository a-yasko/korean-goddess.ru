function CustomerCart() {
  var LOCAL_STORAGE_KEY = "KoreanGoddessCart";
  var TOTAL_THRESHOLD = 5000;

  var fetchState = function() {
      if (typeof(window.localStorage) == 'undefined') {
          console.error("failed to access localstorage");
          return;
      }

      var serializedState = localStorage.getItem(LOCAL_STORAGE_KEY);

      if (serializedState) {
          try {
              return JSON.parse(serializedState);
          }
          catch (err) {
              console.warn("could not deserialize localstorage state");
              return [];
          }
      }

      return [];
  }

  var setState = function(nextState) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(nextState));
      state = fetchState();
      total = calculateTotal();         
  }

  var isDiscountEnabled = function() {
      var originalTotal = state.reduce(function(acc, item) {
        return acc + item.amount * item.data.price;
      }, 0); 
 
      return originalTotal > TOTAL_THRESHOLD;
  }

  var calculateTotal = function() {
      var originalTotal = state.reduce(function(acc, item) {
        return acc + item.amount * item.data.price;
      }, 0);

      if (originalTotal > TOTAL_THRESHOLD) {
          return state.reduce(function(acc, item) {
            return acc + item.amount * item.data.priceopt;
          }, 0);
      }
      else {
          return originalTotal;
      }
  }


  var state = fetchState();
  var total = calculateTotal();


  
  this.size = function() {
      return state.reduce(function(acc, item) {
          return acc + (item.amount || 1);
      }, 0);
  }

  this.list = function() {
      return JSON.parse(JSON.stringify(state));
  }

  this.add = function(product) {
      var id = this.size();
      var nextState = state.concat([{ key: id, amount: 1, data: product }]);
      setState(nextState);
  }

  this.incrementAmount = function(key) {
    var nextState = state.map(function(item) {
        if (item.key == key) {
            return { key: item.key, amount: item.amount + 1, data: item.data }
        }
        else {
            return item;
        }
    });    
    setState(nextState);
  }

  this.decrementAmount = function(key) {
    var nextState = state.map(function(item) {
        if (item.key == key) {
            return { key: item.key, amount: item.amount > 1 ? item.amount - 1 : 1, data: item.data }
        }
        else {
            return item;
        }
    });    
    setState(nextState);
  }

  this.discountEnabled = function() {
      return isDiscountEnabled();
  }

  this.total = function() {
      return total;
  }

  this.remove = function(key) {
      var nextState = state.filter(function(item) {
          return item.key != key;
      });

      setState(nextState);
  }

  this.reset = function() {
    setState([]);
  },

  this.get = function(key) {
      for(var i = 0; i < state.length; i++) {
          if (state[i].key == key) {
              return state[i];
          }
      }
      return null;
  }

  this.getByProductId = function(productId) {
    for(var i = 0; i < state.length; i++) {
        if (state[i].data &&  state[i].data.productId == productId) {
            return state[i];
        }
    }
    return null;
  }

}