// Controls Budget
var budgetController = (function(){
  // function Constructors
  var Expense = function(id, description, value){
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  }

  Expense.prototype.calcPercentage = function(totalIncome){

    if(totalIncome > 0){
      this.percentage = Math.round((this.value / totalIncome) * 100) + '%';
    }
    else{
      this.percentage = -1;
    }
  }

  Expense.prototype.getPercentage = function(){
    return this.percentage;
  }


  var Income  = function(id, description, value){
    this.id = id;
    this.description = description;
    this.value = value;
  }


  var calculateTotal = function(type){

    var sum = 0;
    data.allItems[type].forEach(function(curr){
      sum += curr.value;
    })
    data.totals[type] = sum;

  }


  var data = {
    allItems: {
      exp: [],
      inc: []
    },
    totals: {
      exp: 0,
      inc: 0
    },
    budget: 0,
    percentage: -1
  };


  return {
    add: function(type, des, val) {

      var newItem, ID;

      //Create new id
      if(data.allItems[type].length > 0){
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      }
      else {
        ID = 0;
      }

      //create a new item based on the type
      if(type === 'exp'){
        newItem = new Expense(ID, des, val);
      }
      else if(type === 'inc'){
        newItem = new Income(ID, des, val);
      }

      //add new item to the type array
      data.allItems[type].push(newItem);

      //return the new item
      return newItem;
    },



    delete: function(type, id){

      var ids, index;

      ids = data.allItems[type].map(function(current){   // Created a copy containing all ids
        return current.id;
      })
      console.log(ids);
      index = ids.indexOf(id);

      if(index !== -1){    // indexof returns -1 if no such id found
        data.allItems[type].splice(index, 1);
      }

    },


    testing: function(){
      console.log(data);
    },



    calculateBudget: function(){

      // 1. Calculate total incomes and expenses
      calculateTotal('inc');
      calculateTotal('exp');

      // 2. calculate budget income - expense
      data.budget = data.totals['inc'] - data.totals['exp'];

      // 3. calculate the percentage of income that is spent
      if(data.totals.inc > 0){
          data.percentage = Math.round((data.totals['exp'] / data.totals['inc']) * 100);
      }
      else {
        data.percentage = -1;
      }


    },



    calculatePercentages: function(){

      data.allItems['exp'].forEach(function(cur){

          cur.calcPercentage(data.totals.inc);

      })
    },


    getPercntages: function(){

      var allPerc;

      allPerc = data.allItems['exp'].map(function(curr){
        return curr.getPercentage();
      })
      return allPerc;

    },


    returnBudget: function(){
      return{
        budget: data.budget,
        percentage: data.percentage,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp
      }

    }
  }


})();

/**********************************************************************************************/
/***********************************************************************************************
************************************************************************************************
***********************************************************************************************/


