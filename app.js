new Vue({
  el: '#app',
  data: {
     lessons: [
      { id: 1, subject: "UX Design", location: "Hendon", price: 120, spaces: 5 },
      { id: 2, subject: "Data Analysis", location: "Colindale", price: 150, spaces: 5 },
      { id: 3, subject: "Creative Writing", location: "Brent Cross", price: 90, spaces: 5 },
      { id: 4, subject: "Art & Craft", location: "Golders Green", price: 100, spaces: 5 },
      { id: 5, subject: "Music Theory", location: "Finchley", price: 95, spaces: 5 },
      { id: 6, subject: "Photography Basics", location: "Camden", price: 110, spaces: 5 },
      { id: 7, subject: "Web Development", location: "Hackney", price: 200, spaces: 5 },
      { id: 8, subject: "Robotics Intro", location: "Islington", price: 180, spaces: 5 },
      { id: 9, subject: "Film Making", location: "Soho", price: 160, spaces: 5 },
      { id: 10, subject: "Graphic Design", location: "Shoreditch", price: 130, spaces: 5 },
      { id: 11, subject: "Mindfulness & Yoga", location: "Clapham", price: 100, spaces: 5 },
      { id: 12, subject: "Entrepreneurship", location: "Hackney", price: 250, spaces: 5 }
    ],
    sortBy: "subject",
    sortOrder: "asc",
    cart: [],
    showCart: false,
    customer: { name: '', phone: '' },
    searchQuery: ''
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
