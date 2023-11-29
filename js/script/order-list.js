function OrderList() { }
OrderList.NAME         = "OrderList";
OrderList.VERSION      = "1.2";
OrderList.DESCRIPTION  = "Class OrderList";
OrderList.prototype.constructor = OrderList;
OrderList.prototype = {
    init:function(){
        OrderList.prototype.get_order('','','','','','#pagination_tbl-order','#tbl-order tbody');

        $('#order-list-content .btn-search').unbind('click').bind('click',function(){
            var closest = $(this).closest('.order-content')
            var from_date = closest.find('.from-date').val()
            var to_date = closest.find('.to-date').val()
            var text_search = closest.find('.text-search').val()
            var status = ''
            var line_num = closest.find('.line-nuber').val()

            var paginator_el ='#pagination_tbl-order'
            var tbl_el = '#tbl-order tbody'
            OrderList.prototype.get_order(from_date,to_date,status,line_num,text_search,paginator_el,tbl_el);
        });

        $('#order-list-content .btn-excell').unbind('click').bind('click',function(){
            var closest = $(this).closest('.order-content')
            var from_date = closest.find('.from-date').val()
            var to_date = closest.find('.to-date').val()
            var text_search = closest.find('.text-search').val()
            var status = ''
            OrderList.prototype.down_load_report(from_date,to_date,text_search,status);
        });
    },
    /***********************************/
    get_order:function(from_date,to_date,status,line_num,text_search,pagination_el,tbl_el){
        $('.order-content .total-record').val(0)
        var _link =link._order_report;
        var _data ={token:_token,from_date:from_date,
            to_date:to_date,
            status:'',
            text_search:text_search,
            limit:1,cursor:0
        }
        if(line_num =='') line_num =10

        if($(pagination_el).data("twbs-pagination")) $(pagination_el).twbsPagination('destroy');
        var $pagination = $(pagination_el);
        var defaultOpts = {
            totalPages: 20
        };
        $pagination.twbsPagination(defaultOpts);

        $.ajax({
            "async": true,
            "crossDomain": true,
            "url": _link,
            "method": "POST",
            data:_data,
            dataType: 'json',
            error : function (status,xhr,error) {
            },
            success: function (data) {
                var totalRecords = parseInt(data.row_cnt);
                if(totalRecords == 0) return;
                total_records = totalRecords;
                var remaining = 0
                if(totalRecords%line_num >0) remaining=1;

                var totalPages = remaining + (totalRecords -totalRecords%line_num)/line_num;

                var currentPage = $pagination.twbsPagination('getCurrentPage');
                $pagination.twbsPagination('destroy');
                $pagination.twbsPagination($.extend({}, defaultOpts, {
                    startPage: currentPage,
                    totalPages: totalPages,
                    visiblePages: 10,
                    onPageClick:function (event, page) {
                        //fetch content and render here
                        var cursor = (page-1)*line_num
                        var _data ={token:_token,from_date:from_date,
                            to_date:to_date,
                            status:'',
                            text_search:text_search,
                            limit:line_num,cursor:cursor
                        }

                        $.ajax({
                            "async": true,
                            "crossDomain": true,
                            "url": _link,
                            data:_data,
                            "method": "POST",
                            dataType: 'json',

                            error : function (status,xhr,error) {
                            },
                            success: function (res) {
                                if(res.list==undefined) return
                                if(res.list.length > 0){
                                    var tr =  OrderList.prototype.show_order(res.list,pagination_el)
                                    $(tbl_el).html(tr)
                                    $('.order-content .total-record').val(total_records)
                                }
                            }
                        });//end ajax get appointment at current page
                    } //end onPageClick
                }));
                //
            }
        });

    },
    /***********************************/
    show_order:function(data,el){
        var tr ='';
        data.forEach(function(item){
            var order_title_link ='<a target="_blank" href="#ajax/order-form.php?id='+item.order_id+'">'+item.order_title+'</a>'+
                '<input type="hidden" class="order-id" value="'+ item.order_id +'">'

            var bill_to = '<a href="./#ajax/contact-form.php?id=' + item.b_ID + '" target="_blank">' + item.b_name + '</a>'

            var div1_sale=''
            if(item.s_ID !=null && item.s_ID !='' && item.s_ID !=0){
                item.salesperson_amount =(item.salesperson_amount !=null && item.salesperson_amount !='')?item.salesperson_amount:0
                item.salesperson_total_payment =(item.salesperson_total_payment !=null && item.salesperson_total_payment !='')?item.salesperson_total_payment:0

                div1_sale +='<div class="salesperson-view" style="margin-bottom: 5px; cursor: pointer">'+
                    '<div class="col col-12">' +
                    '<input type="hidden" class="salesperson" value="'+item.s_ID+'">'+item.s_name+'</div>' +
                    '<div class="col col-12" ><input type="hidden" class="salesperson_amount" value="'+parseFloat(item.salesperson_amount)+'"> Pay salesperson: '+numeral(parseFloat(item.salesperson_amount)).format('$ 0,0.00')+'</div>' +
                    '<div class="col col-12 c-red"><input type="hidden" class="salesperson_paid" value="'+parseFloat(item.salesperson_total_payment)+'">Paid: ('+numeral(parseFloat(item.salesperson_total_payment)).format('$ 0,0.00')+')</div>' +
                    '</div>'

                if(parseFloat(item.salesperson_amount) > parseFloat(item.salesperson_total_payment)){
                    div1_sale +=  '<div style="margin-top:5px; margin-left: 15px">' +
                        '<button class="btn btn-danger btn-sm salesperson-pay">Payment</button>' +
                        '</div>'
                }
            }
            var div_container ='<div>'+
                '<div class="col col-12">'+item.quote_temp_prod_SKU+'</div>' +
                '<div class="col col-12">Price: '+numeral(item.quote_temp_container_rate).format('$ 0,0.00') +'</div>' +
                '<div class="col col-12 c-red">Cost: ('+numeral(item.container_cost).format('$ 0,0.00') +')</div>' +
                '</div>'

            var driver_div =''
            if(item.assign_task_id !=null){
                if(item.assign_task_driver_id !=null){
                       item.driver_total_payment =(item.driver_total_payment !=null)? parseFloat(item.driver_total_payment):0
                       var addtion_div =''
                       if(parseFloat(item.assign_task_driver_total) - item.driver_total_payment > 0){
                           var need_pay =parseFloat(item.assign_task_driver_total) - item.driver_total_payment
                       addtion_div =
                           '<div style="margin-top:5px; margin-left: 15px">' +
                           '<button class="btn btn-danger btn-sm driver-pay"' +
                               'pay_amount="'+need_pay+'" ' +
                               'driver="'+item.assign_task_driver_id+'">Payment</button>' +
                           '</div>'
                   }
                    driver_div ='<div class="task-id-show" style="cursor: pointer">'+
                            '<input type="hidden" class="task-id" value="'+item.assign_task_id+'">'+
                            '<div class="col col-12">'+item.assign_task_driver_name+'</div>' +
                            '<div class="col col-12">'+item.assign_task_product_sku+'</div>' +
                            '<div class="col col-12">Delivery: '+numeral(item.assign_task_driver_total).format('$ 0,0.00')+'</div>' +
                            '<div class="col col-12 c-red">Paid: ('+numeral(item.driver_total_payment).format('$ 0,0.00')+')</div>'+
                        '</div>' +addtion_div
                }else{
                    driver_div='<div style="margin-top:5px; margin-left: 15px">' +
                        '<button class="btn btn-danger btn-sm edit-task" task_id ="'+item.assign_task_id+'">Add driver</button>' +
                        '</div>'
                }

            }else{
                driver_div='<div style="margin-top:5px; margin-left: 15px">' +
                    '<button class="btn btn-danger btn-sm add-task">Add driver</button>' +
                    '</div>'
            }

            item.payment =(item.payment !=null && item.payment !='')? parseFloat(item.payment):0;
            var balance = parseFloat(item.total) - item.payment
            balance = numeral(balance).format('$ 0,0.00')
            var total = numeral(item.total).format('$ 0,0.00')
            total ='<a target="_blank" href="#ajax/invoice-form.php?id='+item.inv_id+'">'+total+'</a>'
            var payment = numeral(item.payment).format('$ 0,0.00')
            payment ='<a  target="_blank" href="#ajax/invoice-form.php?id='+item.inv_id+'">'+payment+'</a>'
            var createTime = item.createTime.split(" ")[0]
            tr +='<tr class="clss-row">' +
                '<input type="hidden" class="order-id" value="'+item.order_id+'">' +
                '<td>'+order_title_link+'</td>' +
                '<td>'+bill_to+'</td>' +
                '<td>'+div1_sale+'</td>' +
                '<td>'+div_container+'</td>' +
                '<td>'+driver_div+'</td>' +
                '<td>'+total+'</td>' +
                '<td>'+payment+'</td>' +
                '<td>'+balance+'</td>' +
                '<td>'+createTime+'</td>' +
                '</tr>';
        });
        return tr
    },
    /**********************************/
    down_load_report:function(from_date,to_date,text_search,status){
        $.ajax({
            async: true,
            url: link.order_report,
            type: 'post',
            data: {token:_token,from_date:from_date,to_date:to_date,
                text_search:text_search,status:status},
            dataType: 'json',
            success: function (res) {
                var url_link = document.createElement('a');
                url_link.href = res.url_download_file;
                url_link.download = res.filename;
                //a.dispatchEvent(new MouseEvent('click'));
                document.body.appendChild(url_link);
                url_link.click();
                url_link.parentNode.removeChild(url_link);

                //remove
                $.ajax({
                    url: link.delete_file,
                    type: 'post',
                    data: {filename:res.filename},
                    success: function (res1) {

                    }
                });
                /////
            }
        });

    },
}

var order = new OrderList();
$(function(){
    order.init();
});