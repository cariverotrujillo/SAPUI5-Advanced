sap.ui.define(
  [
    "sap/ui/core/mvc/Controller"
  ],
  function (BaseController) {
    "use strict";

    return BaseController.extend("logaligroup.logali.controller.App", {

      onBeforeRendering: function () {
        this._detailEmployeeView = this.getView().byId("employeedetailsView")
      },

      onInit: function () {

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

        this._bus = sap.ui.getCore().getEventBus();
        this._bus.subscribe("Home", "showEmployee", this.showEmployeeDetails, this)
        this._bus.subscribe("incidence", "onSaveIncidence", this.onSaveIncidence, this)
      },

      showEmployeeDetails: function (category, nameEvent, path) {

        var detailView = this.getView().byId("employeedetailsView")
        detailView.bindElement("odataNorthwind>" + path)
        var oJsonLayout = this.getView().getModel("jsonLayout")
        oJsonLayout.setProperty("/ActiveKey", "TwoColumnsMidExpanded")

        var incidenceModel = new sap.ui.model.json.JSONModel([])
        detailView.setModel(incidenceModel, "incidenceModel")
        detailView.byId("TableIncidence").removeAllContent()
      },
      onSaveIncidence: function (category, nameEvent, data) {

        var oResourceBundle = this.getView().getModel("i18n").getResourceBundle()
        var employeeId = this._detailEmployeeView.getBindingContext("odataNorthwind").getObject().EmployeeID
        var incidenceModel = this._detailEmployeeView.getModel("incidenceModel").getData()


        if (typeof incidenceModel[data.rowIncidence] == 'undefined') {
          var body = {
            SapId: this.getOwnerComponent().SapId,
            employeeId: employeeId.toString(),
            CreationDate: incidenceModel[data.rowIncidence].CreationDate,
            Type: incidenceModel[data.rowIncidence].status,
            Reason: incidenceModel[data.rowIncidence].Reason
          }

          this.getView().getModel("incidenceModel").create("/IncidentsSet", body, {
            success: function () {
              sap.m.MessageToast.show(oResourceBundle.getText("odataSaveOk"))
            }.bind(this),
            error: function (e) {
              sap.m.MessageToast.show(oResourceBundle.getText("odataSaveKO"))
            }.bind(this)
          })
        } else {
          sap.m.MessageToast.show(oResourceBundle.getText("odatanotsave"))
        }
      }

    });
  }
);
