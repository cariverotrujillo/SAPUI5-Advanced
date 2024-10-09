sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "../model/formatter"
],
    function (Controller, Filter, FilterOperator, formatter) {
        "use strict";

        function onInit() {
            this._bus = sap.ui.getCore().getEventBus();
        }
        function createIncidence() {
            var tableIncidence = this.getView().byId("TableIncidence")
            var newIncidence = sap.ui.xmlfragment("logaligroup.logali.fragment.NewIncidence", this)
            var incidenceModel = this.getView().getModel("incidenceModel")
            var odata = incidenceModel.getData()
            var index = odata.length
            odata.push({ index: index + 1 })
            incidenceModel.refresh()
            newIncidence.bindElement("incidenceModel>/" + index)
            tableIncidence.addContent(newIncidence)

        }
        function DeleteIcidence(oEvent) {
            var tableIncidence = this.getView().byId("TableIncidence")
            var rowIncidence = oEvent.getSource().getParent().getParent()
            var incidenceModel = this.getView().getModel("incidenceModel")
            var odata = incidenceModel.getData()
            var oContext= rowIncidence.getBindingContext("incidenceModel")

            odata.splice(oContext.index-1, 1)
            for (var i in odata){
                odata[i].index = parseInt(i) + 1
            }
            incidenceModel.refresh()
            tableIncidence.removeContent(rowIncidence)

            for (var j in tableIncidence.getContent()){
                tableIncidence.getContent()[j].bindElement("incidenceModel>/"+j)

            }

        }
        function onSaveIncidence(oEvent){
            
            var incidence = oEvent.getSource().getParent().getParent()
            var rowIncidence = incidence.getBindingContext("incidenceModel")

            this._bus.publish("incidence", "onSaveIncidence", {rowIncidence : rowIncidence.sPath.replace('/','')})

        }
        var main = Controller.extend("logaligroup.logali.controller.EmployeeDetails", {});
        main.prototype.onInit = onInit;
        main.prototype.createIncidence = createIncidence;
        main.prototype.Formatter = formatter;
        main.prototype.DeleteIcidence = DeleteIcidence;
        main.prototype.onSaveIncidence = onSaveIncidence;
        return main
    });