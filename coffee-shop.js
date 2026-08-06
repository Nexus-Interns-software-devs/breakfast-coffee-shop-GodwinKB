const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

// 1. TODO: Define your menu object here


// 2. TODO: Define your calculateTotal function here


// The Ordering System
readline.question("☕ Welcome! What would you like to order? ", (drinkInput) => {
  
  readline.question("🔢 How many would you like? ", (qtyInput) => {
    
    // 3. TODO: Process the inputs (clean strings, convert numbers)
    
    // 4. TODO: Write your If/Else logic to validate the order
    
    // 5. TODO: Print the final receipt
    
    // Always remember to close readline!
    readline.close();
  });
});
