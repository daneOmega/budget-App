var budgetController =(function(){
    var Income = function(id,value,description) {
      this.id = id;
      this.value = value;
      this.description = description;
    };
    var Expense = function(id,value,description,percentage) {
      this.id = id;
      this.value = value;
      this.description = description;
      this.percentage = percentage;
    };
    Expense.prototype.calcPercentage = function(totalIncome) {
          if(totalIncome > 0){
              this.percentage = Math.round((this.value/totalIncome)*100)
          } else {
              this.percentage = -1;
          }
    };

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    }
    var getSum = function(type) {
        var total;
        total = 0;
        data.allItems[type].forEach(function(cur){
           total +=cur.value 
        });
        data.totals[type] = total;
    }
    var data = {
        allItems:{
            inc:[],
            exp:[]
        },
        totals:{
            inc:0,
            exp:0
        },
        budget:0,
        percentage:-1
    }
    return {
        addItems:function(type,val,desc) {
            var ID,newItem;
            if(data.allItems[type].length>0){
                ID= data.allItems[type][data.allItems[type].length -1].id+1;
            } else {
                ID = 0;
            }
            if (type === "inc") {
                newItem = new Income(ID,val,desc);
            } else if (type === "exp") {
                newItem = new Expense(ID,val,desc);
            }
            data.allItems[type].push(newItem);
            return newItem;    
        },
        deleteItems:function(type,ID){
            var ids,index;
            ids = data.allItems[type].map(function(cur){
               return cur.id 
            });
            index = ids.indexOf(ID);
            if(index !==-1){
            data.allItems[type].splice(index,1);
            }
        },
        addBudget:function(){
            getSum("inc");
            getSum("exp");
            data.budget = data.totals.inc - data.totals.exp;
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp/data.totals.inc)*100)
            } else {
                data.percentage = -1;
            }
        },
        calcPercentage:function(){
            data.allItems.exp.forEach(function(cur){
                cur.calcPercentage(data.totals.inc);
            });
            
        },
        getPercentage:function(){
            var Percentage;
           Percentage = data.allItems.exp.map(function(cur){
                return cur.getPercentage();
            });
            return Percentage;
          
        },
        getBudget:function(){
         return {
             inc:data.totals.inc,
             exp:data.totals.exp,
             bdgt:data.budget,
             pct:data.percentage
         }    
        }
    }
})();

