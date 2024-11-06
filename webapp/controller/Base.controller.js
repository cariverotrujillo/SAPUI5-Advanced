sap.ui.define(
    [
      "sap/ui/core/mvc/Controller"
    ],
    function (Controller) {
      "use strict";
  
      return Controller.extend("logaligroup.logali.controller.Base", {
  
  
        onInit: function () {
  
    
        },
        toOrderDetails: function (oEvent){
            var OrderID =  oEvent.getSource().getBindingContext("odataNorthwind").getObject().OrderID
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this)
            oRouter.navTo("RouteOrderDetails", {
                OrderID: OrderID
            })
        }
  
      });
    }
  );