sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
    function (Controller) {
        "use strict";
        function check() {
            var inputEmpl = this.byId("inputempl")
            var valueEmpl = inputEmpl.getValue()

            if (valueEmpl.length === 6) {
               // inputEmpl.setDescription("valid id")
               this.byId("country").setVisible(true)
               this.byId("slCountry").setVisible(true)
            }
            else {
                //inputEmpl.setDescription("invalid id")
                this.byId("country").setVisible(false)
                this.byId("slCountry").setVisible(false)
            }
        }
        return Controller.extend("logaligroup.logali.controller.MainView", {
            onInit: function () {

            },
            onValidate: check
        });
    });
