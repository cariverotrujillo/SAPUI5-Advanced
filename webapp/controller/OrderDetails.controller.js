sap.ui.define(
    [
      "sap/ui/core/mvc/Controller",
      "sap/ui/core/routing/History",
      "sap/m/MessageBox",
     "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
    ],
    function (BaseController, History, MessageBox,  Filter, FilterOperator) {
      "use strict";
  
      function _onObjectMarched(oEvent){
        this.onClear()
        this.getView().bindElement({
          path: "/Orders(" + oEvent.getParameter("arguments").OrderID + ")",
          model: "odataNorthwind",
          events:{
            dataReceived: function (oData){
              _readSignature.bind(this)(oData.getParameter("data").OrderID, oData.getParameter("data").EmployeeID)
            }.bind(this)
          }
        })
        const ObjectCont = this.getView().getModel("odataNorthwind").getContext("/Orders(" + oEvent.getParameter("arguments").OrderID + ")").getObject()
        if (ObjectCont){
        _readSignature.bind(this)(ObjectCont.OrderID, ObjectCont.EmployeeID)
      }
      }

      function _readSignature (orderId, EmployeeId){
        this.getView().getModel("incidenceModel").read("/SignatureSet(OrderId='" + orderId + "',SapId='" + this.getOwnerComponent().SapId + 
                                                       "',EmployeeId='" + EmployeeId + "')", {
          success: function (data) {
              let signature = this.getView().byId("signature")
              if (data.MediaContent !== ""){
              signature.setSignature("data:image/png;base64," + data.MediaContent) 
            }  
          }.bind(this),
          error: function (e) {

          }
        })
        let uploadread = this.byId("uploadSet")
        uploadread.bindAggregation("items", {
          path: 'incidenceModel>/FilesSet',
          filters:[
            new Filter("OrderId", FilterOperator.EQ, orderId),
            new Filter("SapId", FilterOperator.EQ, this.getOwnerComponent().SapId),
            new Filter("EmployeeId", FilterOperator.EQ, EmployeeId),
          ],
          template: new sap.m.upload.UploadSetItem({
            fileName: "{incidenceModel>fileName}",
            mediaType:"{incidenceModel>MimeType}",
            visibleEdit: false
          })
        })


        
      }

      return BaseController.extend("logaligroup.logali.controller.OrderDetails", {
  
  
        onInit: function () {
  
          var oRouter = sap.ui.core.UIComponent.getRouterFor(this)
          oRouter.getRoute("RouteOrderDetails").attachPatternMatched(_onObjectMarched, this)
        },
        onBack: function(){
          var oHistory = History.getInstance()
          var sPreviousHash = oHistory.getPreviousHash()
          if (sPreviousHash !== undefined){
            window.history.go(-1)
          }else{
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this)
            oRouter.navTo("RouteMain", true)
          }
        },
        onClear: function(oEvent){
          var signature = this.byId("signature")
          signature.clear()

        },
        factoryOrderDetails: function(listid, oContext){
          var contextObject = oContext.getObject()
          contextObject.Currency = "EUR"
          var unitsInStock = oContext.getModel().getProperty("/Products(" + contextObject.ProductID + ")/UnitsInStock")

          if (contextObject.Quantity <= unitsInStock){
            var objectListItem = new sap.m.ObjectListItem({
              title: "{odataNorthwind>/Products(" + contextObject.ProductID + ")/ProductName} ({odataNorthwind>Quantity})",
              number: "{parts:  [ {path: 'odataNorthwind>UnitPrice'}, {path: 'odataNorthwind>Currency'}], type: 'sap.ui.model.type.Currency', formatOptions: {showMeasure: 'false'}}",
              numberUnit: "{odataNorthwind>Currency}"
            })
            return objectListItem
          }else{
            var customListItem = new sap.m.CustomListItem({
              content: [
              new sap.m.Bar({  contentLeft: new sap.m.Label ({ text:"{odataNorthwind>/Products(" + contextObject.ProductID + ")/ProductName} ({odataNorthwind>Quantity})" }),
                                contentMiddle: new sap.m.ObjectStatus ({text: "{i18n>AvailableStock} {odataNorthwind>/Products(" + contextObject.ProductID + ")/UnitsInStock}", state: "Error"}),
                                contentRight: new sap.m.Label ({ text: "{parts:  [ {path: 'odataNorthwind>UnitPrice'}, {path: 'odataNorthwind>Currency'}], type: 'sap.ui.model.type.Currency'}"})
              })
              ]
            })
            return customListItem
          }
        },
        onSaveSig : function(oEvent){
          const signature = this.byId("signature")
          let oResourceBundle = this.getView().getModel("i18n").getResourceBundle()
          let signaturePng
          if (!signature.isFill()){
            MessageBox.error(oResourceBundle.getText("ErrorSaveSig"))
          }else{
            signaturePng = signature.getSignature().replace("data:image/png;base64,", "")
            let orderObject = oEvent.getSource().getBindingContext("odataNorthwind").getObject()
            let body = {
              OrderId: orderObject.OrderID.toString(),
              SapId: this.getOwnerComponent().SapId,
              EmployeeId: orderObject.EmployeeID.toString(),
              MimeType: "image/png",
              MediaContent: signaturePng
            } 
            this.getView().getModel("incidenceModel").create("/SignatureSet", body, {
              success: function () {
                MessageBox.success(oResourceBundle.getText("odataSaveOk"))
               // sap.m.MessageToast.show(oResourceBundle.getText("odataSaveOk"))
              },
              error: function (e) {
                sap.m.MessageToast.show(oResourceBundle.getText("odataSaveKO"))
              }
            })
          }
        },
        onFileBeforeUpload : function(oEvent){
          let oItem = oEvent.getParameter("item")
          let fileName = oItem.getFileName()
          let objcontext = oEvent.getSource().getBindingContext("odataNorthwind").getObject()
          let OCostumerHeaderSlug = new sap.ui.core.Item({
            key: "Slug",
            text:  objcontext.OrderID + ";" + this.getOwnerComponent().SapId + ";" + objcontext.EmployeeID + ";" + fileName
          })
          let OCostumerHeaderToken = new sap.ui.core.Item({
            key: "X-CSRF-Token",
            text: this.getView().getModel("incidenceModel").getSecurityToken()
          })
          oItem.addHeaderField(OCostumerHeaderToken)
          oItem.addHeaderField(OCostumerHeaderSlug)
        },
        onFileUploadComplete: function (oEvent){
          oEvent.getSource().getBinding("items").refresh()
        },
        onFileDelected : function(oEvent){
          var uploadset = oEvent.getSource()
          var sPath = oEvent.getParameter("item").getBindingContext("incidenceModel").getPath()
          this.getView().getModel("incidenceModel").remove(sPath,{
            success: function (){
              uploadset.getBinding("items").refresh()
            },
            error: function (){

            }
        })
        },
        onFileDownload: function(){
          let uploadSet = this.byId("uploadSet")
          let oResourceBundle = this.getView().getModel("i18n").getResourceBundle()
          let items = uploadSet.getSelectedItems()

          if (items.length === 0){
            MessageBox.error(oResourceBundle.getText("ErrorFileDel"))
          }else{
            items.forEach((oitem) => {
              let OBindingContext = oitem.getBindingContext("incidenceModel"),
              sPath = OBindingContext.getPath()
              window.open("/sap/opu/odata/sap/YSAPUI5_SRV_01" + sPath + "/$value")
            });
          }

        }

  
      });
    }
  );
  