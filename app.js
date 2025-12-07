var apiUrl = "http://localhost:3000";

new Vue({
  el: '#app',
  data: {
    lessons: [],
    sortBy: "subject",
    sortOrder: "asc",
    cart: [],
    showCart: false,
    customer: { name: '', phone: '' },
    searchQuery: '',
    canCheckout: false
  },
  created() {
    this.loadLessons();
  },
  watch: {
    'customer.name': function() {
      this.validateCheckout();
    },
    'customer.phone': function() {
      this.validateCheckout();
    }
  },
  computed: {
    filteredLessons() {
      return this.lessons
        .sort((a,b)=>{
          let modifier = this.sortOrder === "asc" ? 1 : -1;
          if (typeof a[this.sortBy] === "string") {
            return a[this.sortBy].localeCompare(b[this.sortBy]) * modifier;
          }
          return (a[this.sortBy] - b[this.sortBy]) * modifier;
        });
    },
    cartTotal() {
      return this.cart.reduce((sum,item)=>sum + item.book.price * item.qty,0);
    },
    cartTotalQty() {
      return this.cart.reduce((sum,item)=>sum + item.qty,0);
    }
  },
  methods: {
    
    loadLessons() {
      fetch(apiUrl + "/lessons")
        .then(response => response.json())
        .then(res => {
          this.lessons = res.map(lesson => ({
            ...lesson,
            id: lesson._id || lesson.id
          }));
          console.log('Lessons loaded:', this.lessons.length);
        })
        .catch(error => {
          console.log('Error loading lessons:', error);
        });
    },
   
    doSearch() {
      var query = this.searchQuery.trim();
      if (query.length >= 1) {
        fetch(apiUrl + "/search?query=" + encodeURIComponent(query))
          .then(response => response.json())
          .then(res => {
            this.lessons = res.map(lesson => ({
              ...lesson,
              id: lesson._id || lesson.id
            }));
            console.log('Search results:', this.lessons.length);
          })
          .catch(error => {
            console.log('Error searching:', error);
          });
      } else {
        this.loadLessons();
      }
    },
    addToCart(lesson){
      if(lesson.spaces > 0){
        lesson.spaces--;
        const item = this.cart.find(i=>i.book.id===lesson.id);
        if(item) {
          item.qty++;
        } else {
          this.cart.push({book: lesson, qty:1});
        }
      }
    },
    increaseQty(id){
      const item = this.cart.find(i=>i.book.id===id);
      if(item && item.book.spaces > 0){
        item.qty++;
        item.book.spaces--;
      }
    },
    decreaseQty(id){
      const item = this.cart.find(i=>i.book.id===id);
      if(item && item.qty > 0){
        item.qty--;
        item.book.spaces++;
        if(item.qty === 0) {
          this.removeFromCart(id);
        }
      }
    },
    removeFromCart(id){
      const index = this.cart.findIndex(i=>i.book.id===id);
      if(index > -1){
        const item = this.cart[index];
        item.book.spaces += item.qty;
        this.cart.splice(index,1);
      }
    },
   
    validateCheckout() {
      var nameRegex = /^[A-Za-z\s]+$/;
      var phoneRegex = /^[0-9]+$/;
      
     
      if (this.customer.name.trim() === '' || this.customer.phone.trim() === '') {
        this.canCheckout = false;
        return false;
      }
      
      
      if (!nameRegex.test(this.customer.name.trim())) {
        this.canCheckout = false;
        return false;
      }
      
      
      if (!phoneRegex.test(this.customer.phone.trim())) {
        this.canCheckout = false;
        return false;
      }
      
      
      this.canCheckout = true;
      return true;
    },
   
    getIconClass(lesson) {
     
      if (lesson.icon) {
        return lesson.icon;
      }
      
      
      return 'fa-solid fa-graduation-cap';
    },
   
    checkoutForm(){
      if (!this.validateCheckout()) {
        alert("Please enter valid name (letters only) and phone (numbers only)");
        return;
      }
      
      if (this.cart.length === 0) {
        alert("Your cart is empty");
        return;
      }
      
     
      var orderData = {
        name: this.customer.name,
        phone: this.customer.phone,
        lessonIDs: this.cart.map(item => ({
          id: item.book.id,
          spaces: item.qty
        }))
      };
      
     
      fetch(apiUrl + "/order", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      })
      .then(response => response.json())
      .then(res => {
        console.log('Order created:', res);
        
       
        var updates = this.lessons.map(lesson => ({
          id: lesson.id || lesson._id,
          update: { spaces: lesson.spaces }
        }));
        
      
        return fetch(apiUrl + "/lessons", {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates)
        });
      })
      .then(response => response.json())
      .then(res => {
        console.log('Lessons updated:', res);
        
        
        alert(`Thanks ${this.customer.name}, your order has been submitted successfully! Total: $${this.cartTotal.toFixed(2)}`);
        
      
        this.cart = [];
        this.customer = {name:'', phone:''};
        this.canCheckout = false;
        this.showCart = false;
        
        
        this.loadLessons();
      })
      .catch(error => {
        console.log('Error:', error);
        alert('Error submitting order. Please try again.');
      });
    }
  }
});
