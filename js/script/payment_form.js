function payment_form(){}
payment_form.NAME         = "payment_form";
payment_form.VERSION      = "1.2";
payment_form.DESCRIPTION  = "Class payment_form";

payment_form.prototype.constructor = payment_form;
payment_form.prototype = {
    init:function(){
        $('#form-payment #pay_date').datetimepicker({
            formatDate: 'Y-m-d H:i:s',
            lang: 'en'
        });

        $("#form-payment #pay_amount").keypress(function (e) {
            var str1 = $(this).val();
            var ch = (str1.split(".").length - 1);
            var length = str1.length;
            if (length < 1 && e.which == 46) {
                return false;
            }
            if (ch > 0 && e.which == 46) {
                return false;
            }
            if (e.which != 8 && e.which != 0 && e.which != 46 && (e.which < 48 || e.which > 57)) {
                if (e.keyCode === 13) {

                }
                return false;
            }

        });

    },
    /***********************************/
    get_info_form_payment:function(task_id){
        var data ={
            token:_token,
            task_id:task_id,
            jwt: localStorage.getItemValue('jwt'),
            private_key: localStorage.getItemValue('userID')
        }
        var _link =link._task_driver_info_id;
        $.ajax({
            "async": false,
            "crossDomain": true,
            "url": _link,
            "method": "POST",
            dataType: 'json',
            data:data,
            error : function (status,xhr,error) {
            },
            success: function (data){
                if(data.ERROR ==''){
                    var tr =
                        '<tr class="text-center">' +
                        '<td>'+data.info_payment.taskName+'</td>' +
                        '<td>'+data.info_payment.product_sku+'</td>' +
                        '<td>'+data.info_payment.prod_name+'</td>' +
                        '<td class="total-to-pay">'+numeral(data.info_payment.driver_total).format('$ 0,0.00')+'</td>' +
                        '</tr>'+
                        '<tr class="text-center">' +
                            '<td colspan="2"></td>' +
                            '<td  class="text-right">Paid total</td>' +
                            '<td class="paid-total"></td>' +
                            '</tr>'+
                            '<tr class="text-center">' +
                            '<td colspan="2"></td>' +
                            '<td  class="text-right">Payment amount</td>' +
                            '<td class="payment-amount"></td>' +
                            '</tr>'
                    $('#tb-need-pay-driver tbody').html(tr)
                    var div =''
                    if(data.info_payment.total_payment !=null){
                       var payment_amount = parseFloat(data.info_payment.driver_total) - parseFloat(data.info_payment.total_payment)
                        if(parseFloat(data.info_payment.driver_total) > (parseFloat(data.info_payment.total_payment))){
                            div = '<div class="col col-12 text-right" id="need-btn-payment">' +
                                '<div class="btn btn-primary btn-sm pay-to-driver">Payment</div>' +
                                '</div>'
                        }
                    }else{
                        div = '<div class="col col-12 text-right" id="need-btn-payment">' +
                            '<div class="btn btn-primary btn-sm pay-to-driver">Payment</div>' +
                            '</div>'
                    }

                    $('#tb-info-driver').append(div)
                    $('#tb-info-driver .pay-to-driver').unbind('click').bind('click',function(){
                        var total_pay = $('#tb-info-driver .payment-amount').text()
                        $('#form-pay-to-drriver #pay_amount').val(total_pay)
                        $('#modal-pay-to-driver').modal('show')
                    });
                }
            }
        })
    },
    /***********************************/
    show_payment:function(pay_to,form_id,is_pay_sale,$me,order_id){
        $('#modal-pay-to-salesperson').modal("show")

        $('#modal-pay-to-salesperson .btn-sale-payment').unbind('click').bind('click',function(){
            payment_form.prototype.new_payment(pay_to,form_id,is_pay_sale,$me,order_id)
        });
    },
    /***********************************/
    new_payment:function(pay_to,form_id,is_pay_sale,$me,order_id){
       var is_pay_to =0;
        var data ={
            token:_token,
            jwt: localStorage.getItemValue('jwt'),
            submit_by: localStorage.getItemValue('userID'),
            pay_task:form_id,
            pay_driver:pay_to,
            pay_date:$('#form-payment #pay_date').val(),
            pay_amount:numeral($('#form-payment #pay_amount').val()).value(),
            pay_type:$('#form-payment .radio-pay_type:checked').val(),
            pay_note:$('#form-payment #pay_note').val(),
            transaction:'',
            is_pay_to:is_pay_to
        }
        var _link =link._pay_driver;
        if (is_pay_sale =='pay_sale'){
            is_pay_to =1;
            var data ={
                token:_token,
                jwt: localStorage.getItemValue('jwt'),
                submit_by: localStorage.getItemValue('userID'),
                pay_form:form_id,
                pay_to:pay_to,
                pay_date:$('#form-payment #pay_date').val(),
                pay_amount:numeral($('#form-payment #pay_amount').val()).value(),
                pay_type:$('#form-payment .radio-pay_type:checked').val(),
                pay_note:$('#form-payment #pay_note').val(),
                transaction:'',
                is_pay_to:is_pay_to
            }
        }

        $.ajax({
            "async": true,
            "crossDomain": true,
            "url": _link,
            "method": "POST",
            dataType: 'json',
            data:data,
            error : function (status,xhr,error) {
            },
            success: function (data){
                if(data.ERROR ==''){
                    if (is_pay_sale =='pay_sale'){
                        payment_form.prototype.get_payment_form_id(form_id,is_pay_sale,$me)
                    }else{
                        orders_list.prototype.display_order_row(order_id,$me);
                    }
                    $('#modal-pay-to-salesperson').modal('hide')
                }

            }
        })
    },
    /***********************************/
    get_payment_form_id:function(form_id,is_pay_sale,$me){
        var data ={
            token:_token,
            jwt: localStorage.getItemValue('jwt'),
            //submit_by: localStorage.getItemValue('userID'),
            form_id:form_id
        }
        var _link =link._paid_sale_info;
        $.ajax({
            "async": true,
            "crossDomain": true,
            "url": _link,
            "method": "POST",
            dataType: 'json',
            data:data,
            error : function (status,xhr,error) {
            },
            success: function (res){
                var data =res.info_payment
                data.salesperson_amount =(data.salesperson_amount !=null && data.salesperson_amount !='')?data.salesperson_amount:0
                data.salesperson_paid =(data.salesperson_paid !=null && data.salesperson_paid !='')?data.salesperson_paid:0
                var div1=''
                div1 +='<div class="salesperson-view" style="margin-bottom: 5px; cursor: pointer">'+
                    '<div class="col col-12">' +
                    '<input type="hidden" class="salesperson" value="'+data.SID+'">'+data.s_name+'</div>' +
                    '<div class="col col-12" ><input type="hidden" class="salesperson_amount" value="'+parseFloat(data.salesperson_amount)+'"> Pay salesperson: '+numeral(parseFloat(data.salesperson_amount)).format('$ 0,0.00')+'</div>' +
                    '<div class="col col-12 c-red"><input type="hidden" class="salesperson_paid" value="'+parseFloat(data.salesperson_paid)+'">Paid: ('+numeral(parseFloat(data.salesperson_paid)).format('$ 0,0.00')+')</div>' +
                    '</div>'

                if(parseFloat(data.salesperson_amount) > parseFloat(data.salesperson_paid)){
                    div1 +=  '<div style="margin-top:5px">' +
                        '<button class="btn btn-danger btn-sm salesperson-pay">Payment</button>' +
                        '</div>'
                }

                if($me !=''){
                    $me.closest('td').html(div1)
                }
            }
        })
    },
    /***********************************/
    payment_form_reset: function(){
        $('#form-payment #pay_amount').val('')
        $('#form-payment #pay_date').val('')
        $('#form-payment #pay_note').val('')

    }
 }

var pyment= new payment_form();
$(function(){
    pyment.init();
});