// Controls UI
var UIController = (function(){

  var DOMstrings = {      // private
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    inputButton: '.add__btn',
    incomeContainer: '.income__list',
    expenseContainer: '.expenses__list',
    budgetLabel: '.budget__value',
    incomeLabel: '.budget__income--value',
    expenseLabel: '.budget__expenses--value',
    percentageLabel: '.budget__expenses--percentage',
    container: '.container',
    expensePercLabel: '.item__percentage',
    dateLabel: '.budget__title--month'
  }


  var formatNumber = function(num, type){

    var numSplit, int, dec, sign;

    num = Math.abs(num);
    num = num.toFixed(2);

    numSplit = num.split('.');

    int = numSplit[0];
    if(int.length > 3){
      int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
    }

    dec = numSplit[1];

    return (type === 'inc' ? '+' : '-') + ' ' + int + '.' + dec;

  }


  var nodeListForEach = function(list, callback){
    for(var i = 0; i < list.length; i++){
      callback(list[i], i);
    }
  }


  return {            // public
    getInput: function(){
      return{
        type: document.querySelector(DOMstrings.inputType).value, //inc or exp
        description: document.querySelector(DOMstrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
      }
    },

    getDOMstrings: function(){ //public
      return DOMstrings;
    },

    addListItem: function(obj, type){

      var html, element;
      // Create html string with placeholder text

      if(type === 'inc'){

        element = DOMstrings.incomeContainer;
        html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
      }
      else if(type === 'exp'){

        element = DOMstrings.expenseContainer;
        html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
      }

      // Replace placeholder text with actual data
      newHtml = html.replace('%id%', obj.id);
      newHtml = newHtml.replace('%description%', obj.description);
      newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

      // Insert the html into the DOM

        document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

      },


      deleteListItem: function(selectorId){

        var el;

        el = document.getElementById(selectorId);

        el.parentNode.removeChild(el);

      },


      clearFields: function(){

        var fields, fieldsArr;

        fields = document.querySelectorAll(DOMstrings.inputDescription + ',' + DOMstrings.inputValue);
        fieldsArr = Array.prototype.slice.call(fields);
        fieldsArr.forEach(function(current, index, array){
          current.value = "";
        });

        fieldsArr[0].focus();


      },


      displayBudget: function(obj){

        var type;

        obj.budget > 0 ? type = 'inc' : type = 'exp';

        document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
        document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
        document.querySelector(DOMstrings.expenseLabel).textContent = formatNumber(obj.totalExp, 'exp');

        if(obj.percentage > 0){
          document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
        }
        else{
          document.querySelector(DOMstrings.percentageLabel).textContent = '---';
        }

      },


      displayPercentages: function(percentages){

        var fields;

        fields = document.querySelectorAll(DOMstrings.expensePercLabel);


        nodeListForEach(fields, function(current, index){
          if(percentages[index] > '0')
          {
            current.textContent = percentages[index];
          }
          else{
            current.textContent = '---';
          }
        })
      },

      displayMonth: function(){

        var now, year, month, months;

        months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

        now = new Date();

        year = now.getFullYear();

        month = now.getUTCMonth();

        document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;

      },


      changedType: function(){

        var fields;

        fields = document.querySelectorAll(DOMstrings.inputType + ',' + DOMstrings.inputDescription + ',' + DOMstrings.inputValue);

        nodeListForEach(fields, function(cur){

          cur.classList.toggle ('red-focus');

        })

        document.querySelector(DOMstrings.inputButton).classList.toggle('red');

      }

    }

})();


/***************************************************************************************************/
/****************************************************************************************************
*****************************************************************************************************
****************************************************************************************************/

//Global App Controller
var controller = (function(budgetCtrl, UICtrl){

  var setUpEventListeners = function(){

    var DOM = UICtrl.getDOMstrings();

    document.querySelector(DOM.inputButton).addEventListener('click', addItem);

    document.addEventListener('keypress', function(event){
      if(event.keycode === 13 || event.which === 13){
        addItem();
      }
    });

    document.querySelector(DOM.container).addEventListener('click', deleteItem);

    document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);

  };

  var addItem = function(){

    var input, newItem;

    // Get the input data
    input = UICtrl.getInput();
    console.log(input);

    if(input.description !== "" && !isNaN(input.value) && input.value > 0) {

      // Add items to the budget controller
      newItem = budgetCtrl.add(input.type, input.description, input.value);

      // Add items to the UI
      UICtrl.addListItem(newItem, input.type);
      UICtrl.clearFields();

      // Calculate and Update Budget
      updateBudget();

      // Update the Percentages
      updatePercentages();


    }
  }


  var deleteItem = function(event){

    var itemId, splitId, type, id;

    itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;

    if(itemId){
      splitId = itemId.split('-');
      type = splitId[0];
      id = parseInt(splitId[1]);

      // 1. Delete the item from the data structure
      budgetCtrl.delete(type, id);

      // 2. Delete the item from the UI
      UICtrl.deleteListItem(itemId);

      // 3. Update and show the new budget
      updateBudget();

      // 4. Update percentages
      updatePercentages();



    }
  }




  var updateBudget = function() {

    var budget;
    // Calculate the budget
    budgetCtrl.calculateBudget();

    // return the budget
    budget = budgetCtrl.returnBudget();

    // Display Budget in UI
    UICtrl.displayBudget(budget);


  }


  var updatePercentages = function(){

    var percentages;
    // 1. Calculate percentages
    budgetCtrl.calculatePercentages();

    // 2. Read percentages from the budgetController
    percentages = budgetCtrl.getPercntages();

    // 3. Update the UI with new percentages
    UICtrl.displayPercentages(percentages);


  }


  return{
    init: function(){

      console.log("Application has Started.");
      UICtrl.displayMonth();


      UICtrl.displayBudget({

          budget: 0,
          percentage: -1,
          totalInc: 0,
          totalExp: 0

      })

      setUpEventListeners();

    }
  }


})(budgetController, UIController);


controller.init();
