# ☕ Breakfast Exercise: The Bootcamp Coffee Shop

**Time Limit:** 60 Minutes  
**Prerequisites:** Variables, If/Else, Functions, Objects, Node.js `readline`

## 🎯 Objective
You have just been hired as the lead developer for a new hipster coffee shop. They need a terminal-based ordering system. Your task is to write a Node.js script that asks the customer what they want to drink, how many cups they want, and then calculates their total bill using a Menu object.

## 🛠️ The Requirements (Hardened Rules)

Your program must satisfy the following criteria to pass:

1. **The Menu Object:** You must create an object called `menu` that stores at least 3 drinks and their prices. 
   *(Example: Espresso = ₦3000, Latte = ₦4500, Tea = ₦2000)*
2. **Two Inputs:** Use `readline` to ask the user two questions:
   - *"What would you like to order?"*
   - *"How many would you like?"*
3. **The Calculator Function:** Create a separate function called `calculateTotal(drinkName, quantity)` that accesses the menu object and returns the final price.
4. **Handle Missing Items (Validation 1):** If the user orders a drink that is NOT on your menu (e.g., "Fanta"), your program must politely tell them it is unavailable instead of crashing or returning `undefined`.
5. **Handle Invalid Numbers (Validation 2):** If the user types "five" instead of "5", or types a negative number like "-2", your program must detect this and show an error message.
6. **Case Insensitivity:** If your menu says `"latte"`, your program must still work if the user types `"Latte"`, `"LATTE"`, or even `" latte "`.

---

## 💡 Hints & Loopholes to Watch Out For

> [!WARNING]
> **The `NaN` Trap!**
> Remember from Demo 2: User input is ALWAYS a string. If the user types `"3"`, `qtyInput` is the text `"3"`. What happens if you try to multiply `"3" * 4500`? What happens if you try to add to it? **Hint:** You need `parseInt()`.

> [!TIP]
> **Cleaning Strings**
> Users make typos. If they type `"  Latte  "`, you can clean it up using `.trim()` to remove spaces, and `.toLowerCase()` to make it lowercase so it matches your menu object exactly.

> [!IMPORTANT]
> **How do you check if a number is valid?**
> If you run `parseInt("apples")`, JavaScript returns `NaN` (Not a Number). You can check for this using the built-in `isNaN(yourVariable)` function. Don't forget to check if the quantity is greater than zero, too! (Nobody can order -5 coffees).

## 🚀 Stretch Goal (Room for Creativity)
Finished early? Try adding an **"Order Summary Array"**. Instead of closing the app immediately, wrap the logic in a recursive function so the user can keep ordering different drinks, pushing each order into an array. When they type "checkout", loop through the array, print a full receipt, and show the grand total!
