let db;

const request = indexedDB.open('budget_tool', 1)

request.onupgradeneeded = function(event) {
    // save a reference to the database 
    const db = event.target.result;
    // create an object store (table) called `new_pizza`, set it to have an auto incrementing primary key of sorts 
    db.createObjectStore('new_budget', { autoIncrement: true });
  };

  // upon a successful 
request.onsuccess = function(event) {
    db = event.target.result;
  
    if (navigator.onLine) {
      // function goes here
      updateBudget(); 
    }
  };
  
  request.onerror = function(event) {
    // log error here
    console.log(event.target.errorCode);
  };


  //attempts to submit transaction if no internet connection
  function saveTransaction(saved){
    //new transaction with database if 
    const transaction = db.transaction(['new_budget'], 'readwrite');
    const transactionObjStore = transaction.objectStore('new_budget');

    transactionObjStore.add(saved)
  };

  function updateBudget(){
    const transaction = db.transaction(['new_budget'], 'readwrite');
    const transactionObjStore = transaction.objectStore('new_budget');
    const getAll = transactionObjStore.getAll();

    getAll.onsuccess = function(){
        if(getAll.result.length > 0){
            fetch('/api/transaction',{
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers:{
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(ServerResponse => {
                if(ServerResponse.message){
                    throw new Error(ServerResponse);
                }
                const transaction = db.transaction(['new_budget'], 'readwrite');
                const transactionObjStore = transaction.objectStore('new_budget');

                transactionObjStore.clear();
                alert('Budget Has Been Updated!');
            })
            .catch(err => {
                console.log(err);
            });
        }
    };
  }

  window.addEventListener('online', updateBudget);