var uiController =(function(){
    var domStrings;
    domStrings = {
        type:".add__type",
        val:".add__value",
        desc:".add__description",
        btn:".add__btn",
        inc:".income__list",
        exp:".expenses__list",
        incLabel:".budget__income--value",
        expLabel:".budget__expenses--value",
        bdgtLabel:".budget__value",
        pctLabel:".budget__expenses--percentage",
        container:".container",
        percentage:".item__percentage",
        Date:".budget__title--month"
        
    }
    var formatNumber = function(num,type) {
        var split,int,dec;
        num = Math.abs(num);
        num = num.toFixed(2);
        split = num.split(".");
        int = split[0];
        dec = split[1];
        if(int.length > 3) {
            int = int.substr(0,int.length-3)+","+int.substr(int.length-3,3);
        }
       return (type==="exp"?"- ":"+ ") + int +"."+dec  
        
    }
    var nodeListForEach = function(list,callBack){
        for (var i =0;i < list.length;i++) {
             callBack(list[i],i)
                }
            };
    return {
        getInput:function(){
            return {
                type:document.querySelector(domStrings.type).value,
                val:Number(document.querySelector(domStrings.val).value),
                desc:document.querySelector(domStrings.desc).value
            };
        },
        domStrings:function(){
            return domStrings;
        },
        displayData:function(Obj,type){
            var element,html,newHTML;
            if(type==='inc'){
                element=domStrings.inc;
                html='<div class="item clearfix" id="inc-%id%"><div class="item__description">%desc%</div><div class="right clearfix"><div class="item__value">%val%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            } else if (type==='exp') {
                element=domStrings.exp;
                html='<div class="item clearfix" id="exp-%id%"><div class="item__description">%desc%</div><div class="right clearfix"><div class="item__value">%val%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            newHTML = html.replace("%id%",Obj.id);
            newHTML = newHTML.replace("%desc%",Obj.description);
            newHTML = newHTML.replace("%val%",formatNumber(Obj.value,type));
            document.querySelector(element).insertAdjacentHTML('beforeend',newHTML);
        },
        displayBudget:function(bdgt){
            var type;
           if (bdgt.bdgt>0){
               type = "inc"
           } else {
               type = "exp"
           };
            console.log(type);
            document.querySelector(domStrings.incLabel).textContent = formatNumber(bdgt.inc,"inc");
            document.querySelector(domStrings.expLabel).textContent = formatNumber(bdgt.exp,"exp");
            document.querySelector(domStrings.bdgtLabel).textContent = formatNumber(bdgt.bdgt,type);
            
            if(bdgt.pct > 0){
                document.querySelector(domStrings.pctLabel).textContent = bdgt.pct+"%"
            } else {
                document.querySelector(domStrings.pctLabel).textContent ="-----"
            }
            
        },
        showPercentage:function(percentage){
            var fields;
            fields = document.querySelectorAll(domStrings.percentage);
                nodeListForEach(fields, function(current, index) {
                
                if (percentage[index] > 0) {
                    current.textContent = percentage[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });
 
        },
        changeClr:function(){
          var fields;
            fields = document.querySelectorAll(domStrings.type+","+domStrings.val+","+domStrings.desc);
            nodeListForEach(fields,function(cur){
               cur.classList.toggle('red-focus'); 
            });
            document.querySelector(domStrings.btn).classList.toggle('red');
        },
        showDate:function(){
            var now,month,months,year;
            now = new Date();
            months = ['January','February','March','April','May','June','July','August','September','October','November','December']
            year = now.getFullYear();
            month = now.getMonth();
            document.querySelector(domStrings.Date).textContent = months[month]+" "+year;
        },
        clearFields:function(){
            var fields,fieldsArr;
            fields = document.querySelectorAll(domStrings.val+','+domStrings.desc);
            fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr.forEach(function(cur,index,array){
               cur.value=""; 
            });
            fieldsArr[0].focus();
        },
        removeBudget:function(selectorID){
            var el;
            el =document.getElementById(selectorID)
            el.parentNode.removeChild(el);
        }
    }
    
})();

var controller =(function(bdgtCtrl,uiCtrl){
var setUpEventListener = function(){
    var DOM;
    DOM=uiCtrl.domStrings();
    document.querySelector(DOM.btn).addEventListener('click',addCtrlItem);
    document.addEventListener('keypress',function(event){
       if(event.keyCode===13||event.which===13) {
           addCtrlItem();
       } 
    });
    document.querySelector(DOM.container).addEventListener('click',deleteCtrlItem);
    document.querySelector(DOM.type).addEventListener('change',uiCtrl.changeClr);
};
var updateBudget = function(){
 var budget;
 bdgtCtrl.addBudget();    
 budget = bdgtCtrl.getBudget();
 uiCtrl.displayBudget(budget);
  }
var updatePercentage = function(){
  var percentages;
  bdgtCtrl.calcPercentage();
  percentages = bdgtCtrl.getPercentage(); 
    console.log(percentages);
  uiCtrl.showPercentage(percentages);
};
var addCtrlItem = function(){
    var input,newItem;
    input = uiCtrl.getInput();
    if(input.desc !==""&&!isNaN(input.val)&&input.val >0) {   
    newItem = bdgtCtrl.addItems(input.type,input.val,input.desc);
    uiCtrl.displayData(newItem,input.type);
    uiCtrl.clearFields();
    updateBudget(); 
    updatePercentage();    
    }

}
var deleteCtrlItem = function(event) {
    var item,splitID,type,ID;
    item = event.target.parentNode.parentNode.parentNode.parentNode.id;
    splitID = item.split("-");
    type=splitID[0];
    ID=Number(splitID[1]);
    bdgtCtrl.deleteItems(type,ID);
    uiCtrl.removeBudget(item);
    updateBudget(); 
    updatePercentage();  
    
}
return {
    init:function(){
        uiCtrl.showDate();
        setUpEventListener();
        uiCtrl.displayBudget({
            inc:0,
             exp:0,
             bdgt:0,
             pct:0
        });
        console.log("The App has started successfully.");
    }
}
})(budgetController,uiController);

controller.init();






