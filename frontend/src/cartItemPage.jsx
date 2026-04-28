// const addToCart = async (product_id, quantity = 1) => {
//   const token = localStorage.getItem("token");

//   // пользователь НЕ авторизован
//   if (!token) {
//     let cart = JSON.parse(localStorage.getItem("cart")) || [];

//     const existingProduct = cart.find(
//       item => item.product_id === product_id
//     );

//     if (existingProduct) {
//       existingProduct.quantity += quantity;
//     } else {
//       cart.push({ product_id, quantity });
//     }

//     localStorage.setItem("cart", JSON.stringify(cart));

//     alert("Товар добавлен в корзину (локально)");
//     return;
//   }

//   // пользователь авторизован
//   try {
//     await fetch("http://localhost:5000/cart/add", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`
//       },
//       body: JSON.stringify({
//         product_id,
//         quantity
//       })
//     });

//     alert("Товар добавлен в корзину");
//   } catch (error) {
//     console.error(error);
//   }
// };