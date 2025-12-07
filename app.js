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
        .filter(lesson => lesson.subject.toLowerCase().includes(this.searchQuery.toLowerCase()))
        .sort((a,b)=>{
          let modifier = this.sortOrder === "asc" ? 1 : -1;
          if (typeof a[this.sortBy] === "string") return a[this.sortBy].localeCompare(b[this.sortBy]) * modifier;
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
    addToCart(lesson){
      if(lesson.spaces>0){
        lesson.spaces--;
        const item = this.cart.find(i=>i.book.id===lesson.id);
        if(item) item.qty++;
        else this.cart.push({book: lesson, qty:1});
      }
    },
    increaseQty(id){
      const item = this.cart.find(i=>i.book.id===id);
      if(item && item.book.spaces>0){
        item.qty++;
        item.book.spaces--;
      }
    },
    decreaseQty(id){
      const item = this.cart.find(i=>i.book.id===id);
      if(item && item.qty>0){
        item.qty--;
        item.book.spaces++;
        if(item.qty===0) this.removeFromCart(id);
      }
    },
    removeFromCart(id){
      const index = this.cart.findIndex(i=>i.book.id===id);
      if(index>-1){
        const item = this.cart[index];
        item.book.spaces += item.qty;
        this.cart.splice(index,1);
      }
    },
    checkoutForm(){
      if(!this.customer.name || !this.customer.phone){
        alert("Please enter name and phone number");
        return;
      }
      alert(`Thanks ${this.customer.name}, total $${this.cartTotal.toFixed(2)}!`);
      this.cart.forEach(item=>item.book.spaces += item.qty);
      this.cart = [];
      this.customer = {name:'', phone:''};
      this.showCart=false;
    }
  }
});
