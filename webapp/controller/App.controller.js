sap.ui.define(
    [
        "sap/ui/core/mvc/Controller"
    ],
    function(BaseController) {
      "use strict";
  
      return BaseController.extend("logaligroup.logali.controller.App", {
        onInit: function() {
          
          var oView = this.getView()
          // var i18nBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle()
          var oJSONModelEmpl = new sap.ui.model.json.JSONModel()
          oJSONModelEmpl.loadData("./localService/mockdata/Employees.json", false)
          oView.setModel(oJSONModelEmpl, "jsonEmployee")

          var oJSONModelCount = new sap.ui.model.json.JSONModel()
          oJSONModelCount.loadData("./localService/mockdata/Countries.json", false)
          oView.setModel(oJSONModelCount, "jsonCountries")

          
          var oJSONModelLayout = new sap.ui.model.json.JSONModel()
          oJSONModelLayout.loadData("./localService/mockdata/Layout.json", false)
          oView.setModel(oJSONModelLayout, "jsonLayout")

          var oJSONModelConfig = new sap.ui.model.json.JSONModel({
              visibleId: true,
              visibleName: true,
              visibleCountry: true,
              visibleCity: false,
              visiblebtnshowCity: true,
              visiblebtnhideCity: false
          })
          oView.setModel(oJSONModelConfig, "jsonConfig")

          this._bus =  sap.ui.getCore().getEventBus();
          this._bus.subscribe("Home", "showEmployee", this.showEmployeeDetails, this)
        },

        showEmployeeDetails: function (category, nameEvent, path){
          
          var detailView = this.getView().byId("employeedetailsView")
          detailView.bindElement("jsonEmployee>" + path)
          var oJsonLayout = this.getView().getModel("jsonLayout")
          oJsonLayout.setProperty("/ActiveKey", "TwoColumnsMidExpanded")
        }
      });
    }
  );
  