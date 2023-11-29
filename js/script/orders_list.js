
function orders_list(){
    this.this_row =''
}
orders_list.NAME         = "orders_list";
orders_list.VERSION      = "1.2";
orders_list.DESCRIPTION  = "Class orders_list";

orders_list.prototype.constructor = orders_list;
orders_list.prototype = {
    init:function(){
        modal_user_select2_el('#assign-driver-modal #driver-id','#assign-driver-modal',link._driverSearch)

        $('#order-list-content .datepicker').datepicker({
            dateFormat: 'yy-mm-dd',
            changeMonth: true,
            changeYear: true,
            showOtherMonths: true,
            prevText: '<i class="fa fa-chevron-left"></i>',
            nextText: '<i class="fa fa-chevron-right"></i>'
        });

        $('#order-list-content').on('click','.add-task',function(){
            orders_list.prototype.this_row =''
            orders_list.prototype.this_row=$(this);
            orders_list.prototype.reset_task();
            var order_id = $(this).closest('tr').find('.order-id').val();
            $('#task-modal').modal("show")
            orders_list.prototype.order_for_task(order_id)
        });

        $('#order-list-content').on('click','.task-id-show',function(){
            orders_list.prototype.this_row=$(this);
            orders_list.prototype.reset_task();
            var task_id = $(this).closest('tr').find('.task-id').val();
            window.open(
                host2 + '#ajax/task.php?id='+task_id,
                '_blank'
            );
        });

        $('#order-list-content').on('click','.salesperson-view',function(){
            $('.modal').modal('hide');
            var c_id = $(this).closest('tr').find('.salesperson').val();
            window.open(
                host2 + '#ajax/contact-form.php?id='+c_id,
                '_blank'
            );
        });

        $('#order-list-content').on('click','.salesperson-pay',function(){
            orders_list.prototype.this_row =''
            orders_list.prototype.this_row=$(this);
            payment_form.prototype.payment_form_reset()
            var order_id = $(this).closest('tr').find('.order-id').val();
            var c_id = $(this).closest('tr').find('.salesperson').val();
            var salesperson_amount = $(this).closest('tr').find('.salesperson_amount').val();
            var salesperson_paid = $(this).closest('tr').find('.salesperson_paid').val();
            var payment = parseFloat(salesperson_amount) - parseFloat(salesperson_paid)
            payment = numeral(payment).format('$ 0,0.00')
            $('#form-payment #pay_amount').val(payment)

            payment_form.prototype.show_payment(c_id,order_id,'pay_sale',$(this))
        });

        $('#order-list-content').on('click','.driver-pay',function(){
            payment_form.prototype.payment_form_reset()
            var order_id = $(this).closest('tr').find('.order-id').val();
            var pay_task = $(this).closest('td').find('.task-id').val();
            var pay_driver = $(this).attr('driver');
            var pay_amount = $(this).attr('pay_amount');
            pay_amount = numeral(pay_amount).format('$ 0,0.00')
            $('#form-payment #pay_amount').val(pay_amount)

            payment_form.prototype.show_payment(pay_driver,pay_task,'pay_driver',$(this),order_id)
        });

        $('#close-modal-task').unbind('click').bind('click',function(){
            $('.modal').modal('hide');
            $('#TaskForm').trigger('reset');
        });

        $('#order-list-content').on('click','.edit-task',function(){
            orders_list.prototype.this_row =''
            orders_list.prototype.this_row =$(this)
            var that = $(this)
            common_f.prototype.reset_driver_modal()
            var task_id = $(this).attr("task_id")

            orders_list.prototype.get_task(task_id,that)
        });
    },
    /***********************************/
    display_order_row:function(order_id,$me){
        var _formData = {
            token: localStorage.getItemValue('token'),
            jwt: localStorage.getItemValue('jwt'),
            private_key: localStorage.getItemValue('userID'),
            order_id:order_id
        }
        var _link =link._driverpaid_sku;
        $.ajax({
            "async": true,
            "crossDomain": true,
            "url": _link,
            "method": "POST",
            dataType: 'json',
            data:_formData,
            error : function (status,xhr,error) {
            },
            success: function (data){
                var div1=''; var sku_length =0
                if(data.driver_paid.length >0){
                    //alway return 1 row
                    data.driver_paid.forEach(function(item){
                        sku_length = item.order_sku.length
                        item.driver_total = (item.driver_total!=null)?parseFloat(item.driver_total):0
                        item.total_paid = (item.total_paid !=null)? parseFloat(item.total_paid):0

                        if(item.driver_total==0){
                            div1 = '<div style="margin-top:5px; margin-left: 15px">' +
                                '<button class="btn btn-danger btn-sm edit-task" task_id ="'+item.task_id+'">Add driver</button>' +
                                '</div>'
                        }else if(item.driver_total > 0 && (item.driver_total - item.total_paid) >0){
                            var need_pay =parseFloat(item.driver_total) - item.total_paid
                            div1 ='<div class="task-id-show" style="cursor: pointer">'+
                                '<input type="hidden" class="task-id" value="'+item.task_id+'">'+
                                '<div class="col col-12">'+item.driver_name+'</div>' +
                                '<div class="col col-12">'+item.product_sku+'</div>' +
                                '<div class="col col-12">Delivery: '+numeral(item.driver_total).format('$ 0,0.00')+'</div>' +

                                '<div class="col col-12 c-red">Paid: ('+numeral(item.total_paid).format('$ 0,0.00')+')</div>' +
                                '</div>' +
                                '<div style="margin-top:5px; margin-left: 15px">' +
                                '<button class="btn btn-danger btn-sm driver-pay" driver="'+item.assign_driver+'" pay_amount="'+need_pay+'">Payment</button>' +
                                '</div>'
                        }else{
                            div1 ='<div class="task-id-show" style="cursor: pointer">'+
                                '<input type="hidden" class="task-id" value="'+item.task_id+'">'+
                                '<div class="col col-12">'+item.driver_name+'</div>' +
                                '<div class="col col-12">'+item.product_sku+'</div>' +
                                '<div class="col col-12">Delivery: '+numeral(item.driver_total).format('$ 0,0.00')+'</div>' +

                                '<div class="col col-12 c-red">Paid: ('+numeral(item.total_paid).format('$ 0,0.00')+')</div>' +
                                '</div>'
                        }
                    });
                }

                if($me !=''){
                    $me.closest('td').html(div1)
                    $me=''
                }else{
                    orders_list.prototype.this_row.closest('td').html(div1)
                    orders_list.prototype.this_row=''
                    $('#task-modal').modal("hide")
                }
            }
        })
    },
    /***********************************/
    order_for_task:function(order_id ){
        var _formData = {
            token: localStorage.getItemValue('token'),
            jwt: localStorage.getItemValue('jwt'),
            private_key: localStorage.getItemValue('userID'),
            order_id:order_id
        }
        var _link =link._order_for_task;
        $.ajax({
            "async": true,
            "crossDomain": true,
            "url": _link,
            "method": "POST",
            dataType: 'json',
            data:_formData,
            error : function (status,xhr,error) {
            },
            success: function (data){
                if(data.order.length >0){
                    data.order.forEach(function(item){
                        var option =''; var sku_list=''
                        if(item.sku_list.indexOf(',')){
                           var temp = item.sku_list.split(',')
                            temp.forEach(function(it1){
                                option +='<option value="'+it1+'">'+it1+'</option>'
                                sku_list =(sku_list=='')?it1:it1+','+it1
                            });
                        }else{
                            option +='<option value="'+item.sku_list+'">'+item.sku_list+'</option>'
                            sku_list=item.sku_list
                        }
                        $('#assign_order').append('<option value="'+item.order_id+'" sku_list ="'+sku_list+'">'+item.order_title+'</option>').trigger('change');
                        $('#product_sku').html(option)
                    });
                }
            }
        })
    },
    /***********************************/
    get_task:function(task_id,$me){
        var _formData = {
            token: localStorage.getItemValue('token'),
            jwt: localStorage.getItemValue('jwt'),
            private_key: localStorage.getItemValue('userID'),
            taskID:task_id
        }
        var _link =link._taskDetail_id;
        $.ajax({
            "async": true,
            "crossDomain": true,
            "url": _link,
            "method": "POST",
            dataType: 'json',
            data:_formData,
            error : function (status,xhr,error) {
            },
            success: function (data){
                if(data.task !=undefined){
                    var item =data.task
                    /*$('#assign-driver-modal #taskName').val(item.taskName)
                    $('#assign-driver-modal #id').val(item.id)
                    $('#assign-driver-modal #customer').val(item.customer_id)
                    $('#assign-driver-modal #createDate').val(item.createDate)
                    $('#assign-driver-modal #sku_list1').val(item.sku_list)
                    */
                    $('#assign-driver-modal #product_sku1').val(item.product_sku)
                    $('#assign-driver-modal #order-edit').val(item.assign_order)

                    $('#assign-driver-modal #task-name').val(item.taskName)
                    $('#assign-driver-modal #driver-id').val('')
                    item.delivery_date = (item.delivery_date !=null && item.delivery_date !='')?item.delivery_date:''
                    var temp = item.delivery_date.split(" ")
                    if(temp.length >1){
                        $('#assign-driver-modal #delivery-date').val(temp[0])
                        $('#assign-driver-modal #delivery-time').val(temp[1])
                    }else if(temp.length ==1) $('#assign-driver-modal #delivery-date').val(temp)
                }

                $('#assign-driver-modal').modal('show');
                $('#assign-driver-modal .datepicker').datepicker({
                    dateFormat: 'yy-mm-dd',
                    changeMonth: true,
                    changeYear: true,
                    showOtherMonths: true,
                    prevText: '<i class="fa fa-chevron-left"></i>',
                    nextText: '<i class="fa fa-chevron-right"></i>'
                });

                var task_name = item.taskName
                var task_id = item.id
                var task_status = item.status
                var task_acction = item.actionset
                var task_content = item.content
                var order = item.assign_order
                var product = item.product_sku

                $('#assign-driver-modal #btn-update-driver').unbind('click').bind('click',function(){
                    orders_list.prototype.update_driver_task($me,task_name,task_id,
                        task_status,task_acction,task_content,
                        order,product)
                });
            }
        })
    },
    /**************************************/
    update_driver_task:function($me,task_name,task_id,
        task_status,task_acction,task_content,
        order,product){
        var that = $me
        var driver = $('#assign-driver-modal #driver-id').val();
        var delivery_date = $('#assign-driver-modal #delivery-date').val();
        var delivery_time = $('#assign-driver-modal #delivery-time').val();

        if(driver ==null){
           $('#assign-driver-modal #driver-err').css({"display":""})
            return
        }
        var _formData = {
            token: localStorage.getItemValue('token'),
            jwt: localStorage.getItemValue('jwt'),
            private_key: localStorage.getItemValue('userID'),
            id:task_id, taskName:task_name,
            status:task_status,actionset:task_acction,
            content:task_content,
            assign_order:order,
            product_sku:product,
            assign_driver_id:driver,
            deliverydate:delivery_date,
            deliverytime:delivery_time
        }
        var _link =link._taskUpdate;
        $.ajax({
            "async": true,
            "crossDomain": true,
            "url": _link,
            "method": "POST",
            dataType: 'json',
            data:_formData,
            error : function (status,xhr,error) {
            },
            success: function (data){
                if(data.SAVE=='SUCCESS'){
                    //console.log('data1= '+that)
                    var driver_name = $('#assign-driver-modal #driver-id option:selected').text()
                    var  driver_div ='<div class="task-id-show" style="cursor: pointer; margin-bottom: 5px">' +
                        '<input type="hidden" class="task-id" value="'+task_id+'">'+
                        '<div class="col col-12">'+driver_name+'</div>' +
                        '<div class="col col-12">'+product+'</div>' +
                        '<div class="col col-12">Delivery: '+numeral(data.driver_total).format('$ 0,0.00')+'</div>' +
                        '</div>'+
                       '<div class="col col-12 c-red">' +
                           '<div style="margin-top:5px; margin-left: 15px">' +
                                '<button class="btn btn-danger btn-sm driver-pay" pay_amount="'+data.driver_total+'" driver="'+driver+'">Payment</button>' +
                           '</div>' +
                       '</div>'

                       that.closest('td').html(driver_div)
                     $('#assign-driver-modal').modal('hide')
                }
            }
        })
    },
    /***********************************/
    reset_task:function(){
        $("input[name=deliverydate]").val('')
        $("input[name=deliverytime]").val('')
        $("input[name=actionset]").val('order')
        $("input[name=status]").val('NEEDS TO BE SCHEDULED')
        $('#assign_order').html('')
        $('#assign_order').val('').trigger("change");
        $('#assign_driver_id').val('').trigger("change");
    }

}

var o_l= new orders_list();
$(function(){
    o_l.init();
});

