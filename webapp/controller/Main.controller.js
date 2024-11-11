sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
     "sap/m/MessageBox"
  ],
  function (BaseController,  MessageBox) {
    "use strict";

    return BaseController.extend("logaligroup.logali.controller.Main", {

      onBeforeRendering: function () {
        this._detailEmployeeView = this.getView().byId("employeedetailsView")
      },

      onInit: function () {

        var oView = this.getView()
        // var i18nBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle()
        var oJSONModelEmpl = new sap.ui.model.json.JSONModel()
        oJSONModelEmpl.loadData("./model/json/Employees.json", false)
        oView.setModel(oJSONModelEmpl, "jsonEmployee")

        var oJSONModelCount = new sap.ui.model.json.JSONModel()
        oJSONModelCount.loadData("./model/json/Countries.json", false)
        oView.setModel(oJSONModelCount, "jsonCountries")


        var oJSONModelLayout = new sap.ui.model.json.JSONModel()
        oJSONModelLayout.loadData("./model/json/Layout.json", false)
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

        this._bus.subscribe("incidenceDele", "onDeleteIncidence", function(category, nameEvent, data){
          var oResourceBundle = this.getView().getModel("i18n").getResourceBundle()

          this.getView().getModel("incidenceModel").remove("/IncidentsSet(IncidenceId='" + data.IncidenceId +
            "',SapId='" + data.SapId +
            "',EmployeeId='" + data.EmployeeId + "')", {
            success: function () {
              this.onReadIncidence.bind(this)(data.EmployeeId)
              sap.m.MessageToast.show(oResourceBundle.getText("odatadeleteOk"))
            }.bind(this),
            error: function (e) {
              sap.m.MessageToast.show(oResourceBundle.getText("odatadeleteKO"))
            }.bind(this)
          })
        },this)
      },

      showEmployeeDetails: function (category, nameEvent, path) {

        var detailView = this.getView().byId("employeedetailsView")
        detailView.bindElement("odataNorthwind>" + path)
        var oJsonLayout = this.getView().getModel("jsonLayout")
        oJsonLayout.setProperty("/ActiveKey", "TwoColumnsMidExpanded")

        var incidenceModel = new sap.ui.model.json.JSONModel([])
        detailView.setModel(incidenceModel, "incidenceModel")
        detailView.byId("TableIncidence").removeAllContent()

        this.onReadIncidence(this._detailEmployeeView.getBindingContext("odataNorthwind").getObject().EmployeeID)
      },
      onSaveIncidence: function (category, nameEvent, data) {

        var oResourceBundle = this.getView().getModel("i18n").getResourceBundle()
        var employeeId = this._detailEmployeeView.getBindingContext("odataNorthwind").getObject().EmployeeID
        var incidenceModel = this._detailEmployeeView.getModel("incidenceModel").getData()


        if (typeof incidenceModel[data.rowIncidence].IncidenceId == 'undefined') {
          var body = {
            SapId: this.getOwnerComponent().SapId,
            EmployeeId: employeeId.toString(),
            CreationDate: incidenceModel[data.rowIncidence].CreationDate,
            Type: incidenceModel[data.rowIncidence].Type,
            Reason: incidenceModel[data.rowIncidence].Reason
          }

          this.getView().getModel("incidenceModel").create("/IncidentsSet", body, {
            success: function () {
              this.onReadIncidence.bind(this)(employeeId)
              MessageBox.success(oResourceBundle.getText("odataSaveOk"))
             // sap.m.MessageToast.show(oResourceBundle.getText("odataSaveOk"))
            }.bind(this),
            error: function (e) {
              sap.m.MessageToast.show(oResourceBundle.getText("odataSaveKO"))
            }.bind(this)
          })
        } else if (incidenceModel[data.rowIncidence].ReasonX ||
          incidenceModel[data.rowIncidence].CreationDateX ||
          incidenceModel[data.rowIncidence].TypeX) {

          var body = {
            CreationDate: incidenceModel[data.rowIncidence].CreationDate,
            CreationDateX: incidenceModel[data.rowIncidence].CreationDateX,
            Type: incidenceModel[data.rowIncidence].Type,
            TypeX: incidenceModel[data.rowIncidence].TypeX,
            Reason: incidenceModel[data.rowIncidence].Reason,
            ReasonX: incidenceModel[data.rowIncidence].ReasonX
          }
          this.getView().getModel("incidenceModel").update("/IncidentsSet(IncidenceId='" + incidenceModel[data.rowIncidence].IncidenceId +
            "',SapId='" + incidenceModel[data.rowIncidence].SapId +
            "',EmployeeId='" + incidenceModel[data.rowIncidence].EmployeeId + "')", body, {
            success: function () {
              this.onReadIncidence.bind(this)(employeeId)
              sap.m.MessageToast.show(oResourceBundle.getText("odataupdateOk"))
            }.bind(this),
            error: function (e) {
              sap.m.MessageToast.show(oResourceBundle.getText("odataupdateKO"))
            }.bind(this)
          })
        }
        else {
          sap.m.MessageToast.show(oResourceBundle.getText("odatanotsave"))
        }
      },
      onReadIncidence: function (employeeID) {


        this.getView().getModel("incidenceModel").read("/IncidentsSet", {
          filters: [
            new sap.ui.model.Filter("SapId", "EQ", this.getOwnerComponent().SapId),
            new sap.ui.model.Filter("EmployeeId", "EQ", employeeID.toString())
          ],
          success: function (data) {
            var incidenceModel = this._detailEmployeeView.getModel("incidenceModel")
            incidenceModel.setData(data.results)
            var TableIncidence = this._detailEmployeeView.byId("TableIncidence")
            TableIncidence.removeAllContent()

            for (var incidence in data.results) {

              data.results[incidence]._ValidateDate = true
              data.results[incidence].enabledSave = false

              var newIncidence = sap.ui.xmlfragment("logaligroup.logali.fragment.NewIncidence", this._detailEmployeeView.getController())
              this._detailEmployeeView.addDependent(newIncidence)
              newIncidence.bindElement("incidenceModel>/" + incidence)
              TableIncidence.addContent(newIncidence)

            }
          }.bind(this),
          error: function (e) {

          }
        })
      }
    });
  }
);
