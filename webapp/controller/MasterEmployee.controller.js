sap.ui.define([
    "logaligroup/logali/controller/Base.controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
],
    function (Base, Filter, FilterOperator) {
        "use strict";

        function onInit() {
            this._bus = sap.ui.getCore().getEventBus();
        }
        function onFilter() {
            var oJson = this.getView().getModel("jsonCountries").getData()

            var filter = []
            if (oJson.employeeId !== "") {
                filter.push(new Filter("EmployeeID", FilterOperator.EQ, oJson.employeeId))
            }
            if (oJson.countryKey !== "") {
                filter.push(new Filter("Country", FilterOperator.EQ, oJson.countryKey))
            }

            var oList = this.getView().byId("EmployeeTable")
            var oBinding = oList.getBinding("items")
            oBinding.filter(filter)
        }
        function onClearFilter() {
            var oModel = this.getView().getModel("jsonCountries")
            oModel.setProperty("/employeeId", "")
            oModel.setProperty("/countryKey", "")
            var filter = []
            var oList = this.getView().byId("EmployeeTable")
            var oBinding = oList.getBinding("items")
            oBinding.filter(filter)


        }
        function check() {
            var inputEmpl = this.byId("inputempl")
            var valueEmpl = inputEmpl.getValue()

            if (valueEmpl.length === 6) {
                //inputEmpl.setDescription("valid id")
                this.byId("country").setVisible(true)
                this.byId("slCountry").setVisible(true)
            }
            else {
                //inputEmpl.setDescription("invalid id")
                this.byId("country").setVisible(false)
                this.byId("slCountry").setVisible(false)
            }
        }

        function showPostalCode(oEvent) {
            var item = oEvent.getSource()
            var oContext = item.getBindingContext("jsonEmployee")
            var objectContext = oContext.getObject()

            sap.m.MessageToast.show(objectContext.PostalCode)

        }
        function onShowcity() {
            var oJsonConfig = this.getView().getModel("jsonConfig")
            oJsonConfig.setProperty("/visibleCity", true)
            oJsonConfig.setProperty("/visiblebtnhideCity", true)
            oJsonConfig.setProperty("/visiblebtnshowCity", false)

        }

        function onHideCity() {
            var oJsonConfig = this.getView().getModel("jsonConfig")
            oJsonConfig.setProperty("/visibleCity", false)
            oJsonConfig.setProperty("/visiblebtnshowCity", true)
            oJsonConfig.setProperty("/visiblebtnhideCity", false)
        }

        function showOrders(oEvent) {
            var iconPress = oEvent.getSource()
            var oContext = iconPress.getBindingContext("odataNorthwind")

            if (!this._oDialogOrders) {
                this._oDialogOrders = sap.ui.xmlfragment("logaligroup.logali.fragment.DialogOrders", this)
                this.getView().addDependent(this._oDialogOrders)
            }
            this._oDialogOrders.bindElement("odataNorthwind>" + oContext.getPath())
            this._oDialogOrders.open()



            /*  var orders = this.getView().byId("orders")
             orders.destroyItems()
     
             var item = oEvent.getSource()
             var oContext = item.getBindingContext("odataNorthwind")
             var objectContext = oContext.getObject()
             var ordersTable = objectContext.Orders
     
             var ordersItems = []
     
             for (var i in ordersTable) {
                 ordersItems.push(new sap.m.ColumnListItem({
                     cells: [
                         new sap.m.Label({ text: ordersTable[i].OrderID}),
                         new sap.m.Label({ text: ordersTable[i].Freight}),
                         new sap.m.Label({ text: ordersTable[i].ShipAddress}),
                     ]
                 }))
             }
     
             var newTable = new sap.m.Table({
                 width: "auto",
                 columns: [
                     new sap.m.Column({ header: new sap.m.Label({text: "{i18n>OrderID}"})}),
                     new sap.m.Column({ header: new sap.m.Label({text: "{i18n>Freight}"})}),
                     new sap.m.Column({ header: new sap.m.Label({text: "{i18n>ShipAddress}"})}),
     
                 ],
                 items: ordersItems
             }).addStyleClass("sapUiSmallMargin")
             
             orders.addItem(newTable)
     
            var newTableJSON = new sap.m.Table()
             newTableJSON.setWidth = "auto"
             newTableJSON.addStyleClass("sapUiSmallMargin")
     
             var columnOrderID = new sap.m.Column()
             var labelOrderID = new sap.m.Label()
             labelOrderID.bindProperty("text", "i18n>OrderID" )
             columnOrderID.setHeader(labelOrderID )
             newTableJSON.addColumn(columnOrderID)
             
             var columnFreight = new sap.m.Column()
             var labelFreight = new sap.m.Label()
             labelFreight.bindProperty("text", "i18n>Freight" )
             columnFreight.setHeader(labelFreight )
             newTableJSON.addColumn(columnFreight)
     
             var columnShipAddress = new sap.m.Column()
             var labelShipAddress = new sap.m.Label()
             labelShipAddress.bindProperty("text", "i18n>ShipAddress" )
             columnShipAddress.setHeader(labelShipAddress )
             newTableJSON.addColumn(columnShipAddress)
     
             var columnListItem = new sap.m.ColumnListItem()
     
             var cellOrderID = new sap.m.Label()
             cellOrderID.bindProperty("text", "odataNorthwind>OrderID")
             columnListItem.addCell(cellOrderID)
     
             var cellFreight = new sap.m.Label()
             cellFreight.bindProperty("text", "odataNorthwind>OrderID")
             columnListItem.addCell(cellFreight)
     
             var cellShipAddress = new sap.m.Label()
             cellShipAddress.bindProperty("text", "odataNorthwind>OrderID")
             columnListItem.addCell(cellShipAddress)    
             
             var oBindingInfo = {
                 model: "odataNorthwind",
                 path: "Orders",
                 template: columnListItem
             }
             newTableJSON.bindAggregation("items", oBindingInfo)
             newTableJSON.bindElement("odataNorthwind>" + oContext.getPath())
             
             orders.addItem(newTableJSON) */
        }

        function closeDialog() {
            this._oDialogOrders.close()
        }

        function showEmployee(oEvent) {
            var path = oEvent.getSource().getBindingContext("odataNorthwind").getPath()
            this._bus.publish("Home", "showEmployee", path)
        }


        var main = Base.extend("logaligroup.logali.controller.MasterEmployee", {});
        main.prototype.onInit = onInit;
        // main.prototype.onValidate = check;
        main.prototype.onFilter = onFilter;
        main.prototype.onClearFilter = onClearFilter;
        main.prototype.showPostalCode = showPostalCode;
        main.prototype.onShowcity = onShowcity;
        main.prototype.onHideCity = onHideCity;
        main.prototype.showOrders = showOrders;
        main.prototype.closeDialog = closeDialog;
        main.prototype.showEmployee = showEmployee;
        return main
    });